// services/orchestrated-task.service.ts
import { AppDataSource } from "../config/app-data-source";
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { ApiResponse } from '../models/api-response.model';
import { TaskMrs } from '../entities/task_mrs.entity';
import { StatusTasks, StatusWaiting } from '../common/global.enum';
import * as validate from '../utils/ValidationUtils';
import * as lang from '../utils/LangHelper';
import { T1MTaskService } from './task_mrs.service';

import { TaskMrsDetail } from "../entities/task_mrs_detail.entity";
import { TaskMrsLog } from "../entities/task_mrs_log.entity";
import { WaitingTasks } from "../entities/waiting_tasks.entity";
// (ถ้ามี) import { WRSTaskService } from './wrs-task.service';

// services/tasks.service.ts
// tasks.dto.ts
export type CreateTaskItem = {
    waiting_id?: string;
    stock_item: string;
    plan_qty?: string;
    priority?: number;
    type: string;
    store_type: 'T1' | 'T1M';   // ✅ ใช้เลือก service เท่านั้น
    from_location: string
};

export type CreateTaskBatchDto = {
  items: CreateTaskItem[];     // อาร์เรย์เสมอ (แม้มี 1 รายการ)
};

// services/tasks.service.ts
export class OrchestratedTaskService {
    private taskRepository: Repository<TaskMrs>;

    constructor(private t1m: T1MTaskService) {
        this.taskRepository = AppDataSource.getRepository(TaskMrs);
    }

    // ✅ รับเป็น array ของ CreateTaskItem
    async createAndOpenBatch(items: CreateTaskItem[], reqUser: string): Promise<ApiResponse<any>> {
        const res = new ApiResponse<any>();
        if (!items?.length) return res.setIncomplete(lang.msgRequired('field.stock_item'));

        try {
        const results: any[] = [];

        for (const it of items) {
            if (!it.store_type) return res.setIncomplete(lang.msgRequired('field.store_type'));

            // ✅ แยกคลัง: ตอนนี้รองรับเฉพาะ T1M
            if (it.store_type === 'T1M') {
            // if (!it.stock_item.startsWith('M')) {
            //     return res.setIncomplete('T1M รองรับเฉพาะ SKU ที่ขึ้นต้นด้วย "M-"');
            // }

            // แยก field ที่จำเป็นออกมา เพื่อส่งให้ createAndOpen
            const { waiting_id, stock_item, plan_qty, priority, type, from_location } = it;

            const r = await this.t1m.createAndOpen(
                { waiting_id, stock_item, plan_qty, priority, type, from_location},
                reqUser
            );

            if (!r.isCompleted) throw new Error(r.message || 'T1M createAndOpen failed');

            // เก็บผลลัพธ์ พร้อมระบุ store_type เฉยๆ
            results.push({ ...r.data, store_type: 'T1M' });
            }

            // ส่วนอื่น ๆ ของคลัง จะทำทีหลัง
            else {
            return res.setIncomplete(`ไม่รู้จัก store_type: ${it.store_type}`);
            }
        }

        return res.setComplete(lang.msgSuccessAction('created', 'item.task_batch'), { results });
        } catch (e: any) {
        const op = 'OrchestratedTaskService.createAndOpenBatch';
        return res.setError(lang.msgErrorFunction(op, e.message), op, e, reqUser, true);
        }
    }


    // ผู้ใช้ยืนยันหยิบเสร็จ เฉพาะของ T1M
    async confirm(task_id: string, reqUser: string): Promise<ApiResponse<any>> {
        const task = await AppDataSource.getRepository(TaskMrs).findOne({ where: { task_id } });
        if (!task) return new ApiResponse().setIncomplete(lang.msg('validation.not_found'));

        // สำหรับ T1M โดยตรง ไม่ต้องเช็ค store_type
        return this.t1m.closeAfterConfirm(task_id, reqUser);
    }


    // // สถานะรวม (ช่วยให้ controller แสดงผล)
    // async getStatus(task_id: string): Promise<ApiResponse<any>> {
    //     const t = await AppDataSource.getRepository(TaskMrs).findOne({ where: { task_id } });
    //     if (!t) return new ApiResponse().setIncomplete(lang.msg('validation.not_found'));
    //     return new ApiResponse().setComplete('OK', t);
    // }

    //ต้องจอย ทั้ง2คลัง
    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'OrchestratedTaskService.getAll';
    
        try {
            const repository = manager ? manager.getRepository(TaskMrs) : this.taskRepository;
    
            const rawData = await repository
                .createQueryBuilder('task')
                .leftJoin('waiting_tasks', 'waiting', 'task.waiting_id = waiting.waiting_id')
                .select([
                    'task.task_id AS task_id',
                    'task.stock_item AS stock_item',
                    'waiting.waiting_id AS waiting_id',
                    'waiting.from_location AS from_location',
                    'waiting.store_type AS store_type',
                    'task.plan_qty AS plan_qty',
                    'task.status AS status',
                    'task.requested_by AS requested_by',
                    `DATE_FORMAT(task.requested_at, '%d/%m/%Y %H:%i:%s') AS requested_at`,
                ])
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.task'));
            }
    
            return response.setComplete(lang.msgFound('item.task'), rawData);
    
        } catch (error: any) {
            console.error('Error in getAll:', error);
    
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async deleteTask(task_id: string, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'TaskService.deleteTask';

        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;

        if (!useManager) {
            return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }

        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }

        try {
            // 1️⃣ ตรวจสอบ task หลัก
            const taskRepo = useManager.getRepository(TaskMrs);
            const task = await taskRepo.findOne({ where: { task_id } });

            if (!task) {
                return response.setIncomplete(lang.msgNotFound('task.task_id'));
            }

            // ✅ เพิ่มเงื่อนไข status = QUEUED
            if (task.status !== StatusTasks.QUEUED) {
                return response.setIncomplete(lang.msg('validation.only_queued_tasks_can_be_deleted'));
            }

            // 2️⃣ อัปเดต waitingTasks เป็น WAITING
            if (task.waiting_id) {
                const waitingRepo = useManager.getRepository(WaitingTasks);
                await waitingRepo.update({ waiting_id: task.waiting_id }, { status: StatusWaiting.WAITING });
            }

            // 3️⃣ ลบ TaskMrsDetail (task_mrs detail)
            const tmRepo = useManager.getRepository(TaskMrsDetail);
            await tmRepo.delete({ task_id });

            // 4️⃣ ลบ TaskLog
            const logRepo = useManager.getRepository(TaskMrsLog);
            await logRepo.delete({ task_id });

            // 5️⃣ ลบ Task หลัก
            await taskRepo.delete({ task_id });

            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response.setComplete(lang.msgSuccessAction('deleted', 'item.task'));
        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`Error during ${operation}:`, error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }


}

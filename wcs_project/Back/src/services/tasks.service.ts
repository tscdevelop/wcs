// services/orchestrated-task.service.ts
import { AppDataSource } from "../config/app-data-source";
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { ApiResponse } from '../models/api-response.model';
import { Task } from '../entities/tasks.entity';
import { StatusTasks } from '../common/global.enum';
import * as validate from '../utils/ValidationUtils';
import * as lang from '../utils/LangHelper';
import { T1MTaskService } from './task_mrs.service';
// (ถ้ามี) import { WRSTaskService } from './wrs-task.service';

// services/tasks.service.ts
type CreateTaskItem = { sku: string; qty?: string; priority?: number };
type CreateTaskBatchDto = { items: CreateTaskItem[] };

export class OrchestratedTaskService {
    private taskRepository: Repository<Task>;

    constructor(private t1m: T1MTaskService) {
        this.taskRepository    = AppDataSource.getRepository(Task);
    }

    async createAndOpenBatch(dto: CreateTaskBatchDto, reqUser: string): Promise<ApiResponse<any>> {
        const res = new ApiResponse<any>();
        const items = dto.items?.filter(i => i?.sku) ?? [];
        if (!items.length) return res.setIncomplete(lang.msgRequired('field.sku'));

        try {
        const results: any[] = [];
        let batchOrderId: string | undefined;

        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            if (!it.sku.startsWith('M')) return res.setIncomplete('ตอนนี้รองรับเฉพาะ T1M (SKU ขึ้นต้น M-)');

            // ตัวแรก: ไม่ส่ง order_id → ให้ T1M ตั้งจาก task_id ตัวแรกเอง
            const passOrderId = i === 0 ? undefined : batchOrderId;

            // อย่าส่ง manager → ให้ T1M ทำ txn per task เอง
            const r = await this.t1m.createAndOpen(
                { sku: it.sku, qty: it.qty, priority: it.priority, order_id: passOrderId },
                reqUser
            );
            if (!r.isCompleted) throw new Error(r.message || 'createAndOpen failed');

            results.push(r.data);
            if (i === 0) batchOrderId = String(r.data.order_id);
        }

        return res.setComplete(lang.msgSuccessAction('created', 'item.t1m_task'), { order_id: batchOrderId, results });
        } catch (e: any) {
        const op = 'OrchestratedTaskService.createAndOpenBatch';
        return res.setError(lang.msgErrorFunction(op, e.message), op, e, reqUser, true);
        }
    }



    // ผู้ใช้ยืนยันหยิบเสร็จ
    async confirm(task_id: string, reqUser: string): Promise<ApiResponse<any>> {
        const task = await AppDataSource.getRepository(Task).findOne({ where: { task_id } });
        if (!task) return new ApiResponse().setIncomplete(lang.msg('validation.not_found'));

        if (task.store_type === 'T1M') {
        return this.t1m.closeAfterConfirm(task_id, reqUser);
        } else {
        // return this.wrs.returnAfterConfirm(task_id, task_wrs_id);
        return new ApiResponse().setIncomplete('WRS flow ยังไม่ได้ติดตั้ง (stub)');
        }
    }

    // // สถานะรวม (ช่วยให้ controller แสดงผล)
    // async getStatus(task_id: string): Promise<ApiResponse<any>> {
    //     const t = await AppDataSource.getRepository(Task).findOne({ where: { task_id } });
    //     if (!t) return new ApiResponse().setIncomplete(lang.msg('validation.not_found'));
    //     return new ApiResponse().setComplete('OK', t);
    // }

    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'OrchestratedTaskService.getAll';
    
        try {
            const repository = manager ? manager.getRepository(Task) : this.taskRepository;
    
            const rawData = await repository
                .createQueryBuilder('task')
                .select([
                    'task.task_id AS task_id',
                    'task.task_code AS task_code',
                    'task.priority AS priority',
                    'task.store_type AS store_type',
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
}

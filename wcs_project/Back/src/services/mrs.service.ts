import { EntityManager, Not, QueryFailedError, Repository } from "typeorm";
import { AppDataSource } from "../config/app-data-source";
import { ApiResponse } from "../models/api-response.model";
import * as lang from '../utils/LangHelper';
import * as validate from '../utils/ValidationUtils';

import { MRS } from "../entities/mrs.entity";
import { TaskMrs } from "../entities/task_mrs.entity";
import { StatusTasks } from "../common/global.enum";

export class MRSService {
    private mrsRepository : Repository<MRS>;
    private taskRepository : Repository<TaskMrs>;

    constructor(){
        this.mrsRepository = AppDataSource.getRepository(MRS);
        this.taskRepository = AppDataSource.getRepository(TaskMrs);
    }

    // async updateStop(
    //     data: Partial<mrs>,
    //     reqUsername: string,
    //     manager?: EntityManager
    //     ): Promise<ApiResponse<any>> {
    //     let response = new ApiResponse<mrs>();
    //     const operation = 'MRSService.updateStop';

    //     const queryRunner = manager ? null : AppDataSource.createQueryRunner();
    //     const useManager = manager || queryRunner?.manager;

    //     if (!useManager) {
    //         return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
    //     }

    //     if (!manager && queryRunner) {
    //         await queryRunner.connect();
    //         await queryRunner.startTransaction();
    //     }

    //     try {
    //         const repository = useManager.getRepository(mrs);

    //         // ----- Validate -----
    //         if (validate.isNullOrEmpty(data.mrs_id)) {
    //             return response.setIncomplete(lang.msgRequired('mrs.mrs_id'));
    //         }
    //         if (validate.isNullOrEmpty(data.status)) {
    //             return response.setIncomplete(lang.msgRequired('mrs.status'));
    //         }

    //         const existing = await repository.findOneBy({ mrs_id: data.mrs_id! });
    //         if (!existing) {
    //             return response.setIncomplete(lang.msgNotFound('item.mrs'));
    //         }

    //         const validStatuses = Object.values(MRSStatus);
    //         if (!validStatuses.includes(data.status as MRSStatus)) {
    //             return response.setIncomplete(
    //                 lang.msg('validation.enum_invalid', {
    //                 field: 'status',
    //                 allow: validStatuses.join(', ')
    //                 })
    //             );
    //         }

    //         // อัปเดตเฉพาะฟิลด์ที่ตั้งใจจะเปลี่ยน
    //         repository.merge(existing, {
    //             status: data.status as MRSStatus,
    //             update_by: reqUsername,
    //             last_event_at: new Date(),
    //         });

    //         // บันทึก (เป็น update)
    //         const savedData = await repository.save(existing);

    //         // แนะนำ: ใช้ "updated" เพราะเป็นการอัปเดต ไม่ใช่สร้างใหม่
    //         response = response.setComplete(
    //             lang.msgSuccessAction('updated', 'item.mrs'),
    //             savedData
    //         );

    //         if (!manager && queryRunner) {
    //             await queryRunner.commitTransaction();
    //         }
    //         return response;

    //     } catch (error: any) {
    //         if (!manager) {
    //             await queryRunner?.rollbackTransaction();
    //         }
    //         console.error('Error during mrs control:', error);
    //         throw new Error(lang.msgErrorFunction(operation, error.message));
    //     } finally {
    //         if (!manager) {
    //             await queryRunner?.release();
    //         }
    //     }
    // }

    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'MRSService.getAll';

        try {
            const repository = manager ? manager.getRepository(TaskMrs) : this.taskRepository;

            const rawData = await repository
            .createQueryBuilder('task')
            .leftJoin(MRS, 'mrs', 'mrs.current_task_id = task.task_id')
            .select([
                'task.task_id AS task_id',
                'task.task_code AS task_code',
                "task.status AS status", 
                'task.target_aisle_id AS target_aisle_id',
                'task.target_bank_code AS target_bank_code',
                'task.error_msg AS error_msg',
                'task.stock_item AS stock_item',
                'mrs.mrs_id AS mrs_id',
                'mrs.e_stop AS mrs_e_stop',
            ])
            .where("task.status <> :done", { done: StatusTasks.COMPLETED }) // ✅ เอาเฉพาะงานที่ “ไม่ใช่ DONE”
            .orderBy('task.task_id', 'ASC') // หรือ .orderBy('task.created_at', 'DESC') ถ้ามีคอลัมน์เวลา
            .getRawMany();

            if (!rawData || rawData.length === 0) {
            return response.setIncomplete(lang.msgNotFound('item.mrs'));
            }

            return response.setComplete(lang.msgFound('item.mrs'), rawData);

        } catch (error: any) {
            console.error('Error in getAll:', error);

            if (error instanceof QueryFailedError) {
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }



}
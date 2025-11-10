import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { WaitingTasks } from '../entities/waiting_tasks.entity';
import { deleteEntity } from '../utils/DatabaseUtils';
import { StatusWaiting } from '../common/global.enum';

export class WaitingService {
    private waitingRepository: Repository<WaitingTasks>;

    constructor(){
        this.waitingRepository = AppDataSource.getRepository(WaitingTasks);
    }

    async create(data: Partial<WaitingTasks>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<WaitingTasks>();
        const operation = 'WaitingService.create';

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

            const repository = useManager.getRepository(WaitingTasks);

            if (validate.isNullOrEmpty(data.store_type)) {
                return response.setIncomplete(lang.msgRequired('item.store_type'));
            }
            if (validate.isNullOrEmpty(data.type)) {
                return response.setIncomplete(lang.msgRequired('item.type'));
            }
            if (validate.isNullOrEmpty(data.stock_item)) {
                return response.setIncomplete(lang.msgRequired('item.stock_item'));
            }

             // --- Normalize Data ---
            if (data.unit_cost_handled !== undefined) data.unit_cost_handled = Number(data.unit_cost_handled) || 0;

            const cleanedData: Partial<WaitingTasks> = {
                ...data,
                store_type: data.store_type?.toUpperCase() as any,
                type: data.type?.toUpperCase() as any,
                requested_at: new Date(),
                requested_by: reqUsername,
            };

            const entity = repository.create(cleanedData);

            // --- Save Entity ---
            const savedData = await repository.save(entity);

            if (!manager && queryRunner) await queryRunner.commitTransaction();

            return response.setComplete(lang.msgSuccessAction('created', 'item.waiting'), savedData);
        } catch (error: any) {
            if (!manager && queryRunner) await queryRunner.rollbackTransaction();
            console.error(`Error during ${operation}:`, error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw error;
        } finally {
            if (!manager && queryRunner) await queryRunner.release();
        }
    }

    async updateWaiting(
        waiting_id: string,
        data: Partial<WaitingTasks>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<WaitingTasks>> {
        const response = new ApiResponse<WaitingTasks>();
        const operation = 'WaitingService.updateWaiting';

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
            const repository = useManager.getRepository(WaitingTasks);

            const existing = await repository.findOne({ where: { waiting_id } });
            if (!existing) {
                return response.setIncomplete(lang.msgNotFound('item.waiting'));
            }

            if (validate.isNullOrEmpty(data.store_type)) {
                return response.setIncomplete(lang.msgRequired('item.store_type'));
            }
            if (validate.isNullOrEmpty(data.type)) {
                return response.setIncomplete(lang.msgRequired('item.type'));
            }
            if (validate.isNullOrEmpty(data.stock_item)) {
                return response.setIncomplete(lang.msgRequired('item.stock_item'));
            }

            if (data.unit_cost_handled !== undefined) data.unit_cost_handled = Number(data.unit_cost_handled) || 0;

            const cleanedData: Partial<WaitingTasks> = {
                ...data,
                requested_at: new Date(),
                requested_by: reqUsername,
            };

            repository.merge(existing, cleanedData);
            const savedData = await repository.save(existing);

            if (!manager && queryRunner) await queryRunner.commitTransaction();

            return response.setComplete(lang.msgSuccessAction('updated', 'item.waiting'), savedData);
        } catch (error: any) {
            if (!manager && queryRunner) await queryRunner.rollbackTransaction();
            console.error(`Error during ${operation}:`, error);
            if (error instanceof QueryFailedError) return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            throw error;
        } finally {
            if (!manager && queryRunner) await queryRunner.release();
        }
    }


    async delete(waiting_id: string, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'WaitingService.delete';

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
            const repository = useManager.getRepository(WaitingTasks);

            // ตรวจสอบว่ามี waiting_id อยู่ในระบบ และ status = 'WAITING'
            const existing = await repository.findOne({
                where: { waiting_id: waiting_id, status: StatusWaiting.WAITING } // ✅ เพิ่มเงื่อนไข status
            });

            if (!existing) {
                return response.setIncomplete(lang.msgNotFound('waiting.waiting_id_or_not_waiting'));
            }

            // ลบ entity โดยตรง
            await repository.remove(existing); // ✅ remove จะใช้ instance ของ entity

            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response.setComplete(lang.msgSuccessAction('deleted', 'item.waiting'));
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

    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'WaitingService.getAll';

        try {
            const repository = manager ? manager.getRepository(WaitingTasks) : this.waitingRepository;

            // Query waiting ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('waiting')
                .select([
                    'waiting.waiting_id AS waiting_id',
                    'waiting.stock_item AS stock_item',
                    'waiting.from_location AS from_location',
                    'waiting.requested_by AS requested_by',
                    "DATE_FORMAT(waiting.requested_at, '%d %b %y %H:%i:%s') AS requested_at",
                    "waiting.plan_qty AS plan_qty",
                    "waiting.type AS type",
                    "waiting.store_type AS store_type",
                ])
                .where('waiting.status = :status', { status: 'WAITING' }) // ✅ ใช้ parameter binding
                .orderBy('waiting.requested_at', 'ASC') // ✅ เรียงจากเก่ามาใหม่
                .cache(false) // ✅ ปิด Query Cache
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.waiting'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.waiting'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getUsageAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'WaitingService.getUsageAll';

        try {
            const repository = manager ? manager.getRepository(WaitingTasks) : this.waitingRepository;

            const rawData = await repository.createQueryBuilder('waiting')
                .select([
                    'waiting.waiting_id AS waiting_id',
                    'waiting.store_type AS store_type',
                    'waiting.type AS type',
                    'waiting.status AS status',
                    'waiting.work_order AS work_order',
                    'waiting.usage_num AS usage_num',
                    'waiting.line AS line',
                    'waiting.stock_item AS stock_item',
                    'waiting.item_desc AS item_desc',
                    'waiting.plan_qty AS plan_qty',
                    'waiting.from_location AS from_location',
                    'waiting.usage_type AS usage_type',
                    'waiting.cond AS cond',
                    'waiting.split AS split',
                    'tasks_mrs.actual_qty AS actual_qty',
                    'tasks_mrs.is_confirm AS is_confirm',
                    'tasks_mrs.task_id AS task_id',
                    'waiting.requested_by AS requested_by',
                    "DATE_FORMAT(waiting.requested_at, '%d %b %y %H:%i:%s') AS requested_at",
                ])
                .where('waiting.type = :type', { type: 'USAGE' })
                .leftJoin('task_mrs', 'tasks_mrs', 'tasks_mrs.waiting_id = waiting.waiting_id')
                .orderBy('waiting.requested_at', 'ASC')
                .cache(false)
                .getRawMany();

            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.waiting'));
            }

            // ✅ บังคับให้ actual_qty และ is_confirm เป็น 0 ถ้าไม่มีค่า
            const cleanedData = rawData.map((item: any) => ({
                ...item,
                actual_qty: item.actual_qty != null && !isNaN(Number(item.actual_qty)) ? Number(item.actual_qty) : 0,
                is_confirm: item.is_confirm != null && !isNaN(Number(item.is_confirm)) ? Number(item.is_confirm) : 0,
            }));

            return response.setComplete(lang.msgFound('item.waiting'), cleanedData);
        } catch (error: any) {
            console.error('Error in getUsageAll:', error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }


    async getUsageById(waiting_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'WaitingService.getUsageById';

        try {
            const repository = manager ? manager.getRepository(WaitingTasks) : this.waitingRepository;
    
            const waitingIdStr = String(waiting_id); // แปลงเป็น string

            // Query waiting ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('waiting')
                .select([
                    'waiting.waiting_id AS waiting_id',
                    'waiting.store_type AS store_type',
                    'waiting.type AS type',
                    'waiting.status AS status',
                    'waiting.work_order AS work_order',
                    'waiting.usage_num AS usage_num',
                    'waiting.line AS line',
                    'waiting.stock_item AS stock_item',
                    'waiting.item_desc AS item_desc',
                    'waiting.plan_qty AS plan_qty',
                    'waiting.from_location AS from_location',
                    'waiting.usage_type AS usage_type',
                    'waiting.cond AS cond',
                    'waiting.split AS split',

                ])
                .where('waiting.waiting_id = :waiting_id', { waiting_id: waitingIdStr })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('waiting.waiting_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('waiting.waiting_id'), rawData);
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error.message);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getReceiptAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'WaitingService.getReceiptAll';

        try {
            const repository = manager ? manager.getRepository(WaitingTasks) : this.waitingRepository;

            const rawData = await repository.createQueryBuilder('waiting')
                .select([
                    'waiting.waiting_id AS waiting_id',
                    'waiting.store_type AS store_type',
                    'waiting.type AS type',
                    'waiting.status AS status',
                    'waiting.stock_item AS stock_item',
                    'waiting.item_desc AS item_desc',
                    'waiting.cat_qty AS cat_qty',
                    'waiting.recond_qty AS recond_qty',
                    'waiting.from_location AS from_location',
                    'waiting.cond AS cond',
                    'waiting.contract_num AS contract_num',
                    'waiting.unit_cost_handled AS unit_cost_handled',
                    'waiting.total_cost_handled AS total_cost_handled',
                    'waiting.po_num AS po_num',
                    'waiting.object_id AS object_id',
                    'tasks_mrs.actual_qty AS actual_qty',
                    'waiting.plan_qty AS plan_qty',
                    'tasks_mrs.is_confirm AS is_confirm',
                    'tasks_mrs.task_id AS task_id',
                    'waiting.requested_by AS requested_by',
                    "DATE_FORMAT(waiting.requested_at, '%d %b %y %H:%i:%s') AS requested_at",
                ])
                .where('waiting.type = :type', { type: 'RECEIPT' })
                .leftJoin('task_mrs', 'tasks_mrs', 'tasks_mrs.waiting_id = waiting.waiting_id')
                .orderBy('waiting.requested_at', 'ASC')
                .cache(false)
                .getRawMany();

            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.waiting'));
            }

            // ✅ บังคับให้ actual_qty และ is_confirm เป็น 0 ถ้าไม่มีค่า
            const cleanedData = rawData.map((item: any) => ({
                ...item,
                actual_qty: item.actual_qty != null && !isNaN(Number(item.actual_qty)) ? Number(item.actual_qty) : 0,
                is_confirm: item.is_confirm != null && !isNaN(Number(item.is_confirm)) ? Number(item.is_confirm) : 0,
            }));

            return response.setComplete(lang.msgFound('item.waiting'), cleanedData);
        } catch (error: any) {
            console.error('Error in getReceiptAll:', error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getReceiptById(waiting_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'WaitingService.getReceiptById';

        try {
            const repository = manager ? manager.getRepository(WaitingTasks) : this.waitingRepository;
    
            const waitingIdStr = String(waiting_id); // แปลงเป็น string

            // Query waiting ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('waiting')
                .select([
                    'waiting.waiting_id AS waiting_id',
                    'waiting.store_type AS store_type',
                    'waiting.type AS type',
                    'waiting.status AS status',
                    'waiting.stock_item AS stock_item',
                    'waiting.item_desc AS item_desc',
                    'waiting.cat_qty AS cat_qty',
                    'waiting.recond_qty AS recond_qty',
                    'waiting.from_location AS from_location',
                    'waiting.cond AS cond',
                    'waiting.contract_num AS contract_num',
                    'waiting.unit_cost_handled AS unit_cost_handled',
                    'waiting.total_cost_handled AS total_cost_handled',
                    'waiting.po_num AS po_num',
                    'waiting.object_id AS object_id',
                    'waiting.plan_qty AS plan_qty',
                ])
                .where('waiting.waiting_id = :waiting_id', { waiting_id: waitingIdStr })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('waiting.waiting_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('waiting.waiting_id'), rawData);
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error.message);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

}
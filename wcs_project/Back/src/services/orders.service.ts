import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { Orders } from '../entities/orders.entity';
import { StatusOrders } from '../common/global.enum';
import { OrdersLog } from '../entities/orders_log.entity';
import { T1MOrdersService } from './order_mrs.service';
import { OrdersLogService } from '../utils/logTaskEvent';
import { REPLCommand } from 'repl';
import { StockItems } from '../entities/m_stock_items.entity';

export class OrdersService {
    private ordersRepository: Repository<Orders>;
    private logRepository: Repository<OrdersLog>;
    private stockItemsRepository: Repository<StockItems>;

    constructor(){
        this.ordersRepository = AppDataSource.getRepository(Orders);
        this.logRepository = AppDataSource.getRepository(OrdersLog);
        this.stockItemsRepository = AppDataSource.getRepository(StockItems);
    }

    
    async create(data: Partial<Orders>, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<Orders>();
        const operation = 'OrdersService.create';

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

            const repository = useManager.getRepository(Orders);

            if (validate.isNullOrEmpty(data.store_type)) {
                return response.setIncomplete(lang.msgRequired('item.store_type'));
            }
            if (validate.isNullOrEmpty(data.type)) {
                return response.setIncomplete(lang.msgRequired('item.type'));
            }
            if (validate.isNullOrEmpty(data.stock_item)) {
                return response.setIncomplete(lang.msgRequired('item.stock_item'));
            }

            // ตรวจสอบว่ามี stock_item ปัจจุบันอยู่ในระบบหรือไม่
            const existingSemiIfm = await this.stockItemsRepository.findOne({ where: { stock_item: data.stock_item } });
            if (!existingSemiIfm) {
                return response.setIncomplete('stock item not found');
            }

             // --- Normalize Data ---
            if (data.unit_cost_handled !== undefined) data.unit_cost_handled = Number(data.unit_cost_handled) || 0;

            const cleanedData: Partial<Orders> = {
                ...data,
                store_type: data.store_type?.toUpperCase() as any,
                type: data.type?.toUpperCase() as any,
                requested_at: new Date(),
                requested_by: reqUsername,
            };

            const entity = repository.create(cleanedData);

            // --- Save Entity ---
            const savedData = await repository.save(entity);
            
            // บันทึกลงใน table OrdersLog
            const logService = new OrdersLogService();
            await logService.logTaskEvent(useManager, savedData, { actor: reqUsername, status: StatusOrders.WAITING });
        
            if (!manager && queryRunner) await queryRunner.commitTransaction();

            return response.setComplete(lang.msgSuccessAction('created', 'item.order'), savedData);
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

    async updateOrder(
        order_id: string,
        data: Partial<Orders>,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<Orders>> {
        const response = new ApiResponse<Orders>();
        const operation = 'OrdersService.updateOrder';

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
            const repository = useManager.getRepository(Orders);

            const existing = await repository.findOne({ where: { order_id } });
            if (!existing) {
                return response.setIncomplete(lang.msgNotFound('item.order'));
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

            // ตรวจสอบว่ามี stock_item ปัจจุบันอยู่ในระบบหรือไม่
            const existingSemiIfm = await this.stockItemsRepository.findOne({ where: { stock_item: data.stock_item } });
            if (!existingSemiIfm) {
                return response.setIncomplete('stock item not found');
            }

            if (data.unit_cost_handled !== undefined) data.unit_cost_handled = Number(data.unit_cost_handled) || 0;

            const cleanedData: Partial<Orders> = {
                ...data,
                updated_at: new Date(),
                requested_by: reqUsername,
            };

            repository.merge(existing, cleanedData);
            const savedData = await repository.save(existing);

             // บันทึกลงใน table OrdersLog
            const logService = new OrdersLogService();
            await logService.logTaskEvent(useManager, savedData, { actor: reqUsername, status: StatusOrders.WAITING });
        

            if (!manager && queryRunner) await queryRunner.commitTransaction();

            return response.setComplete(lang.msgSuccessAction('updated', 'item.order'), savedData);
        } catch (error: any) {
            if (!manager && queryRunner) await queryRunner.rollbackTransaction();
            console.error(`Error during ${operation}:`, error);
            if (error instanceof QueryFailedError) return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            throw error;
        } finally {
            if (!manager && queryRunner) await queryRunner.release();
        }
    }


    async delete(order_id: string, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'OrdersService.delete';

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
            const repository = useManager.getRepository(Orders);

           // ตรวจสอบว่ามี order_id อยู่ในระบบ และ status = 'WAITING' 
            const existing = await repository.findOne({
                where: { 
                    order_id: order_id.toString(), // ✅ แปลงเป็น string
                    status: StatusOrders.WAITING 
                }
            });


            if (!existing) {
                return response.setIncomplete(lang.msgNotFound('You cannot set it to waiting because the task has already started.'));
            }

            // ลบ entity โดยตรง
            await repository.remove(existing); // ✅ remove จะใช้ instance ของ entity

            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response.setComplete(lang.msgSuccessAction('deleted', 'item.order'));
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
        const operation = 'OrdersService.getAll';

        try {
            const repository = manager ? manager.getRepository(Orders) : this.ordersRepository;

            // Query order ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('order')
                .leftJoin('m_stock_items', 'stock', 'stock.stock_item = order.stock_item')
                .select([
                    'order.order_id AS order_id',
                    'order.type AS type',
                    'order.stock_item AS stock_item',
                    'stock.item_name AS item_name',
                    'stock.item_desc AS item_desc',
                    'order.from_location AS from_location',
                    'order.cond AS cond',
                    'order.status AS status',
                    "DATE_FORMAT(order.requested_at, '%d %b %y %H:%i:%s') AS requested_at",
                    "order.plan_qty AS plan_qty",
                    "order.actual_qty AS actual_qty",
                    "order.store_type AS store_type"
                ])
                .where('order.status = :status', { status: 'WAITING' }) // ✅ ใช้ parameter binding
                .orderBy('order.requested_at', 'ASC') // ✅ เรียงจากเก่ามาใหม่
                .cache(false) // ✅ ปิด Query Cache
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.order'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.order'), rawData);
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
        const operation = 'OrdersService.getUsageAll';

        try {
            const repository = manager ? manager.getRepository(Orders) : this.ordersRepository;

            const rawData = await repository.createQueryBuilder('order')
                .leftJoin('m_stock_items', 'stock', 'stock.stock_item = order.stock_item')
                .select([
                    'order.order_id AS order_id',
                    'order.store_type AS store_type',
                    'order.type AS type',
                    'order.status AS status',
                    'order.work_order AS work_order',
                    'order.usage_num AS usage_num',
                    'order.line AS line',
                    'order.stock_item AS stock_item',
                    'stock.item_name AS item_name',
                    'stock.item_desc AS item_desc',
                    'order.plan_qty AS plan_qty',
                    'order.from_location AS from_location',
                    'order.usage_type AS usage_type',
                    'order.cond AS cond',
                    'order.split AS split',
                    'order.actual_qty AS actual_qty',
                    'order.is_confirm AS is_confirm',
                    'order.requested_by AS requested_by',
                    "DATE_FORMAT(order.requested_at, '%d %b %y %H:%i:%s') AS requested_at",
                ])
                .where('order.type = :type', { type: 'USAGE' })
                .orderBy('order.requested_at', 'ASC')
                .cache(false)
                .getRawMany();

            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.order'));
            }

            // ✅ บังคับให้ actual_qty และ is_confirm เป็น 0 ถ้าไม่มีค่า
            const cleanedData = rawData.map((item: any) => ({
                ...item,
                actual_qty: item.actual_qty != null && !isNaN(Number(item.actual_qty)) ? Number(item.actual_qty) : 0,
                is_confirm: item.is_confirm != null && !isNaN(Number(item.is_confirm)) ? Number(item.is_confirm) : 0,
            }));

            return response.setComplete(lang.msgFound('item.order'), cleanedData);
        } catch (error: any) {
            console.error('Error in getUsageAll:', error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }


    async getUsageById(order_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'OrdersService.getUsageById';

        try {
            const repository = manager ? manager.getRepository(Orders) : this.ordersRepository;
    
            const IdStr = String(order_id); // แปลงเป็น string

            // Query order ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('order')
                .leftJoin('m_stock_items', 'stock', 'stock.stock_item = order.stock_item')
                .select([
                    'order.order_id AS order_id',
                    'order.store_type AS store_type',
                    'order.type AS type',
                    'order.status AS status',
                    'order.work_order AS work_order',
                    'order.usage_num AS usage_num',
                    'order.line AS line',
                    'order.stock_item AS stock_item',
                    'stock.item_desc AS item_desc',
                    'order.plan_qty AS plan_qty',
                    'order.from_location AS from_location',
                    'order.usage_type AS usage_type',
                    'order.cond AS cond',
                    'order.split AS split',

                ])
                .where('order.order_id = :order_id', { order_id: IdStr })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('order.order_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('order.order_id'), rawData);
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
        const operation = 'OrdersService.getReceiptAll';

        try {
            const repository = manager ? manager.getRepository(Orders) : this.ordersRepository;

            const rawData = await repository.createQueryBuilder('order')
                .leftJoin('m_stock_items', 'stock', 'stock.stock_item = order.stock_item')
                .select([
                    'order.order_id AS order_id',
                    'order.store_type AS store_type',
                    'order.type AS type',
                    'order.status AS status',
                    'order.stock_item AS stock_item',
                    'stock.item_name AS item_name',
                    'stock.item_desc AS item_desc',
                    'order.cat_qty AS cat_qty',
                    'order.recond_qty AS recond_qty',
                    'order.from_location AS from_location',
                    'order.cond AS cond',
                    'order.contract_num AS contract_num',
                    'order.unit_cost_handled AS unit_cost_handled',
                    'order.total_cost_handled AS total_cost_handled',
                    'order.po_num AS po_num',
                    'order.object_id AS object_id',
                    'order.actual_qty AS actual_qty',
                    'order.plan_qty AS plan_qty',
                    'order.is_confirm AS is_confirm',
                    'order.requested_by AS requested_by',
                    "DATE_FORMAT(order.requested_at, '%d %b %y %H:%i:%s') AS requested_at",
                ])
                .where('order.type = :type', { type: 'RECEIPT' })
                .orderBy('order.requested_at', 'ASC')
                .cache(false)
                .getRawMany();

            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.order'));
            }

            // ✅ บังคับให้ actual_qty และ is_confirm เป็น 0 ถ้าไม่มีค่า
            const cleanedData = rawData.map((item: any) => ({
                ...item,
                actual_qty: item.actual_qty != null && !isNaN(Number(item.actual_qty)) ? Number(item.actual_qty) : 0,
                is_confirm: item.is_confirm != null && !isNaN(Number(item.is_confirm)) ? Number(item.is_confirm) : 0,
            }));

            return response.setComplete(lang.msgFound('item.order'), cleanedData);
        } catch (error: any) {
            console.error('Error in getReceiptAll:', error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getReceiptById(order_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'OrdersService.getReceiptById';

        try {
            const repository = manager ? manager.getRepository(Orders) : this.ordersRepository;
    
            const IdStr = String(order_id); // แปลงเป็น string

            // Query order ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('order')
                .leftJoin('m_stock_items', 'stock', 'stock.stock_item = order.stock_item')
                .select([
                    'order.order_id AS order_id',
                    'order.store_type AS store_type',
                    'order.type AS type',
                    'order.status AS status',
                    'order.stock_item AS stock_item',
                    'stock.item_desc AS item_desc',
                    'order.cat_qty AS cat_qty',
                    'order.recond_qty AS recond_qty',
                    'order.from_location AS from_location',
                    'order.cond AS cond',
                    'order.contract_num AS contract_num',
                    'order.unit_cost_handled AS unit_cost_handled',
                    'order.total_cost_handled AS total_cost_handled',
                    'order.po_num AS po_num',
                    'order.object_id AS object_id',
                    'order.plan_qty AS plan_qty',
                ])
                .where('order.order_id = :order_id', { order_id: IdStr })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('order.order_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('order.order_id'), rawData);
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error.message);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

}
// services/orchestrated-task.service.ts
import { AppDataSource } from "../config/app-data-source";
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { ApiResponse } from '../models/api-response.model';
import { Orders} from '../entities/orders.entity';
import { ScanStatus, StatusOrders } from '../common/global.enum';
import * as validate from '../utils/ValidationUtils';
import * as lang from '../utils/LangHelper';

import { OrdersLog } from "../entities/orders_log.entity";
import { T1MOrdersService } from "./order_mrs.service";
import { OrdersLogService } from "../utils/logTaskEvent";
// (ถ้ามี) import { WRSTaskService } from './wrs-task.service';

// services/tasks.service.ts
// tasks.dto.ts
export type CreateTaskItem = {
    order_id?: string;
};

export type CreateTaskBatchDto = {
  items: CreateTaskItem[];     // อาร์เรย์เสมอ (แม้มี 1 รายการ)
};

// services/tasks.service.ts
export class OrchestratedTaskService {
    private ordersRepository: Repository<Orders>;

    constructor(private t1mOrders: T1MOrdersService) {
        this.ordersRepository = AppDataSource.getRepository(Orders);
    }

    async createAndOpen(order_id: string, reqUser: string): Promise<ApiResponse<any>> {
        const res = new ApiResponse<any>();

        if (!order_id) return res.setIncomplete('order_id is required');

        try {
            // เรียก T1MOrdersService โดยตรง
            const r = await this.t1mOrders.executionMrs(order_id, reqUser);

            if (!r.isCompleted) throw new Error(r.message || 'T1M executionMrs failed');

            return res.setComplete('Order processed', r.data);
        } catch (e: any) {
            const op = 'OrchestratedTaskService.executionMrs';
            return res.setError(`Error in ${op}: ${e.message}`, op, e, reqUser, true);
        }
    }


    // ผู้ใช้ยืนยันหยิบเสร็จ เฉพาะของ T1M
    // async confirm(task_id: string, reqUser: string): Promise<ApiResponse<any>> {
    //     const task = await AppDataSource.getRepository(Orders).findOne({ where: { task_id } });
    //     if (!task) return new ApiResponse().setIncomplete(lang.msg('validation.not_found'));

    //     // สำหรับ T1M โดยตรง ไม่ต้องเช็ค store_type
    //     return this.t1m.closeAfterConfirm(task_id, reqUser);
    // }


    // //ต้องจอย ทั้ง2คลัง
    // async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
    //     const response = new ApiResponse<any | null>();
    //     const operation = 'OrchestratedTaskService.getAll';
    
    //     try {
    //         const repository = manager ? manager.getRepository(Orders) : this.ordersRepository;
    
    //         const rawData = await repository
    //             .createQueryBuilder('task')
    //             .leftJoin('orders', 'order', 'task.order_id = order.order_id')
    //             .leftJoin('m_stock_items', 'stock', 'stock.stock_item = task.stock_item')
    //             .select([
    //                 'task.task_id AS task_id',
    //                 'task.stock_item AS stock_item',
    //                 'stock.item_name AS item_name',
    //                 'stock.item_desc AS item_desc',
    //                 'order.type AS type',
    //                 'order.order_id AS order_id',
    //                 'order.from_location AS from_location',
    //                 'order.cond AS cond',
    //                 'order.store_type AS store_type',
    //                 'task.plan_qty AS plan_qty',
    //                 'task.actual_qty AS actual_qty',
    //                 'task.status AS status',
    //                 `DATE_FORMAT(task.requested_at, '%d/%m/%Y %H:%i:%s') AS requested_at`,
    //             ])
    //             .getRawMany();
    
    //         if (!rawData || rawData.length === 0) {
    //             return response.setIncomplete(lang.msgNotFound('item.task'));
    //         }
    
    //         return response.setComplete(lang.msgFound('item.task'), rawData);
    
    //     } catch (error: any) {
    //         console.error('Error in getAll:', error);
    
    //         if (error instanceof QueryFailedError) {
    //             return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
    //         }
    
    //         throw new Error(lang.msgErrorFunction(operation, error.message));
    //     }
    // }

    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
            const response = new ApiResponse<any | null>();
            const operation = 'OrchestratedTaskService.getAll';
    
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
                    .where('order.status <> :status', { status: 'WAITING' }) // ❌ แก้จาก = เป็น <>
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


    /* เปลี่ยนจาก waiting to execution */
    async changeToWaiting(order_id: string, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'OrchestratedTaskService.changeToWaiting';

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
            // 1️⃣ ตรวจสอบ orders หลัก
            const ordersRepo = useManager.getRepository(Orders);
            const order = await ordersRepo.findOne({ where: { order_id } });

            if (!order) {
                return response.setIncomplete(lang.msgNotFound('orders.order_id'));
            }

            // 2️⃣ ตรวจสอบว่า status ต้องเป็น QUEUED เท่านั้น
            if (order.status !== StatusOrders.QUEUED) {
                return response.setIncomplete('Only QUEUED status can be changed');
            }

            // 3️⃣ อัปเดต Orders → WAITING
            await ordersRepo.update(
                { order_id: order_id },
                { status: StatusOrders.WAITING }
            );

            // 4️⃣ เพิ่ม log ใหม่เป็น WAITING
            const logService = new OrdersLogService();
            await logService.logTaskEvent(useManager, order, {  // ใช้ `order` ที่ดึงมา
                actor: reqUsername,
                status: StatusOrders.WAITING
            });

            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response.setComplete(lang.msgSuccessAction('updated', 'orders status → WAITING'));
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

    /** Ready to handle item */
    async handleOrderItem(
        order_id: string,
        actual_qty: number,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OrchestratedTaskService.handleOrderItem';

        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;

        if (!useManager) {
            return response.setIncomplete('No EntityManager or QueryRunner available');
        }

        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }

        try {
            const ordersRepo = useManager.getRepository(Orders);

            // ✅ ตรวจสอบว่า order มีอยู่จริง
            const order = await ordersRepo.findOne({ where: { order_id } });
            if (!order) {
                return response.setIncomplete(`Order not found: ${order_id}`);
            }

              // 2️⃣ ตรวจสอบว่า status ต้องเป็น AISLE_OPEN เท่านั้น
            if (order.status !== StatusOrders.AISLE_OPEN) {
                return response.setIncomplete('Only AISLE_OPEN status can be changed');
            }

            // ✅ ตรวจสอบ actual_qty ไม่เกิน plan_qty
            if (order.plan_qty === undefined) {
                return response.setIncomplete(`Planned quantity is not set for order ${order_id}`);
            }

            if (actual_qty > order.plan_qty) {
                return response.setIncomplete(`Actual quantity (${actual_qty}) exceeds planned quantity (${order.plan_qty})`);
            }

            // ✅ อัปเดตข้อมูล actual
            order.actual_qty = actual_qty;
            order.actual_by = reqUsername;
            order.finished_at = new Date();
            order.status = StatusOrders.FINISHED;

            // ✅ อัปเดต actual_status
            if (actual_qty === order.plan_qty) {
                order.actual_status = ScanStatus.COMPLETED;
            } else {
                order.actual_status = ScanStatus.PARTIAL;
            }

            await ordersRepo.save(order);

            // ✅ เพิ่ม log หลังอัปเดต order
            const logService = new OrdersLogService();
            await logService.logTaskEvent(useManager, order, {
                actor: reqUsername,
                status: StatusOrders.FINISHED
            });

            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response.setComplete('Order updated successfully', {
                order_id: order.order_id,
                plan_qty: order.plan_qty,
                actual_qty: order.actual_qty,
                actual_by: order.actual_by,
                finished_at: order.finished_at,
            });

        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error('Error during handleOrderItem:', error);
            throw new Error(`Error in ${operation}: ${error.message}`);
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }


async callNextQueue(from_location: string, reqUser: string, manager: EntityManager) {
    const ordersRepo = manager.getRepository(Orders);

    // ดึงคิวถัดไป ดูที่ request_at ที่เก่าสุด
    const nextOrder = await ordersRepo.findOne({
        where: {
            from_location,
            status: StatusOrders.QUEUED
        },
        order: { requested_at: "ASC" }
    });

    if (!nextOrder) return;

    // อัปเดตสถานะเป็น PROCESSING
    nextOrder.status = StatusOrders.PROCESSING;
    await ordersRepo.save(nextOrder);

    // 🔥 เรียก executionMrs ของ service อื่นอย่างถูกต้อง
    return await this.t1mOrders.executionMrs(
        nextOrder.order_id,
        reqUser,     // system-auto หรือ user ที่สั่ง
        manager      // ใช้ transaction เดียวกัน
    );
}


}

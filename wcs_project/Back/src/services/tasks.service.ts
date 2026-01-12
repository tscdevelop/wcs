// services/orchestrated-task.service.ts
import { AppDataSource } from "../config/app-data-source";
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { ApiResponse } from '../models/api-response.model';
import { Orders} from '../entities/orders.entity';
import { AisleStatus, ScanStatus, StatusMRS, StatusOrders, TypeInfm } from '../common/global.enum';
import * as validate from '../utils/ValidationUtils';
import * as lang from '../utils/LangHelper';

import { OrdersLog } from "../entities/orders_log.entity";
import { T1MOrdersService } from "./order_mrs.service";
import { OrdersLogService } from "../utils/logTaskEvent";
import { MRS } from "../entities/mrs.entity";
import { Aisle } from "../entities/aisle.entity";
import { Locations } from "../entities/m_location.entity";
import { InventoryService } from "./inventory.service";
import { LocationsMrs } from "../entities/m_location_mrs.entity";
import { T1OrdersService } from "./order_wrs.service";
import { ExecutionGroup } from "../entities/execution_group_id";
import { Counter } from "../entities/counter.entity";
import { WRS } from "../entities/wrs.entity";

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

     constructor(
        private readonly t1mOrders: T1MOrdersService,
        private readonly t1Orders: T1OrdersService, // ✅ ต้องมี
        ) {
        this.ordersRepository = AppDataSource.getRepository(Orders);
    }

    // ------------------------------
    // 🔥 ฟังก์ชัน Generate execution_group_id
    // ------------------------------
    private async generateExecutionGroupId(): Promise<string> {
        const last = await this.ordersRepository
            .createQueryBuilder("o")
            .select("MAX(CAST(o.execution_group_id AS UNSIGNED))", "max")
            .getRawOne();

        const nextNumber = (Number(last.max) || 0) + 1;
        return nextNumber.toString();
    }

    // ------------------------------
    // 🔥 ฟังก์ชันใหม่ การทำ execution โดยรองรับ array และเพิ่มการใส่เลขกลุ่ม
    // ------------------------------
    async createAndOpenBatch(
    dto: CreateTaskBatchDto,
    reqUser: string
): Promise<ApiResponse<any>> {

    const res = new ApiResponse<any>();

    if (!dto?.items?.length) {
        return res.setIncomplete("items[] is required");
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    let execution_group_id: string;
    const resultList: any[] = [];

    try {
        // ---------- START TRANSACTION ----------
        await queryRunner.startTransaction();

        // generate execution_group_id
        execution_group_id = await this.generateExecutionGroupId();

        // ✅ CREATE execution_group record
await queryRunner.manager.insert(ExecutionGroup, {
    execution_group_id,
    status: 'CREATED',
    total_orders: dto.items.length,
    finished_orders: 0,
    started_at: new Date(),
});

        for (const item of dto.items) {
            const order_id = item.order_id;
            if (!order_id) continue;

            // load order
            const order = await queryRunner.manager.findOne(Orders, {
                where: { order_id }
            });

            if (!order) {
                throw new Error(`Order not found: ${order_id}`);
            }

            const { type, store_type } = order;
            let r: ApiResponse<any>;

            // ========== ROUTING SERVICE ==========
            if (store_type === "T1M") {

                // T1M → execute ทันที
                if (type === "USAGE" || type === "RECEIPT") {
                    r = await this.t1mOrders.executionInbT1m(
                        order_id,
                        reqUser,
                        queryRunner.manager
                    );
                } else {
                    throw new Error(
                        `Unknown type (${type}) for store_type=T1M (order_id: ${order_id})`
                    );
                }

            } else if (store_type === "T1") {

                // ✅ T1 ยังไม่ execute ตอนนี้
                // แค่ mark ว่า batch นี้ valid
                r = new ApiResponse<any>().setComplete(
                    "T1 order queued for execution",
                    {}
                );

            } else {
                throw new Error(
                    `Unknown store_type: ${store_type} (order_id: ${order_id})`
                );
            }

            // -------- check result --------
            if (!r.isCompleted) {
                throw new Error(
                    `Execution failed for ${order_id}: ${r.message}`
                );
            }

            // -------- update execution_group_id --------
            await queryRunner.manager.update(
                Orders,
                { order_id },
                { execution_group_id }
            );

            resultList.push({
                order_id,
                type,
                store_type,
                execution_group_id
            });
        }

        // ---------- COMMIT TRANSACTION ----------
        await queryRunner.commitTransaction();

    } catch (e: any) {

        // ✅ rollback เฉพาะตอน transaction ยัง active
        if (queryRunner.isTransactionActive) {
            await queryRunner.rollbackTransaction();
        }

        const op = "OrchestratedTaskService.createAndOpenBatch";
        return res.setError(
            `Error in ${op}: ${e.message}`,
            op,
            e,
            reqUser,
            true
        );

    } finally {
        await queryRunner.release();
    }

    // =================================================
    // 🚀 AFTER COMMIT (NO TRANSACTION)
    // =================================================

    try {
        await this.t1Orders.executeGroupAutoService(
            execution_group_id,
            reqUser
        );
    } catch (e: any) {
        // ❗ ไม่ rollback แล้ว แค่ log
        console.error(
            `executeGroupAutoService failed for group ${execution_group_id}`,
            e
        );
    }

    return res.setComplete(
        "Confirm to Execution successfully",
        {
            execution_group_id,
            items: resultList
        }
    );
}


    /* เปลี่ยนจาก execution to waiting */
    async changeToWaitingBatch(
        dto: { items: { order_id: string }[] },
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {

        const response = new ApiResponse<any>();
        const operation = "OrchestratedTaskService.changeToWaitingBatch";

        if (!dto?.items?.length) {
            return response.setIncomplete("items[] is required");
        }

        // เตรียม QueryRunner ถ้าไม่มี manager ส่งเข้ามา
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;

        if (!useManager) {
            return response.setIncomplete(
                lang.msg("validation.no_entityManager_or_queryRunner_available")
            );
        }

        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }

        try {
            const ordersRepo = useManager.getRepository(Orders);
            const logService = new OrdersLogService();

            const updated: string[] = [];

            // -----------------------------
            // 🔥 Loop item แบบ Strict
            // ถ้ามี error → throw → rollback ทั้งหมด
            // -----------------------------
            for (const item of dto.items) {
                const orderId = item.order_id;

                // 1) โหลด order
                const order = await ordersRepo.findOne({
                    where: { order_id: orderId },
                });

                if (!order) {
                    throw new Error(`Order not found: ${orderId}`);
                }

                // 2) ต้องเป็น PENDING
                if (order.status !== StatusOrders.PENDING) {
                    throw new Error(
                        `${orderId}: Only PENDING status can be changed`
                    );
                }

                // 3) อัปเดต → WAITING
                await ordersRepo.update(
                    { order_id: orderId },
                    {
                        status: StatusOrders.WAITING,
                        execution_group_id: () => "NULL",
                        started_at: () => "NULL",
                        queued_at: () => "NULL",
                    }
                );

                // 4) Log event
                await logService.logTaskEvent(useManager, order, {
                    actor: reqUsername,
                    status: StatusOrders.WAITING,
                });

                updated.push(orderId);
            }

            // 5️⃣ Commit
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response.setComplete("changeToWaiting batch completed", {
                updated,
            });

        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }

            console.error(`Error during ${operation}:`, error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(
                    lang.msgErrorFunction(operation, error.message)
                );
            }

            return response.setIncomplete(error.message);
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    /* เปลี่ยนสถานะจาก waiting → PENDING แต่ยังไม่ทำ execution */
    async changeToPendingBatch(
        dto: { items: { order_id: string }[] },
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {

        const response = new ApiResponse<any>();
        const operation = "OrchestratedTaskService.changeToPendingBatch";

        if (!dto?.items?.length) {
            return response.setIncomplete("items[] is required");
        }

        // เตรียม QueryRunner ถ้าไม่มี manager
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;

        if (!useManager) {
            return response.setIncomplete(
                lang.msg("validation.no_entityManager_or_queryRunner_available")
            );
        }

        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }

        try {
            const ordersRepo = useManager.getRepository(Orders);
            const logService = new OrdersLogService();

            const updated: string[] = [];

            // -----------------------------
            // 🔥 Strict loop
            // error ตัวเดียว → rollback ทั้ง batch
            // -----------------------------
            for (const item of dto.items) {
                const orderId = item.order_id;

                // 1) โหลด order
                const order = await ordersRepo.findOne({
                    where: { order_id: orderId },
                });

                if (!order) {
                    throw new Error(`Order not found: ${orderId}`);
                }

                // 2) ต้องเป็น WAITING เท่านั้น
                if (order.status !== StatusOrders.WAITING) {
                    throw new Error(
                        `${orderId}: Only WAITING status can be changed`
                    );
                }

                // 3) อัปเดต → PENDING
                await ordersRepo.update(
                    { order_id: orderId },
                    {
                        status: StatusOrders.PENDING,
                    }
                );

                // 4) Log event
                await logService.logTaskEvent(useManager, order, {
                    actor: reqUsername,
                    status: StatusOrders.PENDING,
                });

                updated.push(orderId);
            }

            // 5️⃣ Commit
            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response.setComplete("changeToExecution batch completed", {
                updated,
            });

        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }

            console.error(`Error during ${operation}:`, error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(
                    lang.msgErrorFunction(operation, error.message)
                );
            }

            return response.setIncomplete(error.message);
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    /** Ready to handle item for MRS*/
    async handleOrderItemMrs(
        order_id: string,
        actual_qty: number,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OrchestratedTaskService.handleOrderItemMrs';

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
            const mrsRepo = useManager.getRepository(MRS);
            const aisleRepo = useManager.getRepository(Aisle);
            const locationRepo = useManager.getRepository(Locations);
            const locationMrsRepo = useManager.getRepository(LocationsMrs);

            //-----------------------------------
            // 1) โหลด order
            //-----------------------------------
            const order = await ordersRepo.findOne({ where: { order_id } });
            if (!order) {
                return response.setIncomplete(`Order not found: ${order_id}`);
            }

            // ตรวจสอบ status ต้องเป็น AISLE_OPEN เท่านั้น
            if (order.status !== StatusOrders.AISLE_OPEN) {
                return response.setIncomplete('Only AISLE_OPEN status can be changed');
            }

            // ตรวจสอบ plan_qty
            if (order.plan_qty === undefined) {
                return response.setIncomplete(`Planned quantity is not set for order ${order_id}`);
            }

            if (actual_qty > order.plan_qty) {
                return response.setIncomplete(
                    `Actual quantity (${actual_qty}) exceeds planned quantity (${order.plan_qty})`
                );
            }

            //-----------------------------------
            // 2) UPDATE ORDER ถ้ายิงครบ=completed ถ้ายิงไม่ครบ=finished
            //-----------------------------------
            const isCompleted = actual_qty === order.plan_qty;

            order.actual_qty = actual_qty;
            order.actual_by = reqUsername;
            order.finished_at = new Date();
            order.status = isCompleted
                ? StatusOrders.COMPLETED
                : StatusOrders.FINISHED;
            order.is_confirm = true;

            order.actual_status = isCompleted
                ? ScanStatus.COMPLETED
                : ScanStatus.PARTIAL;

            await ordersRepo.save(order);

            // Log
            const logService = new OrdersLogService();
            await logService.logTaskEvent(useManager, order, {
                actor: reqUsername,
                status: order.status
            });

            //-----------------------------------
            // 2.1) UPDATE INVENTORY
            //-----------------------------------
            const invService = new InventoryService();

            switch (order.type) {
                case TypeInfm.RECEIPT:
                    await invService.receipt(useManager, order);
                    break;

                case TypeInfm.USAGE:
                    await invService.usage(useManager, order);
                    break;

                case TypeInfm.TRANSFER:
                    await invService.transfer(useManager, order);
                    break;

                default:
                    throw new Error(`Unsupported order type: ${order.type}`);
            }

            //-----------------------------------
            // 3) หา MRS จาก loc_id (ผ่าน m_location_mrs)
            //-----------------------------------
            const location = await locationRepo.findOne({
                where: { loc_id: order.loc_id }
            });

            if (!location) {
                throw new Error(`Location not found for loc_id ${order.loc_id}`);
            }

            let mrs: MRS | null = null;

            const locationMrs = await locationMrsRepo.findOne({
                where: { loc_id: location.loc_id }
            });

            if (locationMrs) {
                mrs = await mrsRepo.findOne({
                    where: { mrs_id: locationMrs.mrs_id }
                });
            }

            //-----------------------------------
            // 4) UPDATE MRS → reset status
            //-----------------------------------
            if (mrs) {
                await mrsRepo.update(
                    { mrs_id: mrs.mrs_id },
                    {
                        current_order_id: () => 'NULL',
                        target_aisle_id: () => 'NULL',
                        // current_aisle_id: () => 'NULL',
                        is_available: true,
                        is_aisle_open: false,
                        open_session_aisle_id: null,
                        open_session_expires_at: null,
                        mrs_status: StatusMRS.IDLE,
                    }
                );
            }

            //-----------------------------------
            // 5) UPDATE AISLE → close
            //-----------------------------------
            if (mrs && mrs.target_aisle_id) {
                await aisleRepo.update(
                    { aisle_id: mrs.target_aisle_id },
                    {
                        status: AisleStatus.CLOSED,
                        last_opened_at: undefined
                    }
                );
            }

            //-----------------------------------
            // 6) CALL NEXT QUEUE (ใหม่)
            //-----------------------------------
            await this.callNextQueue(Number(order.loc_id), reqUsername, useManager);

            if (!manager && queryRunner) {
                await queryRunner.commitTransaction();
            }

            return response.setComplete('Order handled successfully', {
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

            console.error('Error during handleOrderItemMrs:', error);

            // ⭐ จุดสำคัญ
            return response.setIncomplete(
                error?.message || `Error in ${operation}`
            );
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async callNextQueue(loc_id: number, reqUser: string, manager: EntityManager) {
        const ordersRepo = manager.getRepository(Orders);

        // ⭐ เลือกคิวแบบใหม่ → priority desc ก่อน, requested_at asc ต่อ
        const nextOrder = await ordersRepo.findOne({
            where: {
                loc_id: String(loc_id),
                status: StatusOrders.QUEUE
            },
            order: {
                priority: "DESC",       // ⭐ priority แบบ B
                requested_at: "ASC"
            }
        });

        if (!nextOrder) return;

        // // อัปเดตสถานะเป็น PROCESSING
        // nextOrder.status = StatusOrders.PROCESSING;
        // await ordersRepo.save(nextOrder);

        // เรียก executionInbT1m
        return await this.t1mOrders.executionInbT1m(
            nextOrder.order_id,
            reqUser,
            manager
        );
    }


//T1
async handleOrderItemWRS(
    order_id: string,
    actual_qty: number,
    reqUsername: string,
    manager?: EntityManager
): Promise<ApiResponse<any>> {

    const response = new ApiResponse<any>();
    const operation = 'OrchestratedTaskService.handleOrderItemWRS';

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
        const counterRepo = useManager.getRepository(Counter);
        const wrsRepo = useManager.getRepository(WRS);

        //-----------------------------------
        // 1) LOAD ORDER
        //-----------------------------------
        const order = await ordersRepo.findOne({ where: { order_id } });

        if (!order) {
            return response.setIncomplete(`Order not found: ${order_id}`);
        }

        if (order.store_type !== "T1") {
            return response.setIncomplete('Order is not T1 type');
        }

        // T1 ปกติจะ scan ตอน PROCESSING
        if (order.status !== StatusOrders.PROCESSING) {
            return response.setIncomplete('Only PROCESSING order can be scanned');
        }

        if (order.plan_qty === undefined) {
            return response.setIncomplete(`Plan qty not set for order ${order_id}`);
        }

        if (actual_qty > order.plan_qty) {
            return response.setIncomplete(
                `Actual quantity (${actual_qty}) exceeds planned quantity (${order.plan_qty})`
            );
        }

        //-----------------------------------
        // 2) UPDATE ORDER
        //-----------------------------------
        const isCompleted = actual_qty === order.plan_qty;

        order.actual_qty = actual_qty;
        order.actual_by = reqUsername;
        order.finished_at = new Date();
        order.is_confirm = true;

        order.status = isCompleted
            ? StatusOrders.COMPLETED
            : StatusOrders.FINISHED;

        order.actual_status = isCompleted
            ? ScanStatus.COMPLETED
            : ScanStatus.PARTIAL;

        await ordersRepo.save(order);

        // log
        const logService = new OrdersLogService();
        await logService.logTaskEvent(useManager, order, {
            actor: reqUsername,
            status: order.status
        });

        //-----------------------------------
        // 3) UPDATE INVENTORY
        //-----------------------------------
        const invService = new InventoryService();

        switch (order.type) {
            case TypeInfm.RECEIPT:
                await invService.receipt(useManager, order);
                break;

            case TypeInfm.USAGE:
                await invService.usage(useManager, order);
                break;

            case TypeInfm.TRANSFER:
                await invService.transfer(useManager, order);
                break;

            default:
                throw new Error(`Unsupported order type: ${order.type}`);
        }

        //-----------------------------------
        // 4) RESET COUNTER + WRS
        //-----------------------------------
        const counter = await counterRepo.findOne({
    where: {
        current_order_id: order.order_id
    }
});

if (counter) {
    await counterRepo.update(
        { counter_id: counter.counter_id },
        {
            status: "EMPTY",
             execution_group_id: () => 'NULL',   // ⭐ FIX
            current_order_id: () => 'NULL',     // ⭐ FIX
            light_color_hex: () => 'NULL',
            current_wrs_id: () => 'NULL',
            light_mode: "OFF",
            last_event_at: new Date()
        }
    );
}


        const wrs = await wrsRepo.findOne({
    where: {
        current_order_id: order.order_id
    }
});

if (wrs) {
    await wrsRepo.update(
        { wrs_id: wrs.wrs_id },
        {
            wrs_status: "IDLE",
            is_available: true,
            current_order_id: () => 'NULL',
            target_counter_id: () => 'NULL',
            last_heartbeat: new Date()
        }
    );
}


        //-----------------------------------
        // 5) CALL NEXT QUEUE (T1)
        //-----------------------------------
        if (!order.execution_group_id) {
    return response.setIncomplete('Order is not in execution group');
}

const executionGroupId = order.execution_group_id; // type = string

        await this.callNextQueueT1(executionGroupId, reqUsername, useManager);

        if (!manager && queryRunner) {
            await queryRunner.commitTransaction();
        }

        return response.setComplete('T1 order handled successfully', {
            order_id: order.order_id,
            plan_qty: order.plan_qty,
            actual_qty: order.actual_qty,
            finished_at: order.finished_at
        });

    } catch (error: any) {

        if (!manager && queryRunner) {
            await queryRunner.rollbackTransaction();
        }

        console.error('Error during handleOrderItemWRS:', error);

        return response.setIncomplete(
            error?.message || `Error in ${operation}`
        );

    } finally {
        if (!manager && queryRunner) {
            await queryRunner.release();
        }
    }
}

async callNextQueueT1(
    execution_group_id: string,
    reqUser: string,
    manager: EntityManager
) {
    const ordersRepo = manager.getRepository(Orders);

    const nextOrder = await ordersRepo.findOne({
        where: {
            execution_group_id,
            store_type: "T1",
            status: StatusOrders.PENDING
        },
        order: {
            priority: 'DESC',
            requested_at: 'ASC'
        }
    });

    if (!nextOrder) {
    // ❗ ไม่มี order ค้างแล้ว → ปิด execution_group
    await manager.getRepository(ExecutionGroup).update(
        { execution_group_id },
        {
            status: 'FINISHED',
            finished_at: new Date(),
        }
    );

    return;
}


const executionGroupId = nextOrder.execution_group_id;

if (!executionGroupId) {
    return; // หรือ throw error
}

return await this.t1Orders.executeGroupAutoService(
    executionGroupId,
    reqUser,
    manager
);

}



    // ------------------------------
    // get all execution
    // ------------------------------
    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'OrchestratedTaskService.getAll';

        try {
            const repository = manager ? manager.getRepository(Orders) : this.ordersRepository;

            // Query order ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('order')
                .leftJoin('m_stock_items', 'stock', 'stock.item_id = order.item_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = order.loc_id')
                .select([
                    'order.order_id AS order_id',
                    'order.type AS type',
                    'stock.item_id AS item_id',
                    'stock.stock_item As stock_item',
                    'stock.item_name AS item_name',
                    'stock.item_desc AS item_desc',
                    'loc.loc_id AS loc_id',
                    'loc.loc AS loc',
                    'loc.box_loc AS box_loc',
                    'order.cond AS cond',
                    'order.status AS status',
                    "DATE_FORMAT(order.requested_at, '%d/%m/%Y') AS requested_at",
                    "order.plan_qty AS plan_qty",
                    "order.actual_qty AS actual_qty",
                    "order.store_type AS store_type"
                ])
                //.where('order.status = :status', { status: 'PENDING' }) // ถ้าตรงข้าม ให้ใช้ <>
                .orderBy('order.requested_at', 'ASC') // ✅ เรียงจากเก่ามาใหม่
                .cache(false) // ✅ ปิด Query Cache
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.execution'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.execution'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }
}

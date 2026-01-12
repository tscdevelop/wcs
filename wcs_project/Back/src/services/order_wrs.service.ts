import { EntityManager, IsNull, QueryFailedError, Repository } from "typeorm";
import { AppDataSource } from "../config/app-data-source";
import { ApiResponse } from "../models/api-response.model";
import { MRS } from "../entities/mrs.entity";
import { Aisle } from "../entities/aisle.entity";
import { MrsLog } from "../entities/mrs_log.entity";
import {
    StatusOrders,
    AisleStatus,
    ControlSource,
    TaskSource,
    TaskSubsystem,
    StatusMRS,
} from "../common/global.enum";
import * as lang from "../utils/LangHelper";
import { MrsGateway } from "../gateways/mrs.gateway";
import { OrdersLog } from "../entities/orders_log.entity";
import { Orders } from "../entities/orders.entity";
import { StockItems } from "../entities/m_stock_items.entity";
import { MRS_AISLE } from "../entities/mrs_aisle.entity";
import { Locations } from "../entities/m_location.entity";
import { LocationsMrs } from "../entities/m_location_mrs.entity";
import { WRS } from "../entities/wrs.entity";
import { Counter } from "../entities/counter.entity";
import { WrsLog } from "../entities/wrs_log.entity";
import { ExecutionGroup } from "../entities/execution_group_id";

const COUNTER_COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'CYAN'];

export class T1OrdersService {
    private ordersRepository: Repository<Orders>;
    private logRepository: Repository<OrdersLog>;
    private stockItemsRepository: Repository<StockItems>;
    private locationRepository: Repository<Locations>;

    constructor(){
        this.ordersRepository = AppDataSource.getRepository(Orders);
        this.logRepository = AppDataSource.getRepository(OrdersLog);
        this.stockItemsRepository = AppDataSource.getRepository(StockItems);
        this.locationRepository = AppDataSource.getRepository(Locations);
    }

//     async startExecutionService(order_id: string, reqUsername: string, manager: EntityManager) {
//         const ordersRepo = manager.getRepository(Orders);
//         const wrsRepo = manager.getRepository(WRS);
//         const counterRepo = manager.getRepository(Counter);
//         const wrsLogRepo = manager.getRepository(WrsLog);

//         // 1) โหลด order
//         const order = await ordersRepo.findOne({ where: { order_id } });
//         if (!order) throw new Error("Order not found");

//         // 2) หา AMR ที่พร้อม
//         const amr = await wrsRepo.findOne({ where: { is_available: true } });
//         if (!amr) throw new Error("No available AMR");

//         // 3) โหลด counter
//         const counter = await counterRepo.findOne({ where: { counter_id: order.target_counter_id } });
//         if (!counter) throw new Error("Counter not found");

//         // 4) อัปเดต order
//         order.status = StatusOrders.PROCESSING;
//         order.started_at = new Date();
//         await ordersRepo.save(order);

//         // 5) อัปเดต AMR
//         amr.wrs_status = "Delivering";
//         amr.current_order_id = order_id;
//         amr.is_available = false;
//         await wrsRepo.save(amr);

//         // 6) อัปเดต Counter
//         counter.status = "WAITING_AMR";
//         counter.current_order_id = order_id;
//         await counterRepo.save(counter);

//         // 7) Log
//         await wrsLogRepo.save([
//             wrsLogRepo.create({ wrs_id: amr.wrs_id, order_id, status: "Delivering", operator: ControlSource.AUTO, event: "Assigned order", message: `AMR assigned to order ${order_id}` }),
//         ]);

//         return { order_id, amr_id: amr.wrs_id, counter_id: counter.counter_id };
//     }

//     async amrDeliverBoxService(order_id: string, manager: EntityManager) {
//         const ordersRepo = manager.getRepository(Orders);
//         const wrsRepo = manager.getRepository(WRS);
//         const counterRepo = manager.getRepository(Counter);
//         const wrsLogRepo = manager.getRepository(WrsLog);

//         // 1) โหลด order
//         const order = await ordersRepo.findOne({ where: { order_id } });
//         if (!order) throw new Error("Order not found");

//         // 2) โหลด AMR
//         const amr = await wrsRepo.findOne({ where: { current_order_id: order_id } });
//         if (!amr) throw new Error("AMR not assigned");

//         // 3) โหลด counter
//         const counter = await counterRepo.findOne({ where: { current_order_id: order_id } });
//         if (!counter) throw new Error("Counter not found");

//         // 4) Simulate AMR moving
//         await wrsLogRepo.save(wrsLogRepo.create({ wrs_id: amr.wrs_id, order_id, status: "Delivering", operator: ControlSource.AUTO, event: "AMR moving to storage", message: "AMR going to storage location" }));
//         await new Promise(res => setTimeout(res, 5000)); // simulate 5 sec
//         await wrsLogRepo.save(wrsLogRepo.create({ wrs_id: amr.wrs_id, order_id, status: "Delivering", operator: ControlSource.AUTO, event: "AMR pick up box", message: "AMR picked up box" }));
//         await new Promise(res => setTimeout(res, 5000)); // simulate 5 sec
//         await wrsLogRepo.save(wrsLogRepo.create({ wrs_id: amr.wrs_id, order_id, status: "Delivering", operator: ControlSource.AUTO, event: "AMR moving to counter", message: "AMR going to counter location" }));
//         await new Promise(res => setTimeout(res, 5000)); // simulate 5 sec
//         await wrsLogRepo.save(wrsLogRepo.create({ wrs_id: amr.wrs_id, order_id, status: "Delivering", operator: ControlSource.AUTO, event: "AMR put down box", message: "AMR put down box" }));

//         // 5) AMR idle
//         amr.wrs_status = "Idle";
//         amr.current_order_id = null;
//         amr.is_available = true;
//         await wrsRepo.save(amr);

//         return { order_id, amr_id: amr.wrs_id };
//     }

// async counterReadyToPickService(order_id: string, reqUsername: string, manager: EntityManager) {
//     const counterRepo = manager.getRepository(Counter);
//     const wrsLogRepo = manager.getRepository(WrsLog);

//     // โหลด counter ที่เกี่ยวข้องกับ order
//     const counter = await counterRepo.findOne({ where: { current_order_id: order_id } });
//     if (!counter) throw new Error("Counter not found");

//     // อัปเดต counter → READY_TO_PICK
//     counter.status = "READY_TO_PICK";
//     counter.gate_open = true;
//     await counterRepo.save(counter);

//     // log event
//     await wrsLogRepo.save(wrsLogRepo.create({
//         wrs_id: counter.current_wrs_id!,
//         order_id,
//         status: "READY_TO_PICK",
//         operator: ControlSource.MANUAL,
//         event: "Counter ready to pick",
//         message: `${reqUsername} pressed 'Ready to handle item'`
//     }));

//     return { order_id, counter_id: counter.counter_id };
// }

// async confirmOrderService(order_id: string, reqUsername: string, manager: EntityManager) {
//     const ordersRepo = manager.getRepository(Orders);
//     const counterRepo = manager.getRepository(Counter);
//     const wrsLogRepo = manager.getRepository(WrsLog);

//     // โหลด order
//     const order = await ordersRepo.findOne({ where: { order_id } });
//     if (!order) throw new Error("Order not found");

//     // โหลด counter
//     const counter = await counterRepo.findOne({ where: { current_order_id: order_id } });
//     if (!counter) throw new Error("Counter not found");

//     // 1) User confirm → ปิด roller gate
//     counter.status = "WAITING_AMR";
//     counter.current_order_id = null;
//     counter.gate_open = false;
//     await counterRepo.save(counter);

//     // 2) Update order → FINISHED
//     order.status = StatusOrders.FINISHED;
//     order.finished_at = new Date();
//     await ordersRepo.save(order);

//     // log event
//     await wrsLogRepo.save(wrsLogRepo.create({
//         wrs_id: counter.current_wrs_id!,
//         order_id,
//         status: "FINISHED",
//         operator: ControlSource.MANUAL,
//         event: "Order finished",
//         message: `${reqUsername} confirmed order and closed gate`
//     }));

//     return { order_id, status: order.status, counter_id: counter.counter_id };
// }


// async amrReturnTaskService(order_id: string, manager: EntityManager) {
//     const wrsRepo = manager.getRepository(WRS);
//     const counterRepo = manager.getRepository(Counter);
//     const wrsLogRepo = manager.getRepository(WrsLog);

//     // โหลด AMR ที่ทำ order นี้
//     const amr = await wrsRepo.findOne({ where: { current_order_id: order_id } });
//     if (!amr) throw new Error("AMR not assigned");

//     // โหลด counter
//     const counter = await counterRepo.findOne({ where: { current_order_id: null } });
//     if (!counter) throw new Error("Counter not found");

//     // 1) AMR returning
//     amr.wrs_status = "Returning";
//     await wrsRepo.save(amr);

//     await wrsLogRepo.save(wrsLogRepo.create({
//         wrs_id: amr.wrs_id,
//         order_id,
//         status: "Returning",
//         operator: ControlSource.AUTO,
//         event: "AMR returning",
//         message: "AMR received returning task"
//     }));

//     // 2) AMR goes to counter → pick up → Counter empty
//     await wrsLogRepo.save(wrsLogRepo.create({ wrs_id: amr.wrs_id, order_id, status: "Returning", operator: ControlSource.AUTO, event: "AMR pick up at counter", message: "AMR picked up box" }));
//     counter.status = "Empty";
//     await counterRepo.save(counter);

//     // 3) AMR goes to storage → put down
//     await new Promise(res => setTimeout(res, 10000)); // simulate 10 sec
//     await wrsLogRepo.save(wrsLogRepo.create({ wrs_id: amr.wrs_id, order_id, status: "Returning", operator: ControlSource.AUTO, event: "AMR put down at storage", message: "AMR put down box at storage" }));

//     // 4) AMR idle
//     amr.wrs_status = "Idle";
//     amr.current_order_id = null;
//     amr.is_available = true;
//     await wrsRepo.save(amr);

//     return { order_id, amr_id: amr.wrs_id };
// }


private mapColorToHex(color: string): string {
    const map: Record<string, string> = {
        RED: '#FF0000',
        BLUE: '#0000FF',
        GREEN: '#00FF00',
        YELLOW: '#FFFF00',
        PURPLE: '#800080',
        CYAN: '#00FFFF'
    };
    return map[color] || '#FFFFFF';
}

async executeGroupAutoService(
    executionGroupId: string,
    reqUsername: string,
    manager?: EntityManager
) {
    const useManager = manager ?? AppDataSource.manager;

    const executionGroupRepo = useManager.getRepository(ExecutionGroup);
    const ordersRepo = useManager.getRepository(Orders);
    const counterRepo = useManager.getRepository(Counter);
    const wrsRepo = useManager.getRepository(WRS);
    const wrsLogRepo = useManager.getRepository(WrsLog);


    /* ----------------------------------------------------
     * 1) Load execution group
     * -------------------------------------------------- */
    const group = await executionGroupRepo.findOne({
        where: { execution_group_id: executionGroupId }
    });
    if (!group) throw new Error('ExecutionGroup not found');

    if (group.status === 'FINISHED') {
        return { message: 'ExecutionGroup already finished' };
    }

    /* ----------------------------------------------------
     * 2) Ensure group status = RUNNING
     * -------------------------------------------------- */
    if (group.status === 'CREATED' || group.status === 'WAITING') {
        group.status = 'RUNNING';
        group.started_at = new Date();
        await executionGroupRepo.save(group);
    }


    /* ----------------------------------------------------
     * 3) Lock / assign counter color (once)
     * -------------------------------------------------- */
    if (!group.counter_color) {
        // สีที่ถูกใช้โดย group อื่นที่ยัง RUNNING
        const usedColors = (
            await executionGroupRepo.find({
                where: { status: 'RUNNING' }
            })
        )
            .map(g => g.counter_color)
            .filter(Boolean);

        const availableColor = COUNTER_COLORS.find(
            c => !usedColors.includes(c)
        );

        if (!availableColor) {
            // ไม่มีสีว่าง → รอรอบถัดไป
            return { message: 'No available counter color' };
        }

        group.counter_color = availableColor;
        await executionGroupRepo.save(group);
    }

    const groupColor = group.counter_color;

    /* ----------------------------------------------------
     * 4) Load waiting orders (T1 only)
     * -------------------------------------------------- */
    const waitingOrders = await ordersRepo.find({
        where: {
            execution_group_id: executionGroupId,
            store_type: 'T1',
            status: StatusOrders.PENDING,
            requested_by: reqUsername
        },
        order: {
            priority: 'DESC',
            requested_at: 'ASC'
        }
    });

    if (waitingOrders.length === 0) {
        // ตรวจว่าทำครบหรือยัง
        if (group.finished_orders >= group.total_orders) {
            group.status = 'FINISHED';
            group.finished_at = new Date();
            await executionGroupRepo.save(group);

            // ปลด lock counter
            await counterRepo.update(
                { execution_group_id: executionGroupId },
                {
                    execution_group_id: undefined,
                    group_color: undefined,
                    status: 'EMPTY'
                }
            );

            return { message: 'ExecutionGroup finished' };
        }

        return { message: 'No waiting orders' };
    }

    /* ----------------------------------------------------
     * 5) Load available counters (slot)
     * -------------------------------------------------- */
    const availableCounters = await counterRepo.find({
        where: {
            status: 'EMPTY',
            execution_group_id: IsNull()
        }
    });

    const slot = Math.min(
        availableCounters.length,
        waitingOrders.length
    );

    if (slot === 0) {
        return { message: 'No available counter slot' };
    }

    /* ----------------------------------------------------
     * 6) Assign slot-based execution
     * -------------------------------------------------- */
    for (let i = 0; i < slot; i++) {
        const order = waitingOrders[i];
        const counter = availableCounters[i];

        // --- หา AMR ว่าง ---
        const amr = await wrsRepo.findOne({
            where: {
                is_available: true,
                wrs_status: 'IDLE'
            }
        });
        if (!amr) break;

        /* -------------------------------
         * Update Order
         * ----------------------------- */
        order.status = StatusOrders.PROCESSING;
        order.started_at = new Date();
        await ordersRepo.save(order);

        /* -------------------------------
         * Update Counter
         * ----------------------------- */
        counter.status = 'WAITING_AMR';
        counter.execution_group_id = executionGroupId;
        counter.light_color_hex = groupColor;
        counter.light_color_hex = this.mapColorToHex(groupColor);
        counter.light_mode = 'ON';
        counter.current_order_id = order.order_id;
        counter.current_wrs_id = amr.wrs_id;
        await counterRepo.save(counter);

        /* -------------------------------
         * Update AMR
         * ----------------------------- */
        amr.wrs_status = 'Delivering';
        amr.current_order_id = order.order_id;
        amr.target_counter_id = counter.counter_id;
        amr.is_available = false;
        await wrsRepo.save(amr);

        /* -------------------------------
         * Log
         * ----------------------------- */
        await wrsLogRepo.save(
            wrsLogRepo.create({
                wrs_id: amr.wrs_id,
                order_id: order.order_id,
                status: 'Delivering',
                operator: ControlSource.AUTO,
                event: 'Assign order to AMR',
                message: `Order ${order.order_id} assigned to AMR ${amr.wrs_code}`
            })
        );

/* ===============================
 * ⏱️ AUTO RESET → IDLE (5 sec)
 * =============================== */
setTimeout(async () => {
    try {
        const wrsRepo2 = AppDataSource.getRepository(WRS);
        const wrsLogRepo2 = AppDataSource.getRepository(WrsLog);

        const freshAmr = await wrsRepo2.findOne({
            where: { wrs_id: amr.wrs_id }
        });

        // ป้องกัน case มีงานใหม่ซ้อน
        if (
            freshAmr &&
            freshAmr.wrs_status === 'Delivering' &&
            freshAmr.current_order_id === order.order_id
        ) {
            freshAmr.wrs_status = 'IDLE';
            freshAmr.current_order_id = null;
            freshAmr.target_counter_id = null;
            freshAmr.is_available = true;

            await wrsRepo2.save(freshAmr);

            await wrsLogRepo2.save(
                wrsLogRepo2.create({
                    wrs_id: freshAmr.wrs_id,
                    order_id: order.order_id,
                    status: 'IDLE',
                    operator: ControlSource.AUTO,
                    event: 'Auto reset AMR',
                    message: `AMR ${freshAmr.wrs_code} auto reset to IDLE`
                })
            );
        }
    } catch (err) {
        console.error('Auto reset AMR failed', err);
    }
}, 5000);

    }

    /* ----------------------------------------------------
     * 7) Auto-continue (optional)
     * -------------------------------------------------- */
    return {
        message: 'ExecutionGroup processed',
        execution_group_id: executionGroupId,
        used_color: groupColor
    };
}

}
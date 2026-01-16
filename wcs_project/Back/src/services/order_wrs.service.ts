import { EntityManager, In, IsNull, QueryFailedError, Repository } from "typeorm";
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
     * 2) Load waiting orders (PENDING + QUEUE)
     * -------------------------------------------------- */
    const waitingOrders = await ordersRepo.find({
        where: {
            execution_group_id: executionGroupId,
            store_type: 'T1',
            status: In([
                StatusOrders.PENDING,
                StatusOrders.QUEUE
            ])
        },
        order: {
            priority: 'DESC',
            requested_at: 'ASC'
        }
    });

    console.log('[AUTO] waitingOrders count:', waitingOrders.length);

    if (waitingOrders.length === 0) {
        // ไม่มี order ค้าง → เช็คจบกลุ่ม
        if (group.finished_orders >= group.total_orders) {
            group.status = 'FINISHED';
            group.finished_at = new Date();
            await executionGroupRepo.save(group);
            return { message: 'ExecutionGroup finished' };
        }
        return { message: 'No waiting orders' };
    }

    /* ----------------------------------------------------
     * 3) Load available counters
     * -------------------------------------------------- */
    const availableCounters = await counterRepo.find({
        where: {
            status: 'EMPTY',
            execution_group_id: IsNull()
        }
    });

    console.log('[AUTO] availableCounters count:', availableCounters.length);

    if (availableCounters.length === 0) {
    console.log('[AUTO] EXIT: counter full → orders stay QUEUE');

    // อัปเดต status ของ order ที่รอทั้งหมดเป็น QUEUE
    for (const order of waitingOrders) {
        if (order.status === 'PENDING') {
            await ordersRepo.update(
                { order_id: order.order_id },
                { status: StatusOrders.QUEUE, queued_at: new Date() }
            );
        }
    }

    return { message: 'Counter full, orders queued' };
}


    const slot = Math.min(
        availableCounters.length,
        waitingOrders.length
    );

    /* ----------------------------------------------------
     * 4) Prepare group RUNNING + color (but not save yet)
     * -------------------------------------------------- */
    let groupColor = group.counter_color;

    if (!groupColor) {
        const usedColors = (
            await executionGroupRepo.find({
                where: { status: 'RUNNING' }
            })
        )
            .filter(g => g.execution_group_id !== executionGroupId)
            .map(g => g.counter_color)
            .filter((c): c is string => !!c);

        const availableColor = COUNTER_COLORS.find(
            c => !usedColors.includes(c)
        );

        if (!availableColor) {
            console.warn('[AUTO] no available counter color');
            return { message: 'No available counter color' };
        }

        groupColor = availableColor;
    }

    let assignedCount = 0;

    /* ----------------------------------------------------
     * 5) Assign execution
     * -------------------------------------------------- */
    for (let i = 0; i < slot; i++) {
        const order = waitingOrders[i];
        const counter = availableCounters[i];

        // หา AMR ว่าง
        const amr = await wrsRepo.findOne({
            where: {
                is_available: true,
                wrs_status: 'IDLE'
            }
        });

        if (!amr) {
            console.warn('[AUTO] no AMR available, stop assigning');
            break;
        }

    console.log('[AUTO] assigning', {
            order_id: order.order_id,
            counter_id: counter.counter_id,
            wrs_id: amr.wrs_id
        });

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
        counter.light_color_hex = this.mapColorToHex(groupColor);
        counter.light_mode = 'ON';
        counter.current_order_id = order.order_id;
        counter.current_wrs_id = amr.wrs_id;
        counter.last_event_at = new Date();
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

        assignedCount++;
    }

    /* ----------------------------------------------------
     * 6) Commit group RUNNING only if assigned
     * -------------------------------------------------- */
    if (assignedCount > 0) {
        if (group.status !== 'RUNNING') {
            group.status = 'RUNNING';
            group.started_at = group.started_at ?? new Date();
        }

        if (!group.counter_color) {
            group.counter_color = groupColor!;
        }

        await executionGroupRepo.save(group);
    }

    /* ----------------------------------------------------
     * 7) Done
     * -------------------------------------------------- */
    return {
        message: 'ExecutionGroup auto processed',
        execution_group_id: executionGroupId,
        assigned: assignedCount,
        used_color: group.counter_color ?? null
    };
}



}
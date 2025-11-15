/**
 * NOTE — Goals of this refactor
 * - Keep public API and overall flow identical
 * - Remove duplication (repos, tx boilerplate, tiny cast helpers)
 * - Tighten idempotency & event logging (unchanged behavior)
 * - Keep structure and naming stable for minimal surface change
 */
import { EntityManager, Repository } from "typeorm";
import { AppDataSource } from "../config/app-data-source";
import { ApiResponse } from "../models/api-response.model";
import { TaskMrs } from "../entities/task_mrs.entity";
import { TaskMrsDetail } from "../entities/task_mrs_detail.entity";
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

/**
 * NOTE — Goals of this refactor (modified for FAT Task Status Response)
 * - Keep public API and overall flow identical
 * - Align MRS task status transitions with FAT: 
 *   QUEUED → OPENING_AISLE → AISLE_OPEN → WAITING_FINISH → CLOSING_AISLE → COMPLETED/FAILED
 */
export class T1MOrdersService {
    // NOTE: เวลาอยู่ใน transaction ให้ใช้ useManager.getRepository(...) เท่านั้น
    private readonly STORE = "T1M" as const;
    private readonly sessionIdleMs = 60_000; // ต่ออายุ session 60s ทุกครั้งที่มี activity

    // รับ gateway ผ่าน constructor
    constructor(private gw: MrsGateway) {}

    // ====== Tiny helpers (no behavior changes) ======
    private s = (v: unknown) => (v == null ? null : String(v));

    /** Centralized repo getter per EntityManager */
    private repos(em: EntityManager) {
        return {
            taskRepo: em.getRepository(TaskMrs),
            taskDetailRepo: em.getRepository(TaskMrsDetail),
            mrsRepo: em.getRepository(MRS),
            aisleRepo: em.getRepository(Aisle),
            mrslogRepo: em.getRepository(MrsLog),
            ordersRepo: em.getRepository(Orders),
            taskLogRepo: em.getRepository(OrdersLog),
            stockItemsRepo: em.getRepository(StockItems)
        } as const;
    }

    private async beginTx(manager?: EntityManager) {
        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
        if (!useManager)
            throw new Error(lang.msg("validation.no_entityManager_or_queryRunner_available"));

        if (!manager && queryRunner) {
            await queryRunner.connect();
            await queryRunner.startTransaction();
        }

        const r = this.repos(useManager);
        return {
            useManager,
            queryRunner,
            ...r,
            commit: async () => {
                if (!manager && queryRunner) await queryRunner.commitTransaction();
            },
            rollback: async () => {
                if (!manager && queryRunner) await queryRunner.rollbackTransaction();
            },
            release: async () => {
                if (!manager) await queryRunner?.release();
            },
        } as const;
    }

    //บันทึก log ของ order
    public async logTaskEvent(
        manager: EntityManager,
        order: Orders,
        params?: {
            actor?: string | null;
            source?: TaskSource | string | null;
            subsystem?: TaskSubsystem | string | null;
            reason_code?: string | null;
            meta?: any;
            status?: StatusOrders | string | null;
        }
    ): Promise<void> {
        const repo = manager.getRepository(OrdersLog);

        // ─────────────────────────────────────────────
        //   1) โหลดข้อมูลสินค้า จาก m_stock_items
        // ─────────────────────────────────────────────
        const stockRepo = manager.getRepository(StockItems);
        const stock = await stockRepo.findOne({
            where: { stock_item: order.stock_item }
        });

        const itemName = stock?.item_name ?? null;
        const itemDesc = stock?.item_desc ?? null;

        // ─────────────────────────────────────────────
        //   2) Logic เดิม (source / actor / subsystem)
        // ─────────────────────────────────────────────
        const resolvedSource: TaskSource =
            (params?.source as TaskSource) ?? TaskSource.SYSTEM;

        const resolvedSubsystem: TaskSubsystem =
            (params?.subsystem as TaskSubsystem) ?? TaskSubsystem.CORE;

        const resolvedActor: string | null =
            params?.actor ??
            (resolvedSource === TaskSource.API ? null : (resolvedSource as string));

        // ─────────────────────────────────────────────
        //   3) Insert Log
        // ─────────────────────────────────────────────
        await repo.insert({
            order_id: String(order.order_id),
            store_type: 'T1M',

            type: order.type as any,
            stock_item: String(order.stock_item),

            // ⭐ ใช้ข้อมูลจาก m_stock_items
            item_name: itemName || null,
            item_desc: itemDesc || null,

            from_location: order.from_location || null,
            source_loc: order.source_loc || null,
            source_box_loc: order.source_box_loc || null,
            dest_loc: order.dest_loc || null,
            dest_box_loc: order.dest_box_loc || null,
            cond: order.cond || null,
            plan_qty: order.plan_qty ?? 0,
            actual_qty: order.actual_qty ?? 0,
            status: (params?.status as any) ?? null,
            is_confirm: order.is_confirm ?? false,

            actor: resolvedActor,
            source: resolvedSource as any,
            subsystem: resolvedSubsystem as any,
            reason_code: (params?.reason_code as any) ?? null,
            meta_json: params?.meta ?? null,
        });
    }

    private extendSession(device: MRS) {
        (device as any).open_session_expires_at = new Date(Date.now() + this.sessionIdleMs);
    }

    //บันทึก mrs และ mrslog
    private async prepareMRSForMoving(
        mrsRepo: Repository<MRS>,
        mrslogRepo: Repository<MrsLog>,
        device: MRS,
        order: Orders,
        targetAisleId: string
    ) {
        // 1) Update MRS → MOVING
        await mrsRepo.update(
            { mrs_id: device.mrs_id },
            {
                mrs_status: StatusMRS.MOVING,
                target_aisle_id: targetAisleId,
                is_available: false,
                last_update: new Date(),
                current_order_id: order.order_id
            }
        );

        // 2) Insert MRS Log → MOVING
        const movingLog = mrslogRepo.create({
            mrs_id: device.mrs_id,
            aisle_id: targetAisleId,
            order_id: order.order_id,
            status: StatusMRS.MOVING,
            operator: ControlSource.AUTO,
            start_time: new Date()
        });
        await mrslogRepo.save(movingLog);

        return movingLog;
    }


    // ====== PUBLIC FLOWS (kept signatures/behavior) ======

    // ======= executionMrs =======
    // ======= executionMrs (แก้ไข) =======
    // async executionMrs(
    //     order_id: string,
    //     reqUsername: string,
    //     manager?: EntityManager
    // ): Promise<ApiResponse<any>> {
    //     const operation = "T1MOrdersService.executionMrs";
    //     let response = new ApiResponse<any>();
    //     const ctx = await this.beginTx(manager);

    //     try {
    //         const { useManager, mrsRepo, mrslogRepo, ordersRepo } = ctx;

    //         const mock_aisle = "2";
    //         const mock_bank = "B1";

    //         // 1) โหลด order
    //         const order = await ordersRepo.findOne({ where: { order_id } });
    //         if (!order) return response.setIncomplete("Order not found");

    //         await ordersRepo.update(
    //             { order_id },
    //             { 
    //                 status: StatusOrders.PROCESSING,
    //                 started_at: new Date()
    //             }
    //         );
    //         await this.logTaskEvent(useManager, order, {
    //             actor: reqUsername,
    //             status: StatusOrders.PROCESSING
    //         });

    //         // 2) หา device (MRS) จาก from_location
    //         const device = await mrsRepo.findOne({ where: { mrs_code: order.from_location } });
    //         if (!device) return response.setIncomplete("MRS not found");

    //         const bankCode = device.bank_code ?? mock_bank;

    //         // 3) Lock bank rows
    //         const bankRows = await mrsRepo
    //             .createQueryBuilder("m")
    //             .setLock("pessimistic_write")
    //             .where("m.bank_code = :bank", { bank: bankCode })
    //             .getMany();

    //         // กำหนด targetAisleId ก่อนใช้งาน
    //         const targetAisleId = device.current_aisle_id ?? mock_aisle;

    //         // 4) เช็คว่า bank มี MRS ไหนเปิด aisle อยู่หรือไม่
    
    //         const bankBusy = bankRows.some(r =>
    //             r.is_aisle_open && !r.e_stop && r.current_aisle_id === targetAisleId
    //         );

    //         if (bankBusy) {
                
    //             // queue งานนี้เพราะ aisle ใน bank กำลังใช้งาน
    //             await ordersRepo.update(
    //                 { order_id },
    //                 { 
    //                     status: StatusOrders.QUEUED,
    //                     queued_at: new Date()
    //                 }
    //             );
    //             await this.logTaskEvent(useManager, order, {
    //                 actor: reqUsername,
    //                 status: StatusOrders.QUEUED
    //             });
    //             await ctx.commit();
    //             return response.setComplete("Order queued due to bank busy", {
    //                 queued: true,
    //                 order_id
    //             });
    //         }

    //         // 5) Prepare MRS for MOVING
    //         await this.prepareMRSForMoving(
    //             mrsRepo,
    //             mrslogRepo,
    //             device,
    //             order,
    //             targetAisleId
    //         );

    //         // 7) เปิด aisle ผ่าน gateway แบบ mock delay 5 วินาที
    //         await new Promise(resolve => setTimeout(resolve, 5000));

    //         await this.gw.openAisle({
    //             mrs_id: device.mrs_id,
    //             aisle_id: targetAisleId,
    //             order_id: order.order_id
    //         });

    //         await ctx.commit();
    //         return response.setComplete("Order is PROCESSING", { order_id });

    //     } catch (error: any) {
    //         await ctx.rollback();
    //         console.error(operation, error);
    //         throw new Error(`Error in ${operation}: ${error.message}`);
    //     } finally {
    //         await ctx.release();
    //     }
    // }

async executionMrs(
    order_id: string,
    reqUsername: string,
    manager?: EntityManager
): Promise<ApiResponse<any>> {
    const operation = "T1MOrdersService.executionMrs";
    const response = new ApiResponse<any>();
    const ctx = await this.beginTx(manager);

    try {
        const { useManager, mrsRepo, mrslogRepo, ordersRepo } = ctx;

        // 1) โหลด order
        const order = await ordersRepo.findOne({ where: { order_id } });
        if (!order) return response.setIncomplete("Order not found");

        await ordersRepo.update(
            { order_id },
            { 
                status: StatusOrders.PROCESSING,
                started_at: new Date()
            }
        );
        await this.logTaskEvent(useManager, order, {
            actor: reqUsername,
            status: StatusOrders.PROCESSING
        });

        // 2) หา device จริงจาก from_location
        const device = await mrsRepo.findOne({ where: { mrs_code: order.from_location } });
if (!device) return response.setIncomplete("MRS not found");

        // 3) กำหนด mock fallback ตาม from_location
        let targetAisleId: string;
        let bankCode: string;

        // if (device) {
        //     targetAisleId = device.current_aisle_id ?? "1";  // default aisle ถ้าไม่มี
        //     bankCode = device.bank_code ?? "B1";            // default bank ถ้าไม่มี
        // } else {
            // กำหนด mock ตาม from_location เพื่อทดสอบ/force parallel
            if (order.from_location === "AA - TSS STORE") {
                targetAisleId = "2";
                bankCode = "B2";
            } else if (order.from_location === "LMC-M240-STORE (BHS)") {
                targetAisleId = "3";
                bankCode = "B3";
            } else {
                // fallback default
                targetAisleId = "9";
                bankCode = "B9";
            }
        //}

        // 4) Lock bank rows ของ bankCode
        const bankRows = await mrsRepo
            .createQueryBuilder("m")
            .setLock("pessimistic_write")
            .where("m.bank_code = :bank", { bank: bankCode })
            .getMany();

        // 5) เช็คว่า bank ว่างหรือไม่ (aisle ไม่ชนกัน)
        const bankBusy = bankRows.some(r => r.is_aisle_open && !r.e_stop && r.current_aisle_id === targetAisleId);

        if (bankBusy) {
            // queue งานเพราะ aisle ใน bank กำลังใช้งาน
            await ordersRepo.update(
                { order_id },
                { 
                    status: StatusOrders.QUEUED,
                    queued_at: new Date()
                }
            );
            await this.logTaskEvent(useManager, order, {
                actor: reqUsername,
                status: StatusOrders.QUEUED
            });
            await ctx.commit();
            return response.setComplete("Order queued due to bank busy", {
                queued: true,
                order_id
            });
        }

        // 6) Prepare MRS และเปิด aisle
        await this.prepareMRSForMoving(
            mrsRepo,
            mrslogRepo,
            device,          // device ของ order (หรือ undefined, ใช้ mock fallback)
            order,
            targetAisleId
        );

        // 7) mock delay ถ้าต้องการ
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 8) เปิด aisle ผ่าน gateway
        await this.gw.openAisle({
            mrs_id: device.mrs_id,
            aisle_id: targetAisleId,
            order_id: order.order_id
        });

        await ctx.commit();
        return response.setComplete("Order is PROCESSING", { order_id });

    } catch (error: any) {
        await ctx.rollback();
        console.error(operation, error);
        throw new Error(`Error in ${operation}: ${error.message}`);
    } finally {
        await ctx.release();
    }
}


    // ======= onOpenFinished (แก้ไข) =======
    async onOpenFinished(
        payload: { order_id: string; aisle_id: string; duration_ms?: number },
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const operation = "T1MOrdersService.onOpenFinished";
        let response = new ApiResponse<any>();

        const ctx = await this.beginTx(manager);
        try {
            const { useManager, mrslogRepo, ordersRepo, mrsRepo, aisleRepo } = ctx;

            // โหลด order
            const order = await ordersRepo.findOne({ where: { order_id: payload.order_id } });
            if (!order) return response.setIncomplete("Order not found");

            // 1) Update order status -> AISLE_OPEN
            await ordersRepo.update({ order_id: order.order_id }, { status: StatusOrders.AISLE_OPEN });
            await this.logTaskEvent(useManager, order, {
                actor: null,
                status: StatusOrders.AISLE_OPEN
            });

            const now = new Date();

            // 2) บันทึก MrsLog -> OPENED
            // หา mrs_id จริง: ถ้า order เก็บ from_location (mrs_code) ให้ map -> mrs_id
    const device = await mrsRepo.findOne({ where: { mrs_code: order.from_location } });
    const mrsId = device?.mrs_id ?? null;  // string | null

    // อัปเดตสถานะช่อง -> AISLE_OPEN
            await aisleRepo.update(
                { aisle_id: payload.aisle_id },
                { status: AisleStatus.OPEN as any, last_opened_at: now, last_event_at: now }
            );

    const movingLog = mrslogRepo.create({
        mrs_id: mrsId,           // ✔ string | null
        aisle_id: payload.aisle_id,         
        order_id: order.order_id, // ✔ string
        status: StatusMRS.OPENED,
        operator: ControlSource.AUTO,
        start_time: new Date(),
    });

    await mrslogRepo.save(movingLog);



            // 3) ต่ออายุ session หากมี device
            if (device) {
                (device as any).mrs_status = StatusMRS.OPENED,
                (device as any).is_aisle_open = true;
                (device as any).open_session_aisle_id = this.s(payload.aisle_id);
                (device as any).current_aisle_id = this.s(payload.aisle_id);
                (device as any).current_order_id = this.s(payload.order_id);
                this.extendSession(device);
                await mrsRepo.save(device);
            }

            await ctx.commit();
            return response.setComplete("AISLE_OPEN finished", { order_id: order.order_id });

        } catch (error: any) {
            await ctx.rollback();
            console.error(operation, error);
            throw new Error(`Error in ${operation}: ${error.message}`);
        } finally {
            await ctx.release();
        }
    }

}

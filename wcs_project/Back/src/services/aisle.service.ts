import { EntityManager, QueryFailedError, Repository } from "typeorm";
import { AppDataSource } from "../config/app-data-source";
import { ApiResponse } from "../models/api-response.model";
import * as lang from '../utils/LangHelper';
import * as validate from '../utils/ValidationUtils';

import { Aisle } from "../entities/aisle.entity";
import { AisleStatus, ControlSource, LogResult, MrsLogAction } from "../common/global.enum";
import { MRS } from "../entities/mrs.entity";
import { MrsLog } from "../entities/mrs_log.entity";
import { MrsGateway } from "../gateways/mrs.gateway";
import { AisleDropdownModel } from "../models/aisle_dropdown.model";

export class AisleService {
    private aisleRepository : Repository<Aisle>;

    constructor(private gw: MrsGateway){
        this.aisleRepository = AppDataSource.getRepository(Aisle);
    }

    private s = (v: unknown) => (v == null ? null : String(v));

    // ---------- 1) Manual control: OPEN / CLOSE ----------
    async manualControl(
        data: { aisle_id: string; action: "OPEN" | "CLOSE"; mrs_id?: string },
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = "AisleService.manualControl";

        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
        if (!useManager) return response.setIncomplete(lang.msg("validation.no_entityManager_or_queryRunner_available"));

        if (!manager && queryRunner) { await queryRunner.connect(); await queryRunner.startTransaction(); }

        try {
            // ----- Validate -----
            if (validate.isNullOrEmpty(data.aisle_id))
                return response.setIncomplete(lang.msgRequired("aisle.aisle_id"));
            if (validate.isNullOrEmpty(data.action))
                return response.setIncomplete(lang.msgRequired("aisle.action"));

            const aisleRepo = useManager.getRepository(Aisle);
            const mrsRepo   = useManager.getRepository(MRS);
            const logRepo   = useManager.getRepository(MrsLog);

            const aisle = await aisleRepo.findOne({ where: { aisle_id: this.s(data.aisle_id)! } });
            if (!aisle) return response.setIncomplete(lang.msgNotFound("item.aisle"));

            // ============ OPEN ============
            if (data.action === "OPEN") {
                if (aisle.status === AisleStatus.BLOCKED)
                return response.setIncomplete(lang.msg("validation.aisle_blocked"));

                // เลือก/ยืนยันเครื่อง (ให้ user ระบุ หรือเลือกอัตโนมัติใน bank เดียวกัน)
                let device: MRS | null = null;

                if (data.mrs_id) {
                    device = await mrsRepo
                        .createQueryBuilder("m")
                        .setLock("pessimistic_write")
                        .where("m.mrs_id = :id", { id: this.s(data.mrs_id)! })
                        .getOne();
                    if (!device) return response.setIncomplete(lang.msgNotFound("item.mrs"));
                    if ((device as any).e_stop) return response.setIncomplete(lang.msg("validation.mrs_e_stop_active"));
                    if (!(device as any).bank_code || (device as any).bank_code !== (aisle as any).bank_code)
                        return response.setIncomplete(lang.msg("validation.mrs_bank_mismatch"));
                    if (!(device as any).is_available || (device as any).current_task_id)
                        return response.setIncomplete(lang.msg("validation.mrs_not_available"));
                } else {
                    // auto-pick MRS ที่ว่างใน bank เดียวกัน (แนวเดียวกับ T1M)
                    device = await mrsRepo
                        .createQueryBuilder("m")
                        .setLock("pessimistic_write")
                        .where("m.bank_code = :bank", { bank: (aisle as any).bank_code })
                        .andWhere("m.is_available = 1")
                        .andWhere("m.e_stop = 0")
                        .andWhere("m.current_task_id IS NULL")
                        .orderBy("COALESCE(m.last_heartbeat_at, m.last_update)", "DESC")
                        .limit(1)
                        .getOne();
                    if (!device) return response.setIncomplete(lang.msg("validation.no_device_available_in_bank"));
                }

                // จองเครื่อง + mark session (manual)
                (device as any).is_available = false;
                (device as any).current_aisle_id = this.s(data.aisle_id);
                (device as any).is_aisle_open = true;
                (device as any).open_session_aisle_id = this.s(data.aisle_id);
                (device as any).open_session_expires_at = new Date(Date.now() + 60_000);
                await mrsRepo.save(device);

                // log OPEN_AISLE (manual) — ใช้ insert() แล้วอ่าน identifiers/raw.insertId
                const insertRes = await logRepo.insert({
                    mrs_id: String(device.mrs_id),
                    aisle_id: String(data.aisle_id),
                    action: MrsLogAction.OPEN_AISLE,
                    operator: ControlSource.MANUAL,
                    start_time: new Date(),
                    result: LogResult.IN_PROGRESS,
                });

                // รองรับทั้ง Postgres/MySQL
                const mrsLogId = String(insertRes.identifiers?.[0]?.id ?? insertRes.raw?.insertId ?? "");

                // update ไทม์แสตมป์
                await aisleRepo.update(
                    { aisle_id: String(data.aisle_id) },
                    { update_by: reqUsername, last_event_at: new Date() }
                );

                // commit ก่อนยิงคำสั่งจริง
                if (!manager && queryRunner) await queryRunner.commitTransaction();

                await this.gw.openAisle({
                    mrs_id: device.mrs_id,
                    aisle_id: Number(data.aisle_id),
                    // manual ไม่มี task_mrs_id
                } as any);

                return response.setComplete(lang.msgSuccessAction("updated", "item.aisle"), {
                    action: "OPEN",
                    aisle_id: String(data.aisle_id),
                    mrs_id: String(device.mrs_id),
                    mrs_log_id: mrsLogId, // ✅ ใช้ id จาก insert
                });

            }

            // ============ CLOSE ============
            if (data.action === "CLOSE") {
                // หาเครื่องที่ถือ session ของ aisle นี้อยู่
                const device = await mrsRepo.findOne({
                    where: {
                        open_session_aisle_id: this.s(data.aisle_id) as any,
                        is_aisle_open: true as any,
                    },
                });
                if (!device) return response.setIncomplete(lang.msg("validation.no_open_session_for_aisle"));

                /// log CLOSE_AISLE (manual) — ใช้ insert() แล้วอ่าน identifiers/raw.insertId
                const insertRes = await logRepo.insert({
                    mrs_id: String(device.mrs_id),
                    aisle_id: String(data.aisle_id),
                    action: MrsLogAction.CLOSE_AISLE,
                    operator: ControlSource.MANUAL,
                    start_time: new Date(),
                    result: LogResult.IN_PROGRESS,
                });

                // รองรับได้ทั้ง Postgres/MySQL/MariaDB
                const mrsLogId = String(insertRes.identifiers?.[0]?.id ?? insertRes.raw?.insertId ?? "");

                // อัปเดตไทม์แสตมป์ของ Aisle
                await aisleRepo.update(
                    { aisle_id: String(data.aisle_id) },
                    { update_by: reqUsername, last_event_at: new Date() }
                );

                // commit ก่อนยิงคำสั่งจริง
                if (!manager && queryRunner) await queryRunner.commitTransaction();

                await this.gw.closeAisle({
                    mrs_id: Number(device.mrs_id),
                    aisle_id: Number(data.aisle_id),
                    // manual ไม่มี task_mrs_id
                } as any);

                return response.setComplete(lang.msgSuccessAction("updated", "item.aisle"), {
                    action: "CLOSE",
                    aisle_id: String(data.aisle_id),
                    mrs_id: String(device.mrs_id),
                    mrs_log_id: mrsLogId, // ✅ ใช้ id จาก insert
                });

            }

            return response.setIncomplete(lang.msg("validation.enum_invalid", { field: "action", allow: "OPEN, CLOSE" }));
        } catch (error: any) {
            if (!manager) await queryRunner?.rollbackTransaction();
            console.error(operation, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            if (!manager) await queryRunner?.release();
        }
    }

    // ---------- 2) Callback: เปิดเสร็จ ----------
    async onManualOpenFinished(
        payload: { mrs_id: string | number; aisle_id: string | number; duration_ms?: number },
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = "AisleService.onManualOpenFinished";

        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
        if (!useManager) return response.setIncomplete(lang.msg("validation.no_entityManager_or_queryRunner_available"));

        if (!manager && queryRunner) { await queryRunner.connect(); await queryRunner.startTransaction(); }

        try {
        const aisleRepo = useManager.getRepository(Aisle);
        const mrsRepo   = useManager.getRepository(MRS);
        const logRepo   = useManager.getRepository(MrsLog);

        const now = new Date();

        // flip Aisle → OPEN
        await aisleRepo.update(
            { aisle_id: String(payload.aisle_id) },
            { status: AisleStatus.OPEN as any, last_opened_at: now, last_event_at: now }
        );

        // ปิด MrsLog (OPEN) ล่าสุดของ mrs/aisle นี้
        await logRepo.createQueryBuilder()
            .update(MrsLog)
            .set({ end_time: now, task_duration: payload.duration_ms ?? null, result: LogResult.SUCCESS })
            .where("mrs_id = :mrs AND aisle_id = :aisle AND action = :act AND result = :res", {
            mrs: String(payload.mrs_id),
            aisle: String(payload.aisle_id),
            act: MrsLogAction.OPEN_AISLE,
            res: LogResult.IN_PROGRESS,
            })
            .orderBy("start_time", "DESC")
            .limit(1)
            .execute();

        // refresh session flags
        const device = await mrsRepo.findOne({ where: { mrs_id: payload.mrs_id as any } });
        if (device) {
            (device as any).is_aisle_open = true;
            (device as any).open_session_aisle_id = String(payload.aisle_id);
            (device as any).open_session_expires_at = new Date(Date.now() + 60_000);
            await mrsRepo.save(device);
        }

        if (!manager && queryRunner) await queryRunner.commitTransaction();
        return response.setComplete(lang.msgSuccessAction("updated", "item.aisle"), { opened: true });
        } catch (error: any) {
        if (!manager) await queryRunner?.rollbackTransaction();
        console.error(operation, error);
        throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
        if (!manager) await queryRunner?.release();
        }
    }

    // ---------- 3) Callback: ปิดเสร็จ ----------
    async onManualCloseFinished(
        payload: { mrs_id: string | number; aisle_id: string | number; duration_ms?: number },
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        let response = new ApiResponse<any>();
        const operation = "AisleService.onManualCloseFinished";

        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;
        if (!useManager) return response.setIncomplete(lang.msg("validation.no_entityManager_or_queryRunner_available"));

        if (!manager && queryRunner) { await queryRunner.connect(); await queryRunner.startTransaction(); }

        try {
        const aisleRepo = useManager.getRepository(Aisle);
        const mrsRepo   = useManager.getRepository(MRS);
        const logRepo   = useManager.getRepository(MrsLog);

        const now = new Date();

        // flip Aisle → CLOSED
        await aisleRepo.update(
            { aisle_id: String(payload.aisle_id) },
            { status: AisleStatus.CLOSED as any, last_closed_at: now, last_event_at: now }
        );

        // ปิด MrsLog (CLOSE) ล่าสุดของ mrs/aisle นี้
        await logRepo.createQueryBuilder()
            .update(MrsLog)
            .set({ end_time: now, task_duration: payload.duration_ms ?? null, result: LogResult.SUCCESS })
            .where("mrs_id = :mrs AND aisle_id = :aisle AND action = :act AND result = :res", {
            mrs: String(payload.mrs_id),
            aisle: String(payload.aisle_id),
            act: MrsLogAction.CLOSE_AISLE,
            res: LogResult.IN_PROGRESS,
            })
            .orderBy("start_time", "DESC")
            .limit(1)
            .execute();

        // ปล่อยเครื่อง (manual ไม่มี task → ปล่อยเสมอ)
        const device = await mrsRepo.findOne({ where: { mrs_id: payload.mrs_id as any } });
        if (device) {
            (device as any).current_task_id = null;
            (device as any).current_aisle_id = null;
            (device as any).is_available = true;
            (device as any).is_aisle_open = false;
            (device as any).open_session_aisle_id = null;
            (device as any).open_session_expires_at = null;
            await mrsRepo.save(device);
        }

        if (!manager && queryRunner) await queryRunner.commitTransaction();
        return response.setComplete(lang.msgSuccessAction("updated", "item.aisle"), { closed: true });
        } catch (error: any) {
        if (!manager) await queryRunner?.rollbackTransaction();
        console.error(operation, error);
        throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
        if (!manager) await queryRunner?.release();
        }
    }

    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'AisleService.getAll';
    
        try {
            const repository = manager ? manager.getRepository(Aisle) : this.aisleRepository;
    
            const rawData = await repository
                .createQueryBuilder('aisle')
                .select([
                    'aisle.aisle_id AS aisle_id',
                    'aisle.aisle_code AS aisle_code',
                    'aisle.bank_code AS bank_code',
                    'aisle.status AS status',
                    `DATE_FORMAT(aisle.last_opened_at, '%d/%m/%Y %H:%i:%s') AS last_opened_at`,
                    `DATE_FORMAT(aisle.last_closed_at, '%d/%m/%Y %H:%i:%s') AS last_closed_at`,
                    `DATE_FORMAT(aisle.last_event_at, '%d/%m/%Y %H:%i:%s') AS last_event_at`,
                ])
                .orderBy('aisle.aisle_id', 'ASC')
                .getRawMany();
    
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.aisle'));
            }
    
            return response.setComplete(lang.msgFound('item.aisle'), rawData);
    
        } catch (error: any) {
            console.error('Error in getAll:', error);
    
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getCodeDropdown(
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'AisleService.getCodeDropdown';
    
        try {
            const repository = manager ? manager.getRepository(Aisle) : this.aisleRepository;
    
            // Query ข้อมูลทั้งหมดที่มี so_id เดียวกัน
            const rawData = await repository.createQueryBuilder('aisle')
                .select([
                    "aisle.aisle_id",
                    "CONCAT(aisle.aisle_code, ' ', aisle.bank_code) AS aisle_code_zone",
                ])
                .where("aisle.aisle_code IS NOT NULL") // กรองค่า null ออก
                .distinct(true) // เพื่อให้ได้ค่าที่ไม่ซ้ำกัน
                .getRawMany();
    
            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.aisle'));
            }
    
            // แปลงข้อมูลให้อยู่ในรูปแบบ AisleDropdownModel
            const data = rawData.map((so) => new AisleDropdownModel(so.aisle_aisle_id, so.aisle_code_zone));
    
            // ส่งข้อมูลกลับ
            return response.setComplete(lang.msgFound('item.aisle'), data);
        } catch (error: any) {
            console.error(`Error in ${operation}`, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

}
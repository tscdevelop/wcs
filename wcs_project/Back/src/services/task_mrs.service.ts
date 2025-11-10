// // services/t1m-task.service.ts
// import { EntityManager, Not, QueryFailedError, Repository } from "typeorm";
// import { AppDataSource } from "../config/app-data-source";
// import { ApiResponse } from "../models/api-response.model";
// import { TaskMrs } from '../entities/tasks.entity';
// import { TaskMrsDetail } from '../entities/task_mrs_detail.entity';
// import { MRS } from '../entities/mrs.entity';
// import { Aisle } from '../entities/aisle.entity';
// import { MrsLog } from '../entities/mrs_log.entity';
// import { StatusTasks, LogResult, MrsLogAction, AisleStatus, ControlSource, TaskMrsAction } from '../common/global.enum';
// import * as validate from '../utils/ValidationUtils';
// import * as lang from '../utils/LangHelper';
// import { MrsGateway } from '../gateways/mrs.gateway';
// import { CreateT1MTaskDto } from "../dtos/tasks.dto";
// import { TaskMrsLog } from "../entities/task_history.entity";

// export class T1MTaskService {
//     // NOTE: เวลาอยู่ใน transaction ให้ใช้ useManager.getRepository(...) เท่านั้น
//     private taskRepository: Repository<TaskMrs>;
//     private taskMrsRepository: Repository<TaskMrsDetail>;
//     private mrsRepository: Repository<MRS>;
//     private aisleRepository: Repository<Aisle>;
//     private mrsLogRepository: Repository<MrsLog>;

//     // รับ gateway ผ่าน constructor
//     constructor(private gw: MrsGateway) {
//         this.taskRepository    = AppDataSource.getRepository(TaskMrs);
//         this.taskMrsRepository = AppDataSource.getRepository(TaskMrsDetail);
//         this.mrsRepository     = AppDataSource.getRepository(MRS);
//         this.aisleRepository   = AppDataSource.getRepository(Aisle);
//         this.mrsLogRepository  = AppDataSource.getRepository(MrsLog);
//     }
    
//     private buildTodayPrefix(at = new Date()): string {
//         const y = at.getFullYear();
//         const m = String(at.getMonth() + 1).padStart(2, '0');
//         const d = String(at.getDate()).padStart(2, '0');
//         return `TID-${y}${m}${d}-`;  // e.g. TID-20250828-
//     }

//     private async issueNextTaskCode(manager: EntityManager): Promise<string> {
//         const prefix = this.buildTodayPrefix();

//         // 🔒 ล็อกแถวล่าสุดของวันนั้น ป้องกันชนกัน
//         const rows = await manager.query(
//             `SELECT task_code
//             FROM tasks
//             WHERE task_code LIKE ?
//             ORDER BY task_code DESC
//             LIMIT 1
//             FOR UPDATE`,              // InnoDB จะรอ/ล็อกให้ทีละคำสั่ง
//             [`${prefix}%`]
//         );

//         let next = 1;
//         if (rows.length) {
//             const last: string = String(rows[0].task_code);
//             const tail = last.slice(prefix.length);       // "NNN"
//             const n = parseInt(tail, 10);
//             next = (isNaN(n) ? 0 : n) + 1;
//         }
//         return `${prefix}${String(next).padStart(3, '0')}`;
//     }

    

//     /**
//      * Flow: รับ SKU(T1M) -> resolve aisle -> เลือก/จอง MRS -> task_mrs OPEN(PENDING)+mrs_log(IN_PROGRESS) -> ยิงคำสั่ง -> tasks.IN_PROGRESS
//      * หลังจากนี้รอ event gateway -> onOpenFinished(...)
//      */
//     async createAndOpen(
//         data: CreateT1MTaskDto,
//         reqUsername: string,
//         manager?: EntityManager
//     ): Promise<ApiResponse<any>> {
//         let response = new ApiResponse<any>();
//         const operation = 'T1MTaskService.createAndOpen';

//         const queryRunner = manager ? null : AppDataSource.createQueryRunner();
//         const useManager = manager || queryRunner?.manager;
//         if (!useManager) return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));

//         if (!manager && queryRunner) {
//             await queryRunner.connect();
//             await queryRunner.startTransaction();
//         }

//         try {
//             const taskRepo   = useManager.getRepository(TaskMrs);
//             const mrsRepo    = useManager.getRepository(MRS);
//             const tmRepo     = useManager.getRepository(TaskMrsDetail);
//             const logRepo    = useManager.getRepository(MrsLog);

//             // ----- Validate -----
//             if (validate.isNullOrEmpty(data.stock_item))
//             return response.setIncomplete(lang.msgRequired('field.stock_item'));

//             // 1) resolve SKU -> aisle_id (T1M)
//             const resolved = await this.resolveSkuToAisleT1M(data.stock_item);
//             if (!resolved?.aisle_id)
//             return response.setIncomplete(lang.msg('validation.location_not_found_for_sku'));

//             const bankCode = resolved.bank_code ?? 'B1';

//             const code = await this.issueNextTaskCode(useManager);

//             // 2) create task
//             const task = Object.assign(new TaskMrs(), {
//                 task_code: code,
//                 stock_item: data.stock_item,
//                 plan_qty: data.plan_qty,
//                 priority: data.priority ?? 5,
//                 store_type: 'T1M',
//                 status: StatusTasks.NEW,
//                 requested_by: reqUsername,
//                 target_aisle_id: String(resolved.aisle_id),
//                 target_bank_code: bankCode,
//             });
//             await taskRepo.save(task);
//             // + logTaskEvent: เพิ่งสร้างงาน
//             await this.logTaskEvent(useManager, task, 'TASK_CREATED', {
//                 actor: reqUsername, source: 'API',
//                 next: StatusTasks.NEW, aisle_id: String(resolved.aisle_id), reason_code: null
//             });

//             // 2.1) ตั้ง work_order
//             const orderIdStr = data.work_order ?? String(task.task_id);
//             await taskRepo.update(
//                 { task_id: task.task_id },
//                 { work_order: orderIdStr, status: StatusTasks.ROUTING, updated_at: new Date() }
//             );
//             // + logTaskEvent: เข้าสถานะ ROUTING
//             await this.logTaskEvent(useManager, task, 'TASK_ROUTING', {
//                 prev: StatusTasks.NEW, next: StatusTasks.ROUTING,
//                 aisle_id: String(resolved.aisle_id), reason_code: null
//             });

//             // 2.2) NEW: ล็อกทั้ง bank ก่อนตัดสินใจ
//             const bankRows = await this.lockBankAndGetRows(bankCode, useManager);
//             const bankOpen = bankRows.find(r => (r as any).is_aisle_open && !(r as any).e_stop);

//             if (bankOpen) {
//                 // มี session เปิดอยู่ใน bank นี้แล้ว
//                 if (String(bankOpen.current_aisle_id) === String(resolved.aisle_id)) {
//                     // เดิมมีใน aisle เดียวกัน → ใช้ flow JOIN_OPEN_SESSION เดิมของคุณ
//                     // (โค้ดเดิมของคุณ: findActiveOpenSession(resolved.aisle_id, ...) → QUEUED + JOIN_OPEN_SESSION)
//                 } else {
//                     // คนละ aisle แต่ bank เดียวกัน → ต้องเข้าคิว ห้ามเปิดซ้อน
//                     await taskRepo.update(
//                         { task_id: task.task_id },
//                         { status: StatusTasks.QUEUED, updated_at: new Date() }
//                     );
//                     // ⬇️ logTaskEvent ที่นี่ เพราะเราจะ return ออกเลย
//                     await this.logTaskEvent(useManager, task, 'QUEUED', {
//                         prev: StatusTasks.ROUTING,
//                         next: StatusTasks.QUEUED,
//                         reason_code: 'BANK_BUSY',               // สำคัญ: ระบุสาเหตุเข้าคิว
//                         aisle_id: String(resolved.aisle_id),
//                         mrs_id: String((bankOpen as any).mrs_id) // ถ้า entity มี mrs_id ใส่ได้, ไม่มีก็ละทิ้งได้
//                     });
                    
//                     if (!manager && queryRunner) await queryRunner.commitTransaction();
//                         return response.setComplete(
//                         lang.msg('queued.item.t1m_task'),
//                         { queued: true, work_order: orderIdStr, task_id: task.task_id, bank_code: bankCode }
//                     );
//                 }
//             }

//             // 2.3) ⭐ ถ้ามี session เปิดอยู่ใน aisle นี้ → แนบงานเข้า session (คิวใน aisle เดิม)
//             const active = await this.findActiveOpenSession(resolved.aisle_id, useManager);
//             if (active) {
//                 await taskRepo.update(
//                     { task_id: task.task_id },
//                     { status: StatusTasks.QUEUED, updated_at: new Date() }
//                 );
//                 // + logTaskEvent: คิวเพื่อ join session ช่องเดิม
//                 await this.logTaskEvent(useManager, task, 'QUEUED', {
//                     prev: StatusTasks.ROUTING, next: StatusTasks.QUEUED,
//                     reason_code: 'JOIN_OPEN_SESSION', aisle_id: String(resolved.aisle_id), mrs_id: String(active.mrs_id)
//                 });

//                 await logRepo.save(logRepo.create({
//                     mrs_id: String(active.mrs_id),
//                     aisle_id: String(resolved.aisle_id),
//                     task_id: String(task.task_id),
//                     action: MrsLogAction.JOIN_OPEN_SESSION as any,
//                     operator: ControlSource.AUTO,
//                     start_time: new Date(),
//                     result: LogResult.IN_PROGRESS
//                 }));

//                 this.extendSession(active);
//                 await mrsRepo.save(active);

//                 if (!manager && queryRunner) await queryRunner.commitTransaction();
//                 return response.setComplete(
//                     lang.msgSuccessAction('created', 'item.t1m_task'),
//                     {
//                     work_order: orderIdStr,
//                     task_id: task.task_id,
//                     aisle_id: String(resolved.aisle_id),
//                     mrs_id: active.mrs_id,
//                     joined_open_session: true
//                     }
//                 );
//             }

//             // 3) ไม่มี session → reserve MRS และสั่ง OPEN
//             const device = await this.pickMrsForAisle(resolved.aisle_id, useManager);
//             if (!device) {
//                 await taskRepo.update({ task_id: task.task_id }, { status: StatusTasks.QUEUED, updated_at: new Date() });
//                 // + logTaskEvent: เข้าคิวเพราะไม่มีเครื่องว่าง
//                 await this.logTaskEvent(useManager, task, 'QUEUED', {
//                     prev: StatusTasks.ROUTING, next: StatusTasks.QUEUED,
//                     reason_code: 'NO_DEVICE', aisle_id: String(resolved.aisle_id)
//                 });

//                 if (!manager && queryRunner) 
//                     await queryRunner.commitTransaction();
//                 return response.setComplete(
//                     lang.msg('queued.item.t1m_task'),
//                     { queued: true, work_order: orderIdStr, task_id: task.task_id, bank_code: bankCode }
//                 );
//             }

//             device.current_task_id  = task.task_id as any;
//             device.current_aisle_id = String(resolved.aisle_id) as any;
//             device.is_available     = false;

//             // ⭐ mark session open
//             (device as any).is_aisle_open = true;
//             (device as any).open_session_aisle_id = String(resolved.aisle_id);
//             (device as any).open_session_order_id = orderIdStr;
//             this.extendSession(device);
//             await mrsRepo.save(device);

//             // 4) task_mrs OPEN (PENDING)
//             const openDetail = tmRepo.create({
//                 task_id: String(task.task_id),
//                 mrs_id: String(device.mrs_id),
//                 target_aisle_id: String(resolved.aisle_id),
//                 action: TaskMrsAction.OPEN,
//                 operator: ControlSource.AUTO,
//                 result: LogResult.PENDING,
//                 started_at: new Date(),
//             });
//             await tmRepo.save(openDetail);

//             // 5) mrs_log start (IN_PROGRESS)
//             await logRepo.save(logRepo.create({
//                 mrs_id: String(device.mrs_id),
//                 aisle_id: String(resolved.aisle_id),
//                 task_id: String(task.task_id),
//                 task_mrs_id: openDetail.id,
//                 action: MrsLogAction.OPEN_AISLE,
//                 operator: ControlSource.AUTO,
//                 start_time: new Date(),
//                 result: LogResult.IN_PROGRESS,
//             }));

//             // 6) send command
//             await this.gw.openAisle({
//                 mrs_id: device.mrs_id,
//                 aisle_id: Number(resolved.aisle_id),
//                 task_mrs_id: openDetail.id
//             });

//             // 7) tasks.IN_PROGRESS
//             await taskRepo.update({ task_id: task.task_id }, { status: StatusTasks.IN_PROGRESS, updated_at: new Date() });
//             // + logTaskEvent: เริ่มทำงานกับเครื่องจริง
//             await this.logTaskEvent(useManager, task, 'TASK_EXECUTING', {
//                 prev: StatusTasks.ROUTING, next: StatusTasks.IN_PROGRESS,
//                 mrs_id: String(device.mrs_id), aisle_id: String(resolved.aisle_id)
//             });

//             const result = {
//                 work_order: orderIdStr,
//                 task_id: task.task_id,
//                 aisle_id: String(resolved.aisle_id),
//                 mrs_id: device.mrs_id,
//                 task_mrs_open_id: openDetail.id,
//             };
//             response = response.setComplete(lang.msgSuccessAction('created', 'item.t1m_task'), result);

//             if (!manager && queryRunner) await queryRunner.commitTransaction();
//             return response;
//         } catch (error: any) {
//             if (!manager) await queryRunner?.rollbackTransaction();
//             console.error(operation, error);
//             throw new Error(lang.msgErrorFunction(operation, error.message));
//         } finally {
//             if (!manager) await queryRunner?.release();
//         }
//     }


//     /** ถูกเรียกโดย gateway เมื่อเปิดเสร็จ (idempotent) -> WAIT_CONFIRM */
//     async onOpenFinished(
//         payload: { task_mrs_id: string; duration_ms?: number },
//         manager?: EntityManager
//     ): Promise<ApiResponse<any>> {
//         let response = new ApiResponse<any>();
//         const operation = 'T1MTaskService.onOpenFinished';

//         const queryRunner = manager ? null : AppDataSource.createQueryRunner();
//         const useManager = manager || queryRunner?.manager;
//         if (!useManager) return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));

//         if (!manager && queryRunner) { await queryRunner.connect(); await queryRunner.startTransaction(); }

//         try {
//             const tmRepo    = useManager.getRepository(TaskMrsDetail);
//             const logRepo   = useManager.getRepository(MrsLog);
//             const aisleRepo = useManager.getRepository(Aisle);
//             const taskRepo  = useManager.getRepository(TaskMrs);
//             const mrsRepo   = useManager.getRepository(MRS);

//             const detail = await tmRepo.findOne({ where: { id: payload.task_mrs_id } });
//             if (!detail) return response.setIncomplete(lang.msg('validation.not_found'));

//             if (detail.action !== TaskMrsAction.OPEN) {
//                 return response.setIncomplete(lang.msg('validation.invalid_action_for_handler'));
//             }

//             // idempotent guard
//             if (detail.result === LogResult.SUCCESS) {
//             if (!manager && queryRunner) await queryRunner.commitTransaction();
//                 return response.setComplete(lang.msgSuccessAction('updated', 'item.task_mrs'), { task_mrs_id: detail.id });
//             }

//             const now = new Date();

//             // ปิด task_mrs (OPEN) เป็น SUCCESS
//             detail.finished_at      = now;
//             detail.result           = LogResult.SUCCESS;
//             detail.open_duration_ms = payload.duration_ms;
//             await tmRepo.save(detail);

//             // อัปเดตสถานะช่อง
//             await aisleRepo.update(
//                 { aisle_id: detail.target_aisle_id },
//                 { status: AisleStatus.OPEN as any, last_opened_at: now, last_event_at: now }
//             );

//             // ปิด log ด้วย task_mrs_id โดยตรง
//             await logRepo.update(
//                 { task_mrs_id: String(detail.id) },
//                 { end_time: now, task_duration: payload.duration_ms ?? null, result: LogResult.SUCCESS }
//             );

//             // ⭐ ยืนยัน session เปิดอยู่บน MRS + ต่ออายุ
//             const device = await mrsRepo.findOne({ where: { mrs_id: detail.mrs_id as any } });
//             if (device) {
//                 (device as any).is_aisle_open = true;
//                 (device as any).open_session_aisle_id = String(detail.target_aisle_id);
//                 this.extendSession(device);
//                 await mrsRepo.save(device);
//             }

//             // เข้าสถานะรอผู้ใช้ยืนยัน
//             await taskRepo.update(
//                 { task_id: detail.task_id },
//                 { status: StatusTasks.WAIT_CONFIRM, updated_at: now }
//             );
//             // + logTaskEvent: รอผู้ใช้ยืนยัน
//             const t = await taskRepo.findOne({ where: { task_id: detail.task_id } });
//             if (t) {
//                 await this.logTaskEvent(useManager, t, 'TASK_WAIT_CONFIRM', {
//                     prev: StatusTasks.IN_PROGRESS, next: StatusTasks.WAIT_CONFIRM,
//                     mrs_id: String(detail.mrs_id), aisle_id: String(detail.target_aisle_id)
//                 });
//             }

//             response = response.setComplete(lang.msgSuccessAction('updated', 'item.task_mrs'), { task_mrs_id: detail.id });
//             if (!manager && queryRunner) await queryRunner.commitTransaction();
//             return response;
//         } catch (error: any) {
//             if (!manager) await queryRunner?.rollbackTransaction();
//             console.error(operation, error);
//             throw new Error(lang.msgErrorFunction(operation, error.message));
//         } finally {
//             if (!manager) await queryRunner?.release();
//         }
//     }


//     /**
//      * ผู้ใช้กดยืนยัน -> ตรวจ sensor; ถ้า clear: สั่งปิด, ถ้าไม่ clear: discard (log ไว้) และยัง WAIT_CONFIRM
//      */
//     async closeAfterConfirm(
//         task_id: string,
//         reqUsername: string,
//         manager?: EntityManager
//     ): Promise<ApiResponse<any>> {
//         let response = new ApiResponse<any>();
//         const operation = 'T1MTaskService.closeAfterConfirm';

//         const queryRunner = manager ? null : AppDataSource.createQueryRunner();
//         const useManager = manager || queryRunner?.manager;
//         if (!useManager) return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));

//         if (!manager && queryRunner) { await queryRunner.connect(); await queryRunner.startTransaction(); }

//         try {
//             const taskRepo = useManager.getRepository(TaskMrs);
//             const tmRepo   = useManager.getRepository(TaskMrsDetail);
//             const logRepo  = useManager.getRepository(MrsLog);
//             const mrsRepo  = useManager.getRepository(MRS);

//             const task = await taskRepo.findOne({ where: { task_id } });
//             if (!task) return response.setIncomplete(lang.msg('validation.not_found'));

//             // ต้องมีรอบ OPEN ของงานนี้
//             const lastOpen = await tmRepo.findOne({
//             where: { task_id: String(task_id), action: TaskMrsAction.OPEN as any },
//             order: { started_at: 'DESC' }
//             });
//             if (!lastOpen) return response.setIncomplete(lang.msg('validation.not_found'));
//             // + logTaskEvent: ผู้ใช้ยืนยันหยิบเสร็จ
//             await this.logTaskEvent(useManager, task, 'USER_CONFIRM', {
//                 actor: reqUsername, source: 'API',
//                 mrs_id: String(lastOpen.mrs_id), aisle_id: String(lastOpen.target_aisle_id)
//             });

//             // 1) sensor ต้อง clear
//             const sensorClear = await this.isAisleSensorClear(lastOpen.target_aisle_id);
//             if (!sensorClear) {
//                 // + logTaskEvent: ยืนยันแต่ปิดไม่ได้เพราะ sensor
//                 await this.logTaskEvent(useManager, task, 'USER_CONFIRM_BLOCKED', {
//                     prev: StatusTasks.WAIT_CONFIRM, next: StatusTasks.WAIT_CONFIRM,
//                     reason_code: 'SENSOR_BLOCKED', aisle_id: String(lastOpen.target_aisle_id), mrs_id: String(lastOpen.mrs_id)
//                 });
//                 await logRepo.save(logRepo.create({
//                     mrs_id: lastOpen.mrs_id,
//                     aisle_id: lastOpen.target_aisle_id,
//                     task_id: String(task_id),
//                     action: MrsLogAction.CLOSE_AISLE,
//                     operator: ControlSource.AUTO,
//                     start_time: new Date(),
//                     end_time: new Date(),
//                     result: LogResult.DISCARDED,
//                     error_msg: 'Sensor detects object; discard close',
//                 } as any));
//                 await taskRepo.update({ task_id }, { status: StatusTasks.WAIT_CONFIRM, updated_at: new Date() });
//                 if (!manager && queryRunner) await queryRunner.commitTransaction();
//                 return response.setIncomplete(lang.msg('validation.sensor_detect_object_discard_close'));
//             }

//             const now = new Date();

//             // 2) เตรียมข้อมูลสำหรับตัดสินใจ preempt
//             const device   = await mrsRepo.findOne({ where: { mrs_id: lastOpen.mrs_id as any } });  // เครื่องที่ถือ session
//             const bankCode = device?.bank_code ?? 'B1';

//             const [topSameAisle, topInBank] = await Promise.all([
//                 this.getNextTaskSameAisle(lastOpen.target_aisle_id, useManager), // QUEUED ใน aisle เดิม (เรียงตาม priority/เวลา/ไอดี)
//                 this.getTopQueuedInBank(bankCode, useManager),                   // QUEUED ทั้ง bank
//             ]);

//             // ถ้าใน bank มีงาน priority สูงกว่า และอยู่คนละ aisle → ปิดตอนนี้ (preempt)
//             const shouldPreempt =
//             !!topInBank &&
//             (!topSameAisle || (
//                 topInBank.priority > topSameAisle.priority &&
//                 String(topInBank.target_aisle_id) !== String(lastOpen.target_aisle_id)
//             ));

//             // 3) ไม่ preempt และมีงานต่อใน aisle เดิม → ทำต่อในช่องเดิม
//             if (!shouldPreempt && topSameAisle && device) {
//                 // ปิดงานปัจจุบันเป็น COMPLETED
//                 await taskRepo.update({ task_id }, { status: StatusTasks.COMPLETED, updated_at: now });
//                 // + logTaskEvent: งานนี้จบ
//                 await this.logTaskEvent(useManager, task, 'TASK_DONE', {
//                     prev: StatusTasks.WAIT_CONFIRM, next: StatusTasks.COMPLETED,
//                     aisle_id: String(lastOpen.target_aisle_id), mrs_id: String(device.mrs_id)
//                 });

//                 // โปรโมตงานถัดไปขึ้น WAIT_CONFIRM + ยึด device ต่อ (เปิดค้าง)
//                 await taskRepo.update(
//                     { task_id: topSameAisle.task_id },
//                     { status: StatusTasks.WAIT_CONFIRM, updated_at: now }
//                 );
//                  // + logTaskEvent: โปรโมตงานถัดไปในช่องเดิม (ข้าม IN_PROGRESS เพราะเปิดค้าง)
//                 const next = await taskRepo.findOne({ where: { task_id: topSameAisle.task_id } });
//                 if (next) {
//                     await this.logTaskEvent(useManager, next, 'TASK_WAIT_CONFIRM', {
//                     prev: StatusTasks.QUEUED, next: StatusTasks.WAIT_CONFIRM,
//                     reason_code: 'CONTINUE_IN_OPEN_SESSION', aisle_id: String(next.target_aisle_id), mrs_id: String(device.mrs_id)
//                     });
//                 }

//                 device.current_task_id = topSameAisle.task_id as any;
//                 (device as any).is_aisle_open = true;
//                 this.extendSession(device);
//                 await mrsRepo.save(device);

//                 // สร้าง task_mrs OPEN (synthetic) ให้ task ใหม่ ถ้ายังไม่มี
//                 let tmOpen = await tmRepo.findOne({
//                     where: { task_id: String(topSameAisle.task_id), action: TaskMrsAction.OPEN as any },
//                     order: { started_at: 'DESC' }
//                 });
//                 if (!tmOpen) {
//                     tmOpen = tmRepo.create({
//                         task_id: String(topSameAisle.task_id),
//                         mrs_id: String(device.mrs_id),
//                         target_aisle_id: String(topSameAisle.target_aisle_id),
//                         action: TaskMrsAction.OPEN,
//                         operator: ControlSource.AUTO,
//                         result: LogResult.SUCCESS, // session เดิม → success ทันที
//                         started_at: now,
//                         finished_at: now,
//                         open_duration_ms: 0,
//                     });
//                     await tmRepo.save(tmOpen);

//                     await logRepo.save(logRepo.create({
//                         mrs_id: String(device.mrs_id),
//                         aisle_id: String(topSameAisle.target_aisle_id),
//                         task_id: String(topSameAisle.task_id),
//                         task_mrs_id: tmOpen.id,
//                         action: MrsLogAction.CONTINUE_IN_OPEN_SESSION,   // มีใน enum
//                         operator: ControlSource.AUTO,
//                         start_time: now,
//                         result: LogResult.IN_PROGRESS,
//                     }));
//                 }

//                 if (!manager && queryRunner) await queryRunner.commitTransaction();
//                 return response.setComplete(
//                     lang.msg('continue_in_open_session'),
//                     { continued: true, next_task_id: topSameAisle.task_id, aisle_id: String(lastOpen.target_aisle_id) }
//                 );
//             }

//             // 4) preempt (หรือไม่มีงาน same-aisle) → สร้าง CLOSE แล้วสั่งปิด
//             const closeDetail = tmRepo.create({
//                 task_id: String(task_id),
//                 mrs_id: lastOpen.mrs_id,
//                 target_aisle_id: lastOpen.target_aisle_id,
//                 action: TaskMrsAction.CLOSED, // ⚠ ให้ enum/string ตรงกับ onCloseFinished
//                 operator: ControlSource.AUTO,
//                 result: LogResult.PENDING,
//                 started_at: now,
//             });
//             await tmRepo.save(closeDetail);

//             await logRepo.save(logRepo.create({
//                 mrs_id: lastOpen.mrs_id,
//                 aisle_id: lastOpen.target_aisle_id,
//                 task_id: String(task_id),
//                 action: MrsLogAction.CLOSE_AISLE,
//                 operator: ControlSource.AUTO,
//                 start_time: now,
//                 result: LogResult.IN_PROGRESS,
//             }));

//             await this.gw.closeAisle({
//                 mrs_id: Number(lastOpen.mrs_id),
//                 aisle_id: Number(lastOpen.target_aisle_id),
//                 task_mrs_id: closeDetail.id,
//             });

//             await taskRepo.update({ task_id }, { status: StatusTasks.CLOSING, updated_at: now });

//             // + logTaskEvent: เข้าสถานะปิดช่อง
//             await this.logTaskEvent(useManager, task, 'TASK_CLOSING', {
//                 prev: StatusTasks.WAIT_CONFIRM, next: StatusTasks.CLOSING,
//                 aisle_id: String(lastOpen.target_aisle_id), mrs_id: String(lastOpen.mrs_id),
//                 reason_code: shouldPreempt ? 'PREEMPT' : 'NO_NEXT_SAME_AISLE'
//             });

//             response = response.setComplete(
//                 lang.msgSuccessAction('updated', 'item.t1m_task'),
//                 { task_mrs_close_id: closeDetail.id, closed: true, preempted: shouldPreempt }
//             );
//             if (!manager && queryRunner) await queryRunner.commitTransaction();
//             return response;

//         } catch (error: any) {
//             if (!manager) await queryRunner?.rollbackTransaction();
//             console.error(operation, error);
//             throw new Error(lang.msgErrorFunction(operation, error.message));
//         } finally {
//             if (!manager) await queryRunner?.release();
//         }
//     }

//     /** ถูกเรียกเมื่อปิดเสร็จ (idempotent) -> COMPLETED + ปล่อยเครื่อง */
//     async onCloseFinished(
//         payload: { task_mrs_id: string; duration_ms?: number },
//         manager?: EntityManager
//         ): Promise<ApiResponse<any>> {
//         let response = new ApiResponse<any>();
//         const operation = 'T1MTaskService.onCloseFinished';

//         const queryRunner = manager ? null : AppDataSource.createQueryRunner();
//         const useManager = manager || queryRunner?.manager;
//         if (!useManager) return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));

//         if (!manager && queryRunner) { await queryRunner.connect(); await queryRunner.startTransaction(); }

//         try {
//             const tmRepo    = useManager.getRepository(TaskMrsDetail);
//             const logRepo   = useManager.getRepository(MrsLog);
//             const taskRepo  = useManager.getRepository(TaskMrs);
//             const aisleRepo = useManager.getRepository(Aisle);
//             const mrsRepo   = useManager.getRepository(MRS);

//             const detail = await tmRepo.findOne({ where: { id: payload.task_mrs_id } });
//             if (!detail) return response.setIncomplete(lang.msg('validation.not_found'));

//             if (detail.action !== TaskMrsAction.CLOSED) {
//             return response.setIncomplete(lang.msg('validation.invalid_action_for_handler'));
//             }

//             const now = new Date();

//             // ---------- Idempotent: ปิดสำเร็จไปแล้ว ----------
//             // idempotent: เคย SUCCESS แล้ว → ensure task COMPLETED แล้วออก
//             if (detail.result === LogResult.SUCCESS) {
//                 await taskRepo.update({ task_id: detail.task_id }, { status: StatusTasks.COMPLETED, updated_at: now });
                
//                  // TASK_HISTORY: ปิดสำเร็จ (idempotent) + สถานะ COMPLETED
//                 const taskEnt = await taskRepo.findOne({ where: { task_id: detail.task_id } });
//                 if (taskEnt) {
//                     await this.logTaskEvent(useManager, taskEnt, 'CLOSE_ALREADY_SUCCESS', {
//                     prev: StatusTasks.CLOSING, next: StatusTasks.COMPLETED,
//                     aisle_id: String(detail.target_aisle_id),
//                     mrs_id: String(detail.mrs_id),
//                     reason_code: 'CLOSE_FINISHED_CALLBACK_DUP'
//                     });
//                 }
                
//                 if (!manager && queryRunner) await queryRunner.commitTransaction();
//                 // dispatch งานคิวถัดไปใน bank เดียวกัน
//                 const devForDispatch = await mrsRepo.findOne({ where: { mrs_id: detail.mrs_id as any } });
//                 const aisleRow = await aisleRepo.findOne({ where: { aisle_id: String(detail.target_aisle_id) } });
//                 const bankForDispatch = devForDispatch?.bank_code ?? aisleRow?.bank_code;
//                 if (bankForDispatch) await this.dispatchNextForBank(bankForDispatch);

//                 return response.setComplete(lang.msgSuccessAction('updated', 'item.task_mrs'), { task_mrs_id: detail.id });
//             }

//             // ---------- ปิดรอบนี้ให้สำเร็จ ----------
//             // ปิด task_mrs (CLOSE) เป็น SUCCESS
//             detail.finished_at       = now;
//             detail.result            = LogResult.SUCCESS;
//             detail.close_duration_ms = payload.duration_ms;
//             await tmRepo.save(detail);

//             // ปิด log
//             await logRepo.update(
//                 { task_mrs_id: String(detail.id) },
//                 { end_time: now, task_duration: payload.duration_ms ?? null, result: LogResult.SUCCESS }
//             );

//             // ปรับสถานะช่องเป็น CLOSED
//             await aisleRepo.update(
//                 { aisle_id: detail.target_aisle_id },
//                 { status: AisleStatus.CLOSED as any, last_closed_at: now, last_event_at: now }
//             );

//             // ปล่อยเครื่อง + reset session flags
//             const device = await mrsRepo.findOne({ where: { current_task_id: detail.task_id } });
//             const bankCode = device?.bank_code;
//             if (device) {
//                 device.current_task_id  = null as any;
//                 device.current_aisle_id = null as any;
//                 device.is_available     = true;
                
//                 (device as any).is_aisle_open = false;
//                 (device as any).open_session_aisle_id = null;
//                 (device as any).open_session_order_id = null;
//                 (device as any).open_session_expires_at = null;
//                 await mrsRepo.save(device);
//             }

//             // ปิดงานรวม
//             await taskRepo.update({ task_id: detail.task_id }, { status: StatusTasks.COMPLETED, updated_at: now });

//             // TASK_HISTORY: ใส่เหตุการณ์ฝั่ง task ให้ครบ
//             const taskEnt = await taskRepo.findOne({ where: { task_id: detail.task_id } });
//             if (taskEnt) {
//                 // 1) ปิดช่องสำเร็จ
//                 await this.logTaskEvent(useManager, taskEnt, 'CLOSE_SUCCESS', {
//                     prev: StatusTasks.CLOSING, next: StatusTasks.COMPLETED,
//                     aisle_id: String(detail.target_aisle_id),
//                     mrs_id: String(detail.mrs_id),
//                     reason_code: 'CLOSE_FINISHED'
//                 });

//                 // 2) จบงาน (COMPLETED)
//                 await this.logTaskEvent(useManager, taskEnt, 'TASK_DONE', {
//                     prev: StatusTasks.CLOSING, next: StatusTasks.COMPLETED,
//                 });

//                 // 3) ปิด session (ถ้ามี device)
//                 if (device) {
//                     await this.logTaskEvent(useManager, taskEnt, 'SESSION_CLOSED', {
//                     aisle_id: String(detail.target_aisle_id),
//                     mrs_id: String(device.mrs_id),
//                     source: 'onCloseFinished'
//                     });
//                 }
//             }

//             response = response.setComplete(lang.msgSuccessAction('updated', 'item.task_mrs'), { task_mrs_id: detail.id });
//             if (!manager && queryRunner) await queryRunner.commitTransaction();

//             // ✅ หลัง commit แล้ว ค่อย dispatch งานคิวถัดไปใน bank เดียวกัน
//             if (bankCode) await this.dispatchNextForBank(bankCode);
//             return response;
//         } catch (error: any) {
//             if (!manager) await queryRunner?.rollbackTransaction();
//             console.error(operation, error);
//             throw new Error(lang.msgErrorFunction(operation, error.message));
//         } finally {
//             if (!manager) await queryRunner?.release();
//         }
//     }


    


// // ============== EVENTS: ผิดปกติ / เสริม ==============

//     /** MRS แจ้งมีสิ่งกีดขวาง (idempotent) */
//     async onBlocked(payload: { task_mrs_id: string; reason?: string }, manager?: EntityManager) {
//         const em = manager ?? AppDataSource.manager;
//         const tmRepo  = em.getRepository(TaskMrsDetail);
//         const logRepo = em.getRepository(MrsLog);

//         const d = await tmRepo.findOne({ where: { id: payload.task_mrs_id } });
//         if (!d) return new ApiResponse().setIncomplete(lang.msg('validation.not_found'));

//         // อัปเดตแถว action ปัจจุบัน
//         d.blocked_flag = true as any;
//         d.blocked_reason = payload.reason ?? 'BLOCKED';
//         // ถ้าเป็นตอนจะปิด เราจะถือว่า discard (ไม่ถือว่า fail)
//         await tmRepo.save(d);

//         // เขียน log ช่วยสืบเหตุ
//         await logRepo.save(logRepo.create({
//         mrs_id: d.mrs_id, aisle_id: d.target_aisle_id, task_id: String(d.task_id),
//         action: d.action === 'CLOSED' ? ('CLOSE_AISLE' as any) : ('OPEN_AISLE' as any),
//         start_time: new Date(), end_time: new Date(),
//         result: LogResult.DISCARDED,
//         error_msg: payload.reason,
//         operator: d.operator as any,
//         }));

//         return new ApiResponse().setComplete(lang.msgSuccessAction('updated', 'item.task_mrs'), { task_mrs_id: d.id });
//     }

    


//     /** Fault จากเครื่อง/โปรโตคอล -> mark FAILED */
//     async onFault(payload: { mrs_id: number; code?: string; msg?: string; task_mrs_id?: string }, manager?: EntityManager) {
//         const em = manager ?? AppDataSource.manager;
//         const mrsRepo = em.getRepository(MRS);
//         const tmRepo  = em.getRepository(TaskMrsDetail);
//         const taskRepo= em.getRepository(TaskMrs);
//         const logRepo = em.getRepository(MrsLog);

//         const mrs = await mrsRepo.findOne({ where: { mrs_id: payload.mrs_id } });
//         if (mrs) { mrs.fault_msg = payload.msg ?? payload.code ?? 'FAULT'; await mrsRepo.save(mrs); }

//         if (payload.task_mrs_id) {
//         const d = await tmRepo.findOne({ where: { id: payload.task_mrs_id } });
//         if (d && d.result !== LogResult.SUCCESS) {
//             d.result = LogResult.FAIL;
//             d.finished_at = new Date();
//             await tmRepo.save(d);

//             // ปิด log
//             await logRepo.createQueryBuilder()
//             .update(MrsLog)
//             .set({ end_time: new Date(), result: LogResult.FAIL, error_code: payload.code, error_msg: payload.msg })
//             .where('task_id = :t AND aisle_id = :a AND action = :act', { t: d.task_id, a: d.target_aisle_id, act: d.action === 'OPEN' ? 'OPEN_AISLE' : 'CLOSE_AISLE' })
//             .execute();

//             await taskRepo.update({ task_id: d.task_id }, { status: StatusTasks.FAILED, updated_at: new Date(), error_code: payload.code as any, error_msg: payload.msg as any });
//         }
//         }

//         return new ApiResponse().setComplete(lang.msgSuccessAction('updated', 'item.mrs'), {});
//     }

//     /** Timeout ของ action ใดๆ */
//     async onTimeout(payload: { task_mrs_id: string }, manager?: EntityManager) {
//         const em = manager ?? AppDataSource.manager;
//         const tmRepo  = em.getRepository(TaskMrsDetail);
//         const logRepo = em.getRepository(MrsLog);
//         const taskRepo= em.getRepository(TaskMrs);

//         const d = await tmRepo.findOne({ where: { id: payload.task_mrs_id } });
//         if (!d) return new ApiResponse().setIncomplete(lang.msg('validation.not_found'));

//         if (d.result === LogResult.SUCCESS) return new ApiResponse().setComplete(lang.msg('common.already_completed'), {});

//         d.retry_count = (d.retry_count ?? 0) + 1;
//         d.result = LogResult.FAIL; // หรือนโยบายจะตั้ง TIMEOUT แยกคอลัมน์ก็ได้
//         d.finished_at = new Date();
//         await tmRepo.save(d);

//         await logRepo.createQueryBuilder()
//         .update(MrsLog)
//         .set({ end_time: new Date(), result: LogResult.FAIL, error_msg: 'TIMEOUT' })
//         .where('task_id = :t AND aisle_id = :a AND action = :act', { t: d.task_id, a: d.target_aisle_id, act: d.action === 'OPEN' ? 'OPEN_AISLE' : 'CLOSE_AISLE' })
//         .execute();

//         await taskRepo.update({ task_id: d.task_id }, { status: StatusTasks.FAILED, updated_at: new Date(), error_code: 'TIMEOUT' as any, error_msg: 'Action timeout' as any });

//         return new ApiResponse().setComplete(lang.msg('common.timeout'), {});
//     }

// // ============== MANUAL OVERRIDE ==============

//     /** เปิดช่องแบบ manual (สร้าง ad-hoc task เพื่อ audit) */
//     // async manualOpen(aisle_id: string, reqUser: string, note?: string, manager?: EntityManager) {
//     //     const response = new ApiResponse<any>();
//     //     const operation = 'T1MTaskService.manualOpen';

//     //     const queryRunner = manager ? null : AppDataSource.createQueryRunner();
//     //     const em = manager || queryRunner?.manager;
//     //     if (!em) return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));

//     //     if (!manager && queryRunner) { await queryRunner.connect(); await queryRunner.startTransaction(); }

//     //     try {
//     //     const taskRepo = em.getRepository(TaskMrs);
//     //     const mrsRepo  = em.getRepository(MRS);
//     //     const tmRepo   = em.getRepository(TaskMrsDetail);
//     //     const logRepo  = em.getRepository(MrsLog);

//     //     // 1) reserve device
//     //     const device = await this.pickMrsForAisle(aisle_id, em);
//     //     if (!device) return response.setIncomplete(lang.msg('validation.no_available_mrs'));

//     //     // 2) ad-hoc task
//     //     const task = await taskRepo.save(taskRepo.create({
//     //         work_order: `MANUAL-${new Date().toISOString()}`,  //แก้ไข roder_id
//     //         stock_item: 'MANUAL',
//     //         priority: 5,
//     //         store_type: 'T1M',
//     //         status: StatusTasks.IN_PROGRESS,
//     //         requested_by: reqUser,
//     //     }));

//     //     device.current_task_id  = task.task_id as any;
//     //     device.current_aisle_id = String(aisle_id) as any;
//     //     device.is_available     = false;
//     //     await mrsRepo.save(device);

//     //     // 3) OPEN detail + log
//     //     const openDetail = await tmRepo.save(tmRepo.create({
//     //         task_id: task.task_id,
//     //         mrs_id: String(device.mrs_id),
//     //         target_aisle_id: String(aisle_id),
//     //         action: AisleStatus.OPEN,
//     //         operator: ControlSource.MANUAL,
//     //         result: LogResult.PENDING,
//     //         started_at: new Date(),
//     //         // control_params_json: { operator_note: note } as any, // ถ้าต้องการบันทึกหมายเหตุ
//     //     }));

//     //     await logRepo.save(logRepo.create({
//     //         mrs_id: String(device.mrs_id),
//     //         aisle_id: String(aisle_id),
//     //         task_id: String(task.task_id),
//     //         action: MrsLogAction.OPEN_AISLE,
//     //         operator: ControlSource.MANUAL,
//     //         start_time: new Date(),
//     //         result: LogResult.IN_PROGRESS,
//     //         // error_msg: note,
//     //     }));

//     //     await this.gw.openAisle({ mrs_id: device.mrs_id, aisle_id: Number(aisle_id), task_mrs_id: openDetail.id });

//     //     if (!manager && queryRunner) await queryRunner.commitTransaction();
//     //     return response.setComplete(lang.msgSuccessAction('created', 'item.t1m_task'), { task_id: task.task_id, task_mrs_open_id: openDetail.id, mrs_id: device.mrs_id });
//     //     } catch (e:any) {
//     //     if (!manager) await queryRunner?.rollbackTransaction();
//     //     throw new Error(lang.msgErrorFunction(operation, e.message));
//     //     } finally {
//     //     if (!manager) await queryRunner?.release();
//     //     }
//     // }

//     /** ปิดช่องแบบ manual (force ได้—แต่ต้องตรวจ sensor ถ้าไม่ force) */
//     async manualClose(aisle_id: string, reqUser: string, opts?: { force?: boolean; note?: string }, manager?: EntityManager) {
//         const response = new ApiResponse<any>();
//         const operation = 'T1MTaskService.manualClose';

//         const queryRunner = manager ? null : AppDataSource.createQueryRunner();
//         const em = manager || queryRunner?.manager;
//         if (!em) return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
//         if (!manager && queryRunner) { await queryRunner.connect(); await queryRunner.startTransaction(); }

//         try {
//         const tmRepo   = em.getRepository(TaskMrsDetail);
//         const taskRepo = em.getRepository(TaskMrs);
//         const logRepo  = em.getRepository(MrsLog);

//         // หา OPEN ล่าสุดของช่องนี้
//         const open = await tmRepo.findOne({ where: { target_aisle_id: String(aisle_id), action: 'OPEN' as any }, order: { started_at: 'DESC' } });
//         if (!open) return response.setIncomplete(lang.msg('validation.not_found'));

//         if (!(opts?.force)) {
//             const sensorClear = await this.isAisleSensorClear(aisle_id);
//             if (!sensorClear) {
//             await logRepo.save(logRepo.create({
//                 mrs_id: open.mrs_id, 
//                 aisle_id: String(aisle_id), 
//                 task_id: String(open.task_id),
//                 action: MrsLogAction.CLOSE_AISLE, 
//                 operator: ControlSource.MANUAL, 
//                 start_time: new Date(), 
//                 end_time: new Date(),
//                 result: LogResult.DISCARDED, 
//                 error_msg: 'Sensor detects object (manual)',
//             }));
//             await taskRepo.update({ task_id: open.task_id }, { status: StatusTasks.WAIT_CONFIRM, updated_at: new Date() });
//             return response.setIncomplete(lang.msg('validation.sensor_detect_object_discard_close'));
//             }
//         }

//         // insert CLOSE (MANUAL) + log แล้วส่งคำสั่ง
//         const closeDetail = await tmRepo.save(tmRepo.create({
//             task_id: open.task_id, 
//             mrs_id: open.mrs_id, 
//             target_aisle_id: open.target_aisle_id,
//             action: TaskMrsAction.CLOSED, 
//             operator: ControlSource.MANUAL, 
//             result: LogResult.PENDING, 
//             started_at: new Date(),
//         }));

//         await logRepo.save(logRepo.create({
//             mrs_id: closeDetail.mrs_id, 
//             aisle_id: closeDetail.target_aisle_id, 
//             task_id: String(closeDetail.task_id),
//             action: MrsLogAction.CLOSE_AISLE, 
//             operator: ControlSource.MANUAL, 
//             start_time: new Date(), 
//             result: LogResult.IN_PROGRESS,
//         }));

//         await this.gw.closeAisle({ mrs_id: Number(closeDetail.mrs_id), aisle_id: Number(closeDetail.target_aisle_id), task_mrs_id: closeDetail.id });
//         await taskRepo.update({ task_id: closeDetail.task_id }, { status: StatusTasks.CLOSING, updated_at: new Date() });

//         if (!manager && queryRunner) await queryRunner.commitTransaction();
//         return response.setComplete(lang.msgSuccessAction('updated', 'item.t1m_task'), { task_mrs_close_id: closeDetail.id });
//         } catch (e:any) {
//         if (!manager) await queryRunner?.rollbackTransaction();
//         throw new Error(lang.msgErrorFunction(operation, e.message));
//         } finally {
//         if (!manager) await queryRunner?.release();
//         }
//     }

//     /** ล็อกทั้ง bank แล้วเช็คสถานะ */
//     private async lockBankAndGetRows(bank: string, em: EntityManager) {
//         const mrsRepo = em.getRepository(MRS);
//         // ล็อกทุกแถวของ bank นี้ ป้องกัน race ที่สองงานตรวจพร้อมกันแล้วเห็น “ยังไม่มี” พร้อมกัน
//         const rows = await mrsRepo.createQueryBuilder('m')
//             .setLock('pessimistic_write')       // SELECT ... FOR UPDATE
//             .where('m.bank_code = :bank', { bank })
//             .getMany();
//         return rows;
//     }

//     /** เก็บ “เหตุการณ์ของงาน” ที่ระดับแอป: สร้างงาน, เข้าคิว, เปลี่ยนสถานะ */
//     private async logTaskEvent(
//         manager: EntityManager,
//         task: TaskMrs,
//         event: string,
//         params?: {
//             actor?: string | null;
//             source?: string | null;
//             mrs_id?: string | number | null;
//             aisle_id?: string | number | null;
//             reason_code?: string | null;
//             meta?: any;
//             prev?: StatusTasks | string | null;
//             next?: StatusTasks | string | null;
//         }
//     ): Promise<void> {
//         const repo = manager.getRepository(TaskMrsLog);

//         await repo.insert({
//             task_id: String(task.task_id),
//             event,
//             prev_status: params?.prev ?? null,
//             new_status: params?.next ?? null,
//             actor: params?.actor ?? null,
//             source: params?.source ?? null,
//             mrs_id: params?.mrs_id != null ? String(params.mrs_id) : null,
//             aisle_id: params?.aisle_id != null ? String(params.aisle_id) : null,
//             reason_code: params?.reason_code ?? null,
//             meta_json: params?.meta ?? null,
//         });
//     }

// // ============== HELPERS ==============

//     private async dispatchNextForBank(bank: string, manager?: EntityManager) {
//         const operation = 'T1MTaskService.dispatchNextForBank';
//         const queryRunner = manager ? null : AppDataSource.createQueryRunner();
//         const useManager = manager || queryRunner?.manager;
//         if (!useManager) return;

//         if (!manager && queryRunner) { await queryRunner.connect(); await queryRunner.startTransaction(); }

//         try {
//             const mrsRepo  = useManager.getRepository(MRS);
//             const taskRepo = useManager.getRepository(TaskMrs);
//             const tmRepo   = useManager.getRepository(TaskMrsDetail);
//             const logRepo  = useManager.getRepository(MrsLog);

//             // 1) หา device ว่างใน bank นี้
//             const device = await mrsRepo.createQueryBuilder('m')
//                 .setLock('pessimistic_write')
//                 .where('m.bank_code = :bank', { bank })
//                 .andWhere('m.is_available = 1')
//                 .andWhere('m.e_stop = 0')
//                 .orderBy('COALESCE(m.last_heartbeat_at, m.last_update)', 'DESC')
//                 .getOne();

//             if (!device) { if (!manager && queryRunner) await queryRunner.commitTransaction(); return; }

//             // 2) หา task คิวแรกใน bank นี้
//             const nextTask = await taskRepo.createQueryBuilder('t')
//                 .where('t.store_type = :st', { st: 'T1M' })
//                 .andWhere('t.status = :q', { q: StatusTasks.QUEUED })
//                 .andWhere('t.target_bank_code = :bank', { bank })
//                 .orderBy('t.priority', 'DESC')
//                 .addOrderBy('t.requested_at', 'ASC')
//                 .addOrderBy('t.task_id', 'ASC')
//                 .getOne();

//             if (!nextTask) { if (!manager && queryRunner) await queryRunner.commitTransaction(); return; }

//             const aisleId = Number(nextTask.target_aisle_id);

//             // 3) reserve device
//             device.current_task_id  = nextTask.task_id as any;
//             device.current_aisle_id = String(aisleId) as any;
//             device.is_available     = false;

//             // ⭐ mark session open
//             (device as any).is_aisle_open = true;
//             (device as any).open_session_aisle_id = String(aisleId);
//             (device as any).open_session_order_id = nextTask.work_order ?? null;
//             this.extendSession(device);
//             await mrsRepo.save(device);

//             // 4) task_mrs OPEN (PENDING)
//             const openDetail = tmRepo.create({
//                 task_id: String(nextTask.task_id),
//                 mrs_id: String(device.mrs_id),
//                 target_aisle_id: String(aisleId),
//                 action: TaskMrsAction.OPEN,
//                 operator: ControlSource.AUTO,
//                 result: LogResult.PENDING,
//                 started_at: new Date(),
//             });
//             await tmRepo.save(openDetail);

//             // 5) mrs_log start (IN_PROGRESS)
//             await logRepo.save(logRepo.create({
//                 mrs_id: String(device.mrs_id),
//                 aisle_id: String(aisleId),
//                 task_id: String(nextTask.task_id),
//                 task_mrs_id: openDetail.id,
//                 action: MrsLogAction.OPEN_AISLE,
//                 operator: ControlSource.AUTO,
//                 start_time: new Date(),
//                 result: LogResult.IN_PROGRESS,
//             }));

//             // 6) mark IN_PROGRESS
//             await taskRepo.update({ task_id: nextTask.task_id }, { status: StatusTasks.IN_PROGRESS, updated_at: new Date() });

//             // + logTaskEvent: งานคิวถูก dispatch ให้เครื่องใน bank
//             await this.logTaskEvent(useManager, nextTask as any, 'TASK_EXECUTING', {
//                 prev: StatusTasks.QUEUED, next: StatusTasks.IN_PROGRESS,
//                 mrs_id: String(device.mrs_id), aisle_id: String(aisleId), reason_code: 'AUTO_DISPATCH'
//             });

//             // commit ก่อนยิงคำสั่ง (กัน rollback แต่สั่งไปแล้ว)
//             if (!manager && queryRunner) await queryRunner.commitTransaction();

//             // 7) send command
//             await this.gw.openAisle({
//                 mrs_id: device.mrs_id,
//                 aisle_id: aisleId,
//                 task_mrs_id: openDetail.id
//             });
//         } catch (error: any) {
//             if (!manager) await queryRunner?.rollbackTransaction();
//             console.error(operation, error);
//             // แค่ log พอ ให้รอบหน้า retry
//         } finally {
//             if (!manager) await queryRunner?.release();
//         }
//     }

// // ---- Integration Stub: ต่อจริงกับ WMS/MLM ได้ภายหลัง ----

//     /** เลือก/จองเครื่อง MRS ตาม policy พื้นฐาน (available + no e-stop + แบตพอ) */
//     private async pickMrsForAisle(aisle_id: string, em: EntityManager) {
//         const mrsRepo = em.getRepository(MRS);
//         const aisleRepo = em.getRepository(Aisle);

//         // 1) หา bank ของ aisle เป้าหมาย
//         const aisle = await aisleRepo.findOne({ where: { aisle_id: String(aisle_id) } });
//         if (!aisle) return null;
//         const bank = (aisle as any).bank_code; // เช่น 'B1'

//         // 2) TTL สำหรับข้อมูลสด (dev แนะนำตั้ง 0 = ไม่เช็ค)
//         const ttlSec = Number(process.env.MRS_TTL_SEC ?? 0); // 0 = ปิด TTL ใน dev

//         // 3) เลือก MRS ที่ "พร้อม" ใน bank เดียวกัน + กันชนด้วย lock
//         const qb = mrsRepo.createQueryBuilder('m')
//             .setLock('pessimistic_write') // SELECT ... FOR UPDATE
//             // .skipLocked()              // ถ้าใช้ MySQL 8+ ใส่บรรทัดนี้ได้ (TypeORM รองรับ) เพื่อลดการบล็อก
//             .where('m.is_available = 1')
//             .andWhere('m.e_stop = 0')
//             .andWhere('m.current_task_id IS NULL')
//             .andWhere('m.bank_code = :bank', { bank });

//         // (ถ้ามีสถานะ "พร้อม" ของเครื่อง)
//         qb.andWhere('m.mrs_status IN (:...ok)', { ok: ['IDLE', 'READY'] });

//         // 4) เช็คความสดของข้อมูล (มี last_heartbeat_at ค่อยใช้; ไม่มีก็ใช้ last_update ชั่วคราว)
//         if (ttlSec > 0) {
//             qb.andWhere(`
//             (
//                 (m.last_heartbeat_at IS NOT NULL AND m.last_heartbeat_at > DATE_SUB(NOW(), INTERVAL :ttl SECOND))
//                 OR
//                 (m.last_heartbeat_at IS NULL AND m.last_update > DATE_SUB(NOW(), INTERVAL :ttl SECOND))
//             )
//             `, { ttl: ttlSec });
//         }

//         // 5) คัดตัวที่ "สด" ที่สุดก่อน
//         qb.orderBy('COALESCE(m.last_heartbeat_at, m.last_update)', 'DESC')
//             .limit(1);

//         return qb.getOne();
//     }

//     /** ตรวจว่า sensor ของช่องนี้ clear หรือไม่ (TODO: ต่อ gateway จริง) */
//     private async isAisleSensorClear(aisle_id: string): Promise<boolean> {
//         if (typeof (this.gw as any).isAisleSensorClear === 'function') {
//         try { return await (this.gw as any).isAisleSensorClear(Number(aisle_id)); } catch { /* fallthrough */ }
//         }
//         // mock default: ถือว่า clear (ให้ต่อจริงภายหลัง)
//         return true;
//     }

//     //จุด “แปลง SKU → ตำแหน่งจัดเก็บ” (คืน aisle_id และ bank_code)
//     private hashSku(s: string): number {
//         let h = 5381;
//         for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
//         return Math.abs(h | 0);
//     }

//     private async resolveSkuToAisleT1M(
//         stock_item: string,
//         manager?: EntityManager
//         ): Promise<{ aisle_id: string; bank_code: string }> {
//         const useManager = manager ?? AppDataSource.manager;
//         const aisleRepo = useManager.getRepository(Aisle);

//         // 1) ดึงเฉพาะ aisle ที่ใช้งานได้ (ไม่ BLOCKED) เรียงตาม aisle_id คงที่
//         const aisles = await aisleRepo.createQueryBuilder('a')
//             .where('a.status != :blocked', { blocked: AisleStatus.BLOCKED })
//             .orderBy('a.aisle_id', 'ASC')
//             .getMany();

//         if (!aisles.length) throw new Error(lang.msg('validation.location_not_found_for_sku'));

//         // 2) ใช้ hash(SKU) % aisles.length เพื่อเลือก aisle แบบ deterministic
//         const idx = this.hashSku(stock_item) % aisles.length;
//         const chosen = aisles[idx];

//         return { aisle_id: String(chosen.aisle_id), bank_code: chosen.bank_code ?? 'B1' };
//     }


// // ==== Helpers สำหรับ Aisle Session ====
//     private sessionIdleMs = 60_000; // ต่ออายุ session 60s ทุกครั้งที่มี activity

//     private extendSession(device: MRS) {
//         (device as any).open_session_expires_at = new Date(Date.now() + this.sessionIdleMs);
//     }

//     private async findActiveOpenSession(
//         aisleId: string | number,
//         manager: EntityManager
//         ) {
//         const mrsRepo = manager.getRepository(MRS);
//         return mrsRepo.findOne({
//             where: {
//             current_aisle_id: String(aisleId) as any,
//             is_aisle_open: true as any,
//             e_stop: false as any
//             }
//         });
//     }

//     // งานถัดไปใน "aisle เดียวกัน"
//     private async getNextTaskSameAisle(
//         aisle_id: string, 
//         manager: EntityManager
//     ): Promise<TaskMrs | null> {
//         return manager.getRepository(TaskMrs).createQueryBuilder('t')
//         .where('t.store_type = :st', { st: 'T1M' })
//         .andWhere('t.status = :q', { q: StatusTasks.QUEUED })
//         .andWhere('t.target_aisle_id = :aisle', { aisle: String(aisle_id) })
//         .orderBy('t.priority', 'DESC')
//         .addOrderBy('t.requested_at', 'ASC')
//         .addOrderBy('t.task_id', 'ASC')
//         .getOne();
//     }

//     // ✅ งานที่คิวสูงสุดภายใน "bank เดียวกัน" (ใช้ตอน dispatch / preempt)
//     private async getTopQueuedInBank(
//         bank: string,
//         manager: EntityManager
//     ): Promise<TaskMrs | null> {
//         return manager.getRepository(TaskMrs).createQueryBuilder('t')
//         .where('t.store_type = :st', { st: 'T1M' })
//         .andWhere('t.status = :q',   { q: StatusTasks.QUEUED })
//         .andWhere('t.target_bank_code = :bank', { bank })
//         .orderBy('t.priority', 'DESC')
//         .addOrderBy('t.requested_at', 'ASC')
//         .addOrderBy('t.task_id', 'ASC')     // tie-breaker
//         .getOne();
//     }


// }


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
    StatusTasks,
    LogResult,
    MrsLogAction,
    AisleStatus,
    ControlSource,
    TaskMrsAction,
    TaskSource,
    TaskSubsystem,
    TaskEvent,
    TaskReason,
    StatusWaiting,
} from "../common/global.enum";
import * as validate from "../utils/ValidationUtils";
import * as lang from "../utils/LangHelper";
import { MrsGateway } from "../gateways/mrs.gateway";
import { CreateT1MTaskDto } from "../dtos/tasks.dto";
import { TaskMrsLog } from "../entities/task_mrs_log.entity";
import { WaitingTasks } from "../entities/waiting_tasks.entity";

/**
 * NOTE — Goals of this refactor (modified for FAT Task Status Response)
 * - Keep public API and overall flow identical
 * - Align MRS task status transitions with FAT: 
 *   QUEUED → OPENING_AISLE → AISLE_OPEN → WAITING_FINISH → CLOSING_AISLE → COMPLETED/FAILED
 */
export class T1MTaskService {
    // NOTE: เวลาอยู่ใน transaction ให้ใช้ useManager.getRepository(...) เท่านั้น
    private readonly STORE = "T1M" as const;
    private readonly sessionIdleMs = 60_000; // ต่ออายุ session 60s ทุกครั้งที่มี activity

    // รับ gateway ผ่าน constructor
    constructor(private gw: MrsGateway) {}

    // ====== Tiny helpers (no behavior changes) ======
    private s = (v: unknown) => (v == null ? null : String(v));

    private buildTodayPrefix(at = new Date()): string {
        const y = at.getFullYear();
        const m = String(at.getMonth() + 1).padStart(2, "0");
        const d = String(at.getDate()).padStart(2, "0");
        return `TID-${y}${m}${d}-`; // e.g. TID-20250828-
    }

    private async issueNextTaskCode(manager: EntityManager): Promise<string> {
        const prefix = this.buildTodayPrefix();
        const rows = await manager.query(
            `SELECT task_code
            FROM task_mrs
            WHERE task_code LIKE ?
            ORDER BY task_code DESC
            LIMIT 1
            FOR UPDATE`,
            [`${prefix}%`]
        );

        let next = 1;
        if (rows.length) {
            const last: string = String(rows[0].task_code);
            const tail = last.slice(prefix.length);
            const n = parseInt(tail, 10);
            next = (isNaN(n) ? 0 : n) + 1;
        }
        return `${prefix}${String(next).padStart(3, "0")}`;
    }

    /** Centralized repo getter per EntityManager */
    private repos(em: EntityManager) {
        return {
            taskRepo: em.getRepository(TaskMrs),
            tmRepo: em.getRepository(TaskMrsDetail),
            mrsRepo: em.getRepository(MRS),
            aisleRepo: em.getRepository(Aisle),
            logRepo: em.getRepository(MrsLog),
            taskHistoryRepo: em.getRepository(TaskMrsLog),
            waitingTasksRepo: em.getRepository(WaitingTasks)
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

    private async logTaskEvent(
        manager: EntityManager,
        task: TaskMrs,
        event: string,
        params?: {
            actor?: string | null;
            source?: TaskSource | string | null;
            subsystem?: TaskSubsystem | string | null;
            mrs_id?: string | number | null;
            aisle_id?: string | number | null;
            reason_code?: string | null;
            meta?: any;
            prev?: StatusTasks | string | null;
            next?: StatusTasks | string | null;
        }
    ): Promise<void> {
        const repo = manager.getRepository(TaskMrsLog);

        const resolvedSource: TaskSource =
            (params?.source as TaskSource) ?? TaskSource.SYSTEM;
        const resolvedSubsystem: TaskSubsystem =
            (params?.subsystem as TaskSubsystem) ?? TaskSubsystem.CORE;

        const resolvedActor: string | null =
            params?.actor ?? (resolvedSource === TaskSource.API ? null : (resolvedSource as string));

        await repo.insert({
            task_id: String(task.task_id),
            store_type: 'T1M', // 'T1' | 'T1M'
            event,
            prev_status: (params?.prev as any) ?? null,
            new_status: (params?.next as any) ?? null,
            actor: resolvedActor,
            source: resolvedSource as any,
            subsystem: resolvedSubsystem as any,
            mrs_id: params?.mrs_id != null ? String(params.mrs_id) : null,
            aisle_id: params?.aisle_id != null ? String(params.aisle_id) : null,
            reason_code: (params?.reason_code as any) ?? null,
            meta_json: params?.meta ?? null,
        });
    }

    private async lockBankAndGetRows(bank: string, em: EntityManager) {
        const mrsRepo = em.getRepository(MRS);
        return mrsRepo
            .createQueryBuilder("m")
            .setLock("pessimistic_write")
            .where("m.bank_code = :bank", { bank })
            .getMany();
    }

    private extendSession(device: MRS) {
        (device as any).open_session_expires_at = new Date(Date.now() + this.sessionIdleMs);
    }

    private async findActiveOpenSession(aisleId: string | number, manager: EntityManager) {
        const mrsRepo = manager.getRepository(MRS);
        return mrsRepo.findOne({
            where: {
                current_aisle_id: this.s(aisleId) as any,
                is_aisle_open: true as any,
                e_stop: false as any,
            },
        });
    }

    private async getNextQueuedTask(manager: EntityManager): Promise<TaskMrs | null> {
        return manager
            .getRepository(TaskMrs)
            .createQueryBuilder("t")
            .where("t.status = :q", { q: StatusTasks.QUEUED })
            .orderBy("t.priority", "DESC")
            .addOrderBy("t.requested_at", "ASC")
            .addOrderBy("t.task_id", "ASC")
            .getOne();
    }

    private async getTopQueuedInBank(bank: string, manager: EntityManager): Promise<TaskMrs | null> {
        return manager
            .getRepository(TaskMrs)
            .createQueryBuilder("t")
            .where("t.status = :q", { q: StatusTasks.QUEUED })
            .andWhere("t.target_bank_code = :bank", { bank })
            .orderBy("t.priority", "DESC")
            .addOrderBy("t.requested_at", "ASC")
            .addOrderBy("t.task_id", "ASC")
            .getOne();
    }

    private async isAisleSensorClear(aisle_id: string): Promise<boolean> {
        if (typeof (this.gw as any).isAisleSensorClear === "function") {
            try {
                return await (this.gw as any).isAisleSensorClear(Number(aisle_id));
            } catch {
                /* fallthrough */
            }
        }
        return true; // mock default
    }

    // ====== PUBLIC FLOWS (kept signatures/behavior) ======

    /**
     * Flow: รับ SKU(T1M) -> resolve aisle -> เลือก/จอง MRS -> task_mrs OPEN(PENDING)+mrs_log(IN_PROGRESS) -> ยิงคำสั่ง -> tasks.OPENING_AISLE
     * หลังจากนี้รอ event gateway -> onOpenFinished(...)
     */
    async createAndOpen(
        data: CreateT1MTaskDto,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const operation = "T1MTaskService.createAndOpen";
        let response = new ApiResponse<any>();

        const ctx = await this.beginTx(manager);
        try {
            const { useManager, taskRepo, mrsRepo, tmRepo, logRepo, waitingTasksRepo } = ctx;

            // ----- Validate -----
            if (validate.isNullOrEmpty(data.stock_item))
                return response.setIncomplete(lang.msgRequired("field.stock_item"));
            if (validate.isNullOrEmpty(data.plan_qty))
                return response.setIncomplete(lang.msgRequired("field.plan_qty"));
            if (validate.isNullOrEmpty(data.from_location))
                return response.setIncomplete(lang.msgRequired("field.from_location"));

            // 1) หา MRS จาก from_location
            const device = await mrsRepo.findOne({
                where: { mrs_code: data.from_location },
            });
            if (!device)
                return response.setIncomplete(lang.msg("validation.mrs_not_found"));

            // 1.1) mock target aisle (ชั่วคราว)
            const targetAisleId = "2"; // mock fix
            const bankCode = device.bank_code ?? "B1";

            // 1.2) ออก task code
            const code = await this.issueNextTaskCode(useManager);

            // 2) create task
            const task = Object.assign(new TaskMrs(), {
                waiting_id: data.waiting_id,
                task_code: code,
                stock_item: data.stock_item,
                plan_qty: data.plan_qty,
                priority: data.priority ?? 5,
                type: data.type,
                status: StatusTasks.NEW,
                requested_by: reqUsername,
                target_aisle_id: targetAisleId,
                target_bank_code: bankCode,
            });
            await taskRepo.save(task);

            await this.logTaskEvent(useManager, task, TaskEvent.TASK_CREATED, {
                actor: reqUsername,
                source: TaskSource.API,
                subsystem: TaskSubsystem.MRS,
                next: StatusTasks.NEW,
                mrs_id: device.mrs_id,
                aisle_id: targetAisleId,
            });

            // 2.1) เปลี่ยนสถานะเป็น ROUTING
            await taskRepo.update(
                { task_id: task.task_id },
                { status: StatusTasks.ROUTING, updated_at: new Date() }
            );

            await this.logTaskEvent(useManager, task, TaskEvent.TASK_ROUTING, {
                actor: reqUsername,
                source: TaskSource.API,
                subsystem: TaskSubsystem.MRS,
                prev: StatusTasks.NEW,
                next: StatusTasks.ROUTING,
                mrs_id: device.mrs_id,
                aisle_id: targetAisleId,
            });

            // 2.2) ล็อกทั้ง bank ก่อนตัดสินใจ (เช็คว่ามี session เปิดอยู่ใน bank หรือไม่)
            const bankRows = await this.lockBankAndGetRows(bankCode, useManager);
            const bankOpen = bankRows.find((r: any) => r.is_aisle_open && !r.e_stop) as MRS | undefined;

            if (bankOpen) {
                if (this.s(bankOpen.current_aisle_id) === targetAisleId) {
                    // ถ้ามี session อยู่ใน aisle เดียวกัน → ใช้ flow JOIN_OPEN_SESSION
                } else {
                    // bank มีการใช้งานอยู่กับ aisle อื่น → queue งานนี้
                    await taskRepo.update({ task_id: task.task_id }, {
                        status: StatusTasks.QUEUED,
                        updated_at: new Date(),
                    });
                    await this.logTaskEvent(useManager, task, TaskEvent.QUEUED, {
                        actor: reqUsername,
                        source: TaskSource.API,
                        subsystem: TaskSubsystem.MRS,
                        prev: StatusTasks.ROUTING,
                        next: StatusTasks.QUEUED,
                        reason_code: TaskReason.BANK_BUSY,
                        aisle_id: targetAisleId,
                        mrs_id: this.s((bankOpen as any).mrs_id),
                    });
                    await ctx.commit();
                    return response.setComplete(lang.msg("queued.item.t1m_task"), {
                        queued: true,
                        task_id: task.task_id,
                        bank_code: bankCode,
                    });
                }
            }

            // 2.3) มี session เปิดอยู่ใน aisle นี้แล้ว → แนบงานเข้า session (JOIN)
            const active = await this.findActiveOpenSession(targetAisleId, useManager);
            if (active) {
                await taskRepo.update({ task_id: task.task_id }, {
                    status: StatusTasks.QUEUED,
                    updated_at: new Date(),
                });
                await this.logTaskEvent(useManager, task, TaskEvent.QUEUED, {
                    source: TaskSource.API,
                    subsystem: TaskSubsystem.MRS,
                    prev: StatusTasks.ROUTING,
                    next: StatusTasks.QUEUED,
                    reason_code: TaskReason.JOIN_OPEN_SESSION,
                    aisle_id: targetAisleId,
                    mrs_id: this.s(active.mrs_id),
                });

                await logRepo.save(
                    logRepo.create({
                        mrs_id: this.s(active.mrs_id)!,
                        aisle_id: targetAisleId!,
                        task_id: this.s(task.task_id)!,
                        action: MrsLogAction.JOIN_OPEN_SESSION,
                        operator: ControlSource.AUTO,
                        start_time: new Date(),
                        result: LogResult.IN_PROGRESS,
                    })
                );

                this.extendSession(active);
                await mrsRepo.save(active);

                await ctx.commit();
                return response.setComplete(lang.msgSuccessAction("created", "item.t1m_task"), {
                    task_id: task.task_id,
                    aisle_id: targetAisleId,
                    mrs_id: active.mrs_id,
                    joined_open_session: true,
                });
            }

            // 3) assign device
            device.current_task_id = task.task_id as any;
            device.current_aisle_id = targetAisleId as any;
            device.is_available = false;
            (device as any).is_aisle_open = true;
            (device as any).open_session_aisle_id = targetAisleId;
            this.extendSession(device);
            await mrsRepo.save(device);

            // 4) task_mrs OPEN (PENDING)
            const openDetail = tmRepo.create({
                task_id: this.s(task.task_id)!,
                mrs_id: this.s(device.mrs_id)!,
                target_aisle_id: targetAisleId!,
                action: TaskMrsAction.OPEN,
                operator: ControlSource.AUTO,
                result: LogResult.PENDING,
                started_at: new Date(),
            });
            await tmRepo.save(openDetail);

            // 5) mrs_log start (IN_PROGRESS)
            await logRepo.save(
                logRepo.create({
                    mrs_id: this.s(device.mrs_id)!,
                    aisle_id: targetAisleId!,
                    task_id: this.s(task.task_id)!,
                    task_mrs_id: openDetail.id,
                    action: MrsLogAction.OPEN_AISLE,
                    operator: ControlSource.AUTO,
                    start_time: new Date(),
                    result: LogResult.IN_PROGRESS,
                })
            );

            // 6) send command (inside tx) — ส่ง targetAisleId ให้ gateway (mock)
            await this.gw.openAisle({
                mrs_id: device.mrs_id,
                aisle_id: targetAisleId as any,
                task_mrs_id: openDetail.id,
            });

            // 7) tasks.IN_PROGRESS
            await taskRepo.update(
                { task_id: task.task_id },
                { status: StatusTasks.IN_PROGRESS, updated_at: new Date() }
            );
            await waitingTasksRepo.update(
                { waiting_id: task.waiting_id },
                { status: StatusWaiting.IN_PROGRESS }
            );

            await this.logTaskEvent(useManager, task, TaskEvent.TASK_EXECUTING, {
                actor: reqUsername,
                source: TaskSource.API,
                subsystem: TaskSubsystem.MRS,
                prev: StatusTasks.ROUTING,
                next: StatusTasks.IN_PROGRESS,
                mrs_id: this.s(device.mrs_id),
                aisle_id: targetAisleId,
            });

            await ctx.commit();
            return response.setComplete(lang.msgSuccessAction("created", "item.t1m_task"), {
                task_id: task.task_id,
                aisle_id: targetAisleId,
                mrs_id: device.mrs_id,
                task_mrs_open_id: openDetail.id,
            });
        } catch (error: any) {
            await ctx.rollback();
            console.error(operation, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            await ctx.release();
        }
    }

    /** ถูกเรียกโดย gateway เมื่อเปิดเสร็จ (idempotent) -> AISLE_OPEN -> WAITING_FINISH */
    async onOpenFinished(
        payload: { task_mrs_id: string; duration_ms?: number },
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const operation = "T1MTaskService.onOpenFinished";
        let response = new ApiResponse<any>();

        const ctx = await this.beginTx(manager);
        try {
            const { useManager, tmRepo, logRepo, aisleRepo, taskRepo, mrsRepo, waitingTasksRepo } = ctx;

            const detail = await tmRepo.findOne({ where: { id: payload.task_mrs_id } });
            if (!detail) return response.setIncomplete(lang.msg("validation.not_found"));
            if (detail.action !== TaskMrsAction.OPEN)
                return response.setIncomplete(lang.msg("validation.invalid_action_for_handler"));

            // idempotent guard
            if (detail.result === LogResult.SUCCESS) {
                await ctx.commit();
                return response.setComplete(lang.msgSuccessAction("updated", "item.task_mrs"), {
                    task_mrs_id: detail.id,
                });
            }

            const now = new Date();

            // ปิด task_mrs (OPEN) เป็น SUCCESS
            detail.finished_at = now;
            detail.result = LogResult.SUCCESS;
            detail.open_duration_ms = payload.duration_ms;
            await tmRepo.save(detail);

            // อัปเดตสถานะช่อง -> AISLE_OPEN
            await aisleRepo.update(
                { aisle_id: detail.target_aisle_id },
                { status: AisleStatus.OPEN as any, last_opened_at: now, last_event_at: now }
            );

            // ปิด log ด้วย task_mrs_id โดยตรง
            await logRepo.update(
                { task_mrs_id: this.s(detail.id)! },
                { end_time: now, task_duration: payload.duration_ms ?? null, result: LogResult.SUCCESS }
            );

            // ยืนยัน session เปิดอยู่บน MRS + ต่ออายุ
            const device = await mrsRepo.findOne({ where: { mrs_id: detail.mrs_id as any } });
            if (device) {
                (device as any).is_aisle_open = true;
                (device as any).open_session_aisle_id = this.s(detail.target_aisle_id);
                this.extendSession(device);
                await mrsRepo.save(device);
            }

            // 1) ตั้งสถานะเป็น AISLE_OPEN (for FAT)
            await taskRepo.update(
                { task_id: detail.task_id },
                { status: StatusTasks.AISLE_OPEN, updated_at: now }
            );

            // Log AISLE_OPEN
            const t = await taskRepo.findOne({ where: { task_id: detail.task_id } });
            if (t) {
                await this.logTaskEvent(useManager, t, TaskEvent.TASK_AISLE_OPEN, {
                    source: TaskSource.GATEWAY,
                    subsystem: TaskSubsystem.MRS,
                    prev: StatusTasks.IN_PROGRESS,
                    next: StatusTasks.AISLE_OPEN,
                    mrs_id: this.s(detail.mrs_id),
                    aisle_id: this.s(detail.target_aisle_id),
                });

                // 2) แล้วเปลี่ยนเป็น WAITING_CONFIRM  (operator must confirm / pick)
                await taskRepo.update(
                    { task_id: detail.task_id },
                    { status: StatusTasks.WAITING_CONFIRM , updated_at: new Date() }
                );
                await waitingTasksRepo.update(
                    { waiting_id: t.waiting_id },
                    { status: StatusWaiting.WAITING_CONFIRM}
                );

                await this.logTaskEvent(useManager, t, TaskEvent.TASK_WAITING_CONFIRM, {
                    source: TaskSource.GATEWAY,
                    subsystem: TaskSubsystem.MRS,
                    prev: StatusTasks.AISLE_OPEN,
                    next: StatusTasks.WAITING_CONFIRM,
                    mrs_id: this.s(detail.mrs_id),
                    aisle_id: this.s(detail.target_aisle_id),
                });
            }

            await ctx.commit();
            return response.setComplete(lang.msgSuccessAction("updated", "item.task_mrs"), {
                task_mrs_id: detail.id,
            });
        } catch (error: any) {
            await ctx.rollback();
            console.error(operation, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            await ctx.release();
        }
    }

    /**
     * ผู้ใช้กดยืนยัน -> ตรวจ sensor; ถ้า clear: สั่งปิด, ถ้าไม่ clear: mark FAILED (sensor)
     */
    async closeAfterConfirm(
        task_id: string,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const operation = "T1MTaskService.closeAfterConfirm";
        let response = new ApiResponse<any>();

        const ctx = await this.beginTx(manager);
        try {
            const { useManager, taskRepo, tmRepo, logRepo, mrsRepo, waitingTasksRepo } = ctx;

            const task = await taskRepo.findOne({ where: { task_id } });
            if (!task) return response.setIncomplete(lang.msg("validation.not_found"));

            const lastOpen = await tmRepo.findOne({
                where: { task_id: this.s(task_id)!, action: TaskMrsAction.OPEN as any },
                order: { started_at: "DESC" },
            });
            if (!lastOpen) return response.setIncomplete(lang.msg("validation.not_found"));

            // User confirm log
            await this.logTaskEvent(useManager, task, TaskEvent.USER_CONFIRM, {
                actor: reqUsername,
                source: TaskSource.API,
                subsystem: TaskSubsystem.MRS,
                mrs_id: this.s(lastOpen.mrs_id),
                aisle_id: this.s(lastOpen.target_aisle_id),
                prev: StatusTasks.IN_PROGRESS,
                next: StatusTasks.WAITING_FINISH,
            });

            // ตรวจ sensor
            const sensorClear = await this.isAisleSensorClear(lastOpen.target_aisle_id);
            if (!sensorClear) {
                await taskRepo.update({ task_id }, { status: StatusTasks.FAILED, updated_at: new Date() });
                await waitingTasksRepo.update(
                    { waiting_id: task.waiting_id },
                    { status: StatusWaiting.CANCELLED }
                );

                await this.logTaskEvent(useManager, task, TaskEvent.USER_CONFIRM_BLOCKED, {
                    actor: reqUsername,
                    prev: StatusTasks.WAITING_FINISH,
                    next: StatusTasks.FAILED,
                    source: TaskSource.API,
                    subsystem: TaskSubsystem.MRS,
                    reason_code: TaskReason.SENSOR_BLOCKED,
                    aisle_id: this.s(lastOpen.target_aisle_id),
                    mrs_id: this.s(lastOpen.mrs_id),
                });

                await logRepo.save(logRepo.create({
                    mrs_id: lastOpen.mrs_id,
                    aisle_id: lastOpen.target_aisle_id,
                    task_id: this.s(task_id)!,
                    action: MrsLogAction.CLOSE_AISLE,
                    operator: ControlSource.AUTO,
                    start_time: new Date(),
                    end_time: new Date(),
                    result: LogResult.DISCARDED,
                    error_msg: "Sensor detects object; mark task FAILED",
                } as any));

                // อัปเดต waiting_tasks เป็น COMPLETED กรณีไม่มี nextTask
                if (task.waiting_id) {
                    await waitingTasksRepo.update(
                        { waiting_id: task.waiting_id },
                        { status: StatusWaiting.COMPLETED }
                    );
                }

                await ctx.commit();
                return response.setIncomplete(lang.msg("validation.sensor_detect_object_discard_close"));
            }

            const now = new Date();
            const device = await mrsRepo.findOne({ where: { mrs_id: lastOpen.mrs_id as any } });
            const bankCode = device?.bank_code ?? "B1";

            // ตรวจ task ต่อคิว
            const [topSameAisle, topInBank] = await Promise.all([
                this.getNextQueuedTask(useManager),
                this.getTopQueuedInBank(bankCode, useManager),
            ]);

            const shouldPreempt =
                !!topInBank &&
                (!topSameAisle ||
                    (topInBank.priority > topSameAisle.priority &&
                        this.s(topInBank.target_aisle_id) !== this.s(lastOpen.target_aisle_id)));

            // กำหนด nextTask ถ้าไม่ preempt
            const nextTask = (!shouldPreempt && (topSameAisle || topInBank)) ? (topSameAisle || topInBank) : null;

            if (nextTask && device) {
                // ปิดงานปัจจุบันเป็น COMPLETED
                task.status = StatusTasks.COMPLETED;
                task.updated_at = now;
                await taskRepo.save(task); // save จะอัปเดต entity + DB

                // ตอนนี้ task.waiting_id ต้องมีค่า
                if (task.waiting_id) {
                    await waitingTasksRepo.update(
                        { waiting_id: task.waiting_id },
                        { status: StatusWaiting.COMPLETED }
                    );
                    console.log("task.waiting_id:", task.waiting_id);
                }

                // ✅ ถ้ามี nextTask → อัปเดต waiting_id ของ nextTask เป็น WAITING_CONFIRM
                if (nextTask?.waiting_id) {
                    await waitingTasksRepo.update(
                        { waiting_id: nextTask.waiting_id },
                        { status: StatusWaiting.WAITING_CONFIRM }
                    );
                    console.log("nextTask.waiting_id → WAITING_CONFIRM:", nextTask.waiting_id);
                }


                await this.logTaskEvent(useManager, task, TaskEvent.TASK_DONE, {
                    actor: reqUsername,
                    prev: StatusTasks.WAITING_FINISH,
                    next: StatusTasks.COMPLETED,
                    source: TaskSource.API,
                    subsystem: TaskSubsystem.MRS,
                    aisle_id: this.s(lastOpen.target_aisle_id),
                    mrs_id: this.s(device.mrs_id),
                });

                // ย้ายงานถัดไปเป็น WAITING_FINISH
                if (nextTask.task_id) {
                    await taskRepo.update({ task_id: nextTask.task_id }, { status: StatusTasks.WAITING_FINISH, updated_at: now });
                    const next = await taskRepo.findOne({ where: { task_id: nextTask.task_id } });
                    if (next) {
                        await this.logTaskEvent(useManager, next, TaskEvent.TASK_WAITING_FINISH, {
                            prev: StatusTasks.QUEUED,
                            next: StatusTasks.WAITING_FINISH,
                            source: TaskSource.SYSTEM,
                            subsystem: TaskSubsystem.MRS,
                            reason_code: TaskReason.CONTINUE_IN_OPEN_SESSION,
                            aisle_id: this.s(next.target_aisle_id),
                            mrs_id: this.s(device.mrs_id),
                        });
                    }
                }

                // อัปเดต device session
                device.current_task_id = nextTask.task_id ?? null;
                (device as any).is_aisle_open = true;
                this.extendSession(device);
                await mrsRepo.save(device);

                // สร้าง task_mrs OPEN synthetic
                let tmOpen = await tmRepo.findOne({
                    where: { task_id: this.s(nextTask.task_id)!, action: TaskMrsAction.OPEN as any },
                    order: { started_at: "DESC" },
                });
                if (!tmOpen) {
                    tmOpen = tmRepo.create({
                        task_id: this.s(nextTask.task_id)!,
                        mrs_id: this.s(device.mrs_id)!,
                        target_aisle_id: this.s(nextTask.target_aisle_id)!,
                        action: TaskMrsAction.OPEN,
                        operator: ControlSource.AUTO,
                        result: LogResult.SUCCESS,
                        started_at: now,
                        finished_at: now,
                        open_duration_ms: 0,
                    });
                    await tmRepo.save(tmOpen);

                    await logRepo.save(
                        logRepo.create({
                            mrs_id: this.s(device.mrs_id)!,
                            aisle_id: this.s(nextTask.target_aisle_id)!,
                            task_id: this.s(nextTask.task_id)!,
                            task_mrs_id: tmOpen.id,
                            action: MrsLogAction.CONTINUE_IN_OPEN_SESSION,
                            operator: ControlSource.AUTO,
                            start_time: now,
                            result: LogResult.IN_PROGRESS,
                        })
                    );
                }

                await ctx.commit();
                return response.setComplete(lang.msg("continue_in_open_session"), {
                    continued: true,
                    next_task_id: nextTask.task_id,
                    aisle_id: this.s(lastOpen.target_aisle_id),
                });
            }

            // ไม่มี task ต่อคิว หรือ preempt → ปิด aisle ปกติ
            const closeDetail = tmRepo.create({
                task_id: this.s(task_id)!,
                mrs_id: lastOpen.mrs_id,
                target_aisle_id: lastOpen.target_aisle_id,
                action: TaskMrsAction.CLOSED,
                operator: ControlSource.AUTO,
                result: LogResult.PENDING,
                started_at: now,
            });
            await tmRepo.save(closeDetail);

            await logRepo.save(
                logRepo.create({
                    mrs_id: lastOpen.mrs_id,
                    aisle_id: lastOpen.target_aisle_id,
                    task_id: this.s(task_id)!,
                    action: MrsLogAction.CLOSE_AISLE,
                    operator: ControlSource.AUTO,
                    start_time: now,
                    result: LogResult.IN_PROGRESS,
                })
            );

            await this.gw.closeAisle({
                mrs_id: Number(lastOpen.mrs_id),
                aisle_id: Number(lastOpen.target_aisle_id),
                task_mrs_id: closeDetail.id,
            });

            await taskRepo.update({ task_id }, { status: StatusTasks.AISLE_CLOSE, updated_at: now });
            // ✅ ไม่มี nextTask → ปิดงานปัจจุบันให้ waiting_tasks เป็น COMPLETED
if (task.waiting_id) {
    await waitingTasksRepo.update(
        { waiting_id: task.waiting_id },
        { status: StatusWaiting.COMPLETED }
    );
    console.log("No nextTask → waiting_id COMPLETED:", task.waiting_id);
}

            await this.logTaskEvent(useManager, task, TaskEvent.TASK_CLOSING_AISLE, {
                actor: reqUsername,
                prev: StatusTasks.WAITING_FINISH,
                next: StatusTasks.AISLE_CLOSE,
                source: TaskSource.API,
                subsystem: TaskSubsystem.MRS,
                aisle_id: this.s(lastOpen.target_aisle_id),
                mrs_id: this.s(lastOpen.mrs_id),
                reason_code: shouldPreempt ? TaskReason.PREEMPT : TaskReason.NO_NEXT_SAME_AISLE,
            });

            await ctx.commit();
            return response.setComplete(lang.msgSuccessAction("updated", "item.t1m_task"), {
                task_mrs_close_id: closeDetail.id,
                closed: true,
                preempted: shouldPreempt,
            });
        } catch (error: any) {
            await ctx.rollback();
            console.error(operation, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            await ctx.release();
        }
    }

    /** ถูกเรียกเมื่อปิดเสร็จ (idempotent) -> COMPLETED + ปล่อยเครื่อง */
    async onCloseFinished(
        payload: { task_mrs_id: string; duration_ms?: number },
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const operation = "T1MTaskService.onCloseFinished";
        let response = new ApiResponse<any>();

        const ctx = await this.beginTx(manager);
        try {
            const { useManager, tmRepo, logRepo, taskRepo, aisleRepo, mrsRepo, waitingTasksRepo } = ctx;

            const detail = await tmRepo.findOne({ where: { id: payload.task_mrs_id } });
            if (!detail) return response.setIncomplete(lang.msg("validation.not_found"));
            if (detail.action !== TaskMrsAction.CLOSED)
                return response.setIncomplete(lang.msg("validation.invalid_action_for_handler"));

            const now = new Date();

            // Idempotent: ถ้าเคย SUCCESS แล้ว → ensure task COMPLETED แล้วออก
            if (detail.result === LogResult.SUCCESS) {
                await taskRepo.update({ task_id: detail.task_id }, { status: StatusTasks.COMPLETED, updated_at: now });
                // ดึง task หลัก
                const task = await taskRepo.findOne({ where: { task_id: detail.task_id } });
                if (!task) return response.setIncomplete(lang.msg("validation.not_found"));

                // ใช้ task.waiting_id
                await waitingTasksRepo.update(
                    { waiting_id: task.waiting_id },
                    { status: StatusWaiting.COMPLETED}
                );

                await ctx.commit();

                // dispatch งานถัดไปใน bank เดียวกัน
                const deviceForDispatch = await mrsRepo.findOne({ where: { mrs_id: detail.mrs_id as any } });
                if (deviceForDispatch?.bank_code) await this.dispatchNextForBank(deviceForDispatch.bank_code);

                return response.setComplete(lang.msgSuccessAction("updated", "item.task_mrs"), {
                    task_mrs_id: detail.id,
                });
            }

            // ปิดรอบนี้ให้สำเร็จ
            detail.finished_at = now;
            detail.result = LogResult.SUCCESS;
            detail.close_duration_ms = payload.duration_ms;
            await tmRepo.save(detail);

            await logRepo.update(
                { task_mrs_id: this.s(detail.id)! },
                { end_time: now, task_duration: payload.duration_ms ?? null, result: LogResult.SUCCESS }
            );

            await aisleRepo.update(
                { aisle_id: detail.target_aisle_id },
                { status: AisleStatus.CLOSED as any, last_closed_at: now, last_event_at: now }
            );

            // ตรวจ device
            const device = await mrsRepo.findOne({ where: { current_task_id: detail.task_id } });
            const bankCode = device?.bank_code;

            // ตรวจ task ต่อคิว
            const [topSameAisle, topInBank] = await Promise.all([
                this.getNextQueuedTask(useManager),
                bankCode ? this.getTopQueuedInBank(bankCode, useManager) : Promise.resolve(null),
            ]);

            const shouldPreempt =
                !!topInBank &&
                (!topSameAisle ||
                    (topInBank.priority > topSameAisle.priority &&
                        this.s(topInBank.target_aisle_id) !== this.s(detail.target_aisle_id)));

            const nextTask = (!shouldPreempt && (topSameAisle || topInBank)) ? (topSameAisle || topInBank) : null;

            if (nextTask && device) {
                // ปิดงานปัจจุบันเป็น COMPLETED
                await taskRepo.update({ task_id: detail.task_id }, { status: StatusTasks.COMPLETED, updated_at: now });
                // อัปเดต waiting_tasks เป็น COMPLETED ด้วย
const updatedTask = await taskRepo.findOne({ where: { task_id: detail.task_id } });
if (updatedTask?.waiting_id) {
    await waitingTasksRepo.update(
        { waiting_id: updatedTask.waiting_id },
        { status: StatusWaiting.COMPLETED }
    );
}
// ✅ nextTask ต้องถูกอัปเดต waiting_tasks เป็น WAITING_CONFIRM
    if (nextTask.waiting_id) {
        await waitingTasksRepo.update(
            { waiting_id: nextTask.waiting_id },
            { status: StatusWaiting.WAITING_CONFIRM }
        );
        console.log("➡️ Next waiting_id updated to WAITING_CONFIRM:", nextTask.waiting_id);
    }


                await this.logTaskEvent(useManager, detail as any, TaskEvent.TASK_DONE, {
                    source: TaskSource.SYSTEM,
                    subsystem: TaskSubsystem.MRS,
                    prev: StatusTasks.AISLE_CLOSE,
                    next: StatusTasks.COMPLETED,
                    aisle_id: this.s(detail.target_aisle_id),
                    mrs_id: this.s(device.mrs_id),
                });

                // ย้ายงานถัดไปเป็น WAITING_FINISH
                await taskRepo.update({ task_id: nextTask.task_id }, { status: StatusTasks.WAITING_FINISH, updated_at: now });
                const nextEnt = await taskRepo.findOne({ where: { task_id: nextTask.task_id } });
                if (nextEnt) {
                    await this.logTaskEvent(useManager, nextEnt, TaskEvent.TASK_WAITING_FINISH, {
                        prev: StatusTasks.QUEUED,
                        next: StatusTasks.WAITING_FINISH,
                        source: TaskSource.SYSTEM,
                        subsystem: TaskSubsystem.MRS,
                        reason_code: TaskReason.CONTINUE_IN_OPEN_SESSION,
                        aisle_id: this.s(nextTask.target_aisle_id),
                        mrs_id: this.s(device.mrs_id),
                    });
                }

                // อัปเดต device session
                device.current_task_id = nextTask.task_id as any;
                (device as any).is_aisle_open = true;
                (device as any).open_session_aisle_id = nextTask.target_aisle_id;
                (device as any).open_session_expires_at = new Date(Date.now() + 5 * 60 * 1000); // session 5 นาที
                await mrsRepo.save(device);

                // สร้าง task_mrs OPEN synthetic
                let tmOpen = await tmRepo.findOne({
                    where: { task_id: this.s(nextTask.task_id)!, action: TaskMrsAction.OPEN as any },
                    order: { started_at: "DESC" },
                });
                if (!tmOpen) {
                    tmOpen = tmRepo.create({
                        task_id: this.s(nextTask.task_id)!,
                        mrs_id: this.s(device.mrs_id)!,
                        target_aisle_id: this.s(nextTask.target_aisle_id)!,
                        action: TaskMrsAction.OPEN,
                        operator: ControlSource.AUTO,
                        result: LogResult.SUCCESS,
                        started_at: now,
                        finished_at: now,
                        open_duration_ms: 0,
                    });
                    await tmRepo.save(tmOpen);

                    await logRepo.save(
                        logRepo.create({
                            mrs_id: this.s(device.mrs_id)!,
                            aisle_id: this.s(nextTask.target_aisle_id)!,
                            task_id: this.s(nextTask.task_id)!,
                            task_mrs_id: tmOpen.id,
                            action: MrsLogAction.CONTINUE_IN_OPEN_SESSION,
                            operator: ControlSource.AUTO,
                            start_time: now,
                            result: LogResult.IN_PROGRESS,
                        })
                    );
                }

                await ctx.commit();
                return response.setComplete(lang.msg("continue_in_open_session"), {
                    continued: true,
                    next_task_id: nextTask.task_id,
                    aisle_id: this.s(nextTask.target_aisle_id),
                });
            }

            // ไม่มี task ต่อคิว → reset session
            if (device) {
                device.current_task_id = null as any;
                device.current_aisle_id = null as any;
                device.is_available = true;
                (device as any).is_aisle_open = false;
                (device as any).open_session_aisle_id = null;
                (device as any).open_session_order_id = null;
                (device as any).open_session_expires_at = null;
                await mrsRepo.save(device);
            }

            // ปิดงานปัจจุบันเป็น COMPLETED
            await taskRepo.update({ task_id: detail.task_id }, { status: StatusTasks.COMPLETED, updated_at: now });

            // อัปเดต waiting_tasks เป็น COMPLETED ด้วย
const updatedTask = await taskRepo.findOne({ where: { task_id: detail.task_id } });
if (updatedTask?.waiting_id) {
    await waitingTasksRepo.update(
        { waiting_id: updatedTask.waiting_id },
        { status: StatusWaiting.COMPLETED }
    );
}

            await ctx.commit();
            return response.setComplete(lang.msgSuccessAction("updated", "item.task_mrs"), {
                task_mrs_id: detail.id,
            });
        } catch (error: any) {
            await ctx.rollback();
            console.error(operation, error);
            throw new Error(lang.msgErrorFunction(operation, error.message));
        } finally {
            await ctx.release();
        }
    }


    // ============== HELPERS ==============

    private async dispatchNextForBank(bank: string, manager?: EntityManager) {
        const operation = "T1MTaskService.dispatchNextForBank";
        const ctx = await this.beginTx(manager);

        try {
            const { useManager, mrsRepo, taskRepo, tmRepo, logRepo } = ctx;

            // 1) หา device ว่างใน bank นี้
            const device = await mrsRepo
                .createQueryBuilder("m")
                .setLock("pessimistic_write")
                .where("m.bank_code = :bank", { bank })
                .andWhere("m.is_available = 1")
                .andWhere("m.e_stop = 0")
                .orderBy("COALESCE(m.last_heartbeat_at, m.last_update)", "DESC")
                .getOne();

            if (!device) {
                await ctx.commit();
                return;
            }

            // 2) หา task คิวแรกใน bank นี้
            const nextTask = await taskRepo
                .createQueryBuilder("t")
                .where("t.status = :q", { q: StatusTasks.QUEUED })
                .andWhere("t.target_bank_code = :bank", { bank })
                .orderBy("t.priority", "DESC")
                .addOrderBy("t.requested_at", "ASC")
                .addOrderBy("t.task_id", "ASC")
                .getOne();

            if (!nextTask) {
                await ctx.commit();
                return;
            }

            const aisleId = Number(nextTask.target_aisle_id);

            // 3) reserve device
            device.current_task_id = nextTask.task_id as any;
            device.current_aisle_id = this.s(aisleId) as any;
            device.is_available = false;
            (device as any).is_aisle_open = true;
            (device as any).open_session_aisle_id = this.s(aisleId);
            this.extendSession(device);
            await mrsRepo.save(device);

            // 4) task_mrs OPEN (PENDING)
            const openDetail = tmRepo.create({
                task_id: this.s(nextTask.task_id)!,
                mrs_id: this.s(device.mrs_id)!,
                target_aisle_id: this.s(aisleId)!,
                action: TaskMrsAction.OPEN,
                operator: ControlSource.AUTO,
                result: LogResult.PENDING,
                started_at: new Date(),
            });
            await tmRepo.save(openDetail);

            // 5) mrs_log start (IN_PROGRESS)
            await logRepo.save(
                logRepo.create({
                    mrs_id: this.s(device.mrs_id)!,
                    aisle_id: this.s(aisleId)!,
                    task_id: this.s(nextTask.task_id)!,
                    task_mrs_id: openDetail.id,
                    action: MrsLogAction.OPEN_AISLE,
                    operator: ControlSource.AUTO,
                    start_time: new Date(),
                    result: LogResult.IN_PROGRESS,
                })
            );

            // 6) mark OPENING_AISLE
            await taskRepo.update(
                { task_id: nextTask.task_id },
                { status: StatusTasks.IN_PROGRESS, updated_at: new Date() }
            );
            await this.logTaskEvent(useManager, nextTask as any, "TASK_OPENING_AISLE", {
                source: TaskSource.DISPATCHER,
                subsystem: TaskSubsystem.MRS,
                prev: StatusTasks.QUEUED,
                next: StatusTasks.IN_PROGRESS,
                mrs_id: this.s(device.mrs_id),
                aisle_id: this.s(aisleId),
            });

            // commit ก่อนยิงคำสั่ง (กัน rollback แต่สั่งไปแล้ว)
            await ctx.commit();

            await this.gw.openAisle({
                mrs_id: device.mrs_id,
                aisle_id: aisleId,
                task_mrs_id: openDetail.id,
            });
        } catch (error: any) {
            await ctx.rollback();
            console.error(operation, error);
            // แค่ log พอ ให้รอบหน้า retry
        } finally {
            await ctx.release();
        }
    }
}



// // ============== EVENTS: ผิดปกติ / เสริม ==============

//     /** MRS แจ้งมีสิ่งกีดขวาง (idempotent) */
//     async onBlocked(payload: { task_mrs_id: string; reason?: string }, manager?: EntityManager) {
//         const em = manager ?? AppDataSource.manager;
//         const tmRepo  = em.getRepository(TaskMrsDetail);
//         const logRepo = em.getRepository(MrsLog);

//         const d = await tmRepo.findOne({ where: { id: payload.task_mrs_id } });
//         if (!d) return new ApiResponse().setIncomplete(lang.msg('validation.not_found'));

//         // อัปเดตแถว action ปัจจุบัน
//         d.blocked_flag = true as any;
//         d.blocked_reason = payload.reason ?? 'BLOCKED';
//         // ถ้าเป็นตอนจะปิด เราจะถือว่า discard (ไม่ถือว่า fail)
//         await tmRepo.save(d);

//         // เขียน log ช่วยสืบเหตุ
//         await logRepo.save(logRepo.create({
//         mrs_id: d.mrs_id, aisle_id: d.target_aisle_id, task_id: String(d.task_id),
//         action: d.action === 'CLOSED' ? ('CLOSE_AISLE' as any) : ('OPEN_AISLE' as any),
//         start_time: new Date(), end_time: new Date(),
//         result: LogResult.DISCARDED,
//         error_msg: payload.reason,
//         operator: d.operator as any,
//         }));

//         return new ApiResponse().setComplete(lang.msgSuccessAction('updated', 'item.task_mrs'), { task_mrs_id: d.id });
//     }

    


//     /** Fault จากเครื่อง/โปรโตคอล -> mark FAILED */
//     async onFault(payload: { mrs_id: number; code?: string; msg?: string; task_mrs_id?: string }, manager?: EntityManager) {
//         const em = manager ?? AppDataSource.manager;
//         const mrsRepo = em.getRepository(MRS);
//         const tmRepo  = em.getRepository(TaskMrsDetail);
//         const taskRepo= em.getRepository(TaskMrs);
//         const logRepo = em.getRepository(MrsLog);

//         const mrs = await mrsRepo.findOne({ where: { mrs_id: payload.mrs_id } });
//         if (mrs) { mrs.fault_msg = payload.msg ?? payload.code ?? 'FAULT'; await mrsRepo.save(mrs); }

//         if (payload.task_mrs_id) {
//         const d = await tmRepo.findOne({ where: { id: payload.task_mrs_id } });
//         if (d && d.result !== LogResult.SUCCESS) {
//             d.result = LogResult.FAIL;
//             d.finished_at = new Date();
//             await tmRepo.save(d);

//             // ปิด log
//             await logRepo.createQueryBuilder()
//             .update(MrsLog)
//             .set({ end_time: new Date(), result: LogResult.FAIL, error_code: payload.code, error_msg: payload.msg })
//             .where('task_id = :t AND aisle_id = :a AND action = :act', { t: d.task_id, a: d.target_aisle_id, act: d.action === 'OPEN' ? 'OPEN_AISLE' : 'CLOSE_AISLE' })
//             .execute();

//             await taskRepo.update({ task_id: d.task_id }, { status: StatusTasks.FAILED, updated_at: new Date(), error_code: payload.code as any, error_msg: payload.msg as any });
//         }
//         }

//         return new ApiResponse().setComplete(lang.msgSuccessAction('updated', 'item.mrs'), {});
//     }

//     /** Timeout ของ action ใดๆ */
//     async onTimeout(payload: { task_mrs_id: string }, manager?: EntityManager) {
//         const em = manager ?? AppDataSource.manager;
//         const tmRepo  = em.getRepository(TaskMrsDetail);
//         const logRepo = em.getRepository(MrsLog);
//         const taskRepo= em.getRepository(TaskMrs);

//         const d = await tmRepo.findOne({ where: { id: payload.task_mrs_id } });
//         if (!d) return new ApiResponse().setIncomplete(lang.msg('validation.not_found'));

//         if (d.result === LogResult.SUCCESS) return new ApiResponse().setComplete(lang.msg('common.already_completed'), {});

//         d.retry_count = (d.retry_count ?? 0) + 1;
//         d.result = LogResult.FAIL; // หรือนโยบายจะตั้ง TIMEOUT แยกคอลัมน์ก็ได้
//         d.finished_at = new Date();
//         await tmRepo.save(d);

//         await logRepo.createQueryBuilder()
//         .update(MrsLog)
//         .set({ end_time: new Date(), result: LogResult.FAIL, error_msg: 'TIMEOUT' })
//         .where('task_id = :t AND aisle_id = :a AND action = :act', { t: d.task_id, a: d.target_aisle_id, act: d.action === 'OPEN' ? 'OPEN_AISLE' : 'CLOSE_AISLE' })
//         .execute();

//         await taskRepo.update({ task_id: d.task_id }, { status: StatusTasks.FAILED, updated_at: new Date(), error_code: 'TIMEOUT' as any, error_msg: 'Action timeout' as any });

//         return new ApiResponse().setComplete(lang.msg('common.timeout'), {});
//     }

// // ============== MANUAL OVERRIDE ==============

//     /** เปิดช่องแบบ manual (สร้าง ad-hoc task เพื่อ audit) */
//     // async manualOpen(aisle_id: string, reqUser: string, note?: string, manager?: EntityManager) {
//     //     const response = new ApiResponse<any>();
//     //     const operation = 'T1MTaskService.manualOpen';

//     //     const queryRunner = manager ? null : AppDataSource.createQueryRunner();
//     //     const em = manager || queryRunner?.manager;
//     //     if (!em) return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));

//     //     if (!manager && queryRunner) { await queryRunner.connect(); await queryRunner.startTransaction(); }

//     //     try {
//     //     const taskRepo = em.getRepository(TaskMrs);
//     //     const mrsRepo  = em.getRepository(MRS);
//     //     const tmRepo   = em.getRepository(TaskMrsDetail);
//     //     const logRepo  = em.getRepository(MrsLog);

//     //     // 1) reserve device
//     //     const device = await this.pickMrsForAisle(aisle_id, em);
//     //     if (!device) return response.setIncomplete(lang.msg('validation.no_available_mrs'));

//     //     // 2) ad-hoc task
//     //     const task = await taskRepo.save(taskRepo.create({
//     //         work_order: `MANUAL-${new Date().toISOString()}`,  //แก้ไข roder_id
//     //         stock_item: 'MANUAL',
//     //         priority: 5,
//     //         store_type: 'T1M',
//     //         status: StatusTasks.IN_PROGRESS,
//     //         requested_by: reqUser,
//     //     }));

//     //     device.current_task_id  = task.task_id as any;
//     //     device.current_aisle_id = String(aisle_id) as any;
//     //     device.is_available     = false;
//     //     await mrsRepo.save(device);

//     //     // 3) OPEN detail + log
//     //     const openDetail = await tmRepo.save(tmRepo.create({
//     //         task_id: task.task_id,
//     //         mrs_id: String(device.mrs_id),
//     //         target_aisle_id: String(aisle_id),
//     //         action: AisleStatus.OPEN,
//     //         operator: ControlSource.MANUAL,
//     //         result: LogResult.PENDING,
//     //         started_at: new Date(),
//     //         // control_params_json: { operator_note: note } as any, // ถ้าต้องการบันทึกหมายเหตุ
//     //     }));

//     //     await logRepo.save(logRepo.create({
//     //         mrs_id: String(device.mrs_id),
//     //         aisle_id: String(aisle_id),
//     //         task_id: String(task.task_id),
//     //         action: MrsLogAction.OPEN_AISLE,
//     //         operator: ControlSource.MANUAL,
//     //         start_time: new Date(),
//     //         result: LogResult.IN_PROGRESS,
//     //         // error_msg: note,
//     //     }));

//     //     await this.gw.openAisle({ mrs_id: device.mrs_id, aisle_id: Number(aisle_id), task_mrs_id: openDetail.id });

//     //     if (!manager && queryRunner) await queryRunner.commitTransaction();
//     //     return response.setComplete(lang.msgSuccessAction('created', 'item.t1m_task'), { task_id: task.task_id, task_mrs_open_id: openDetail.id, mrs_id: device.mrs_id });
//     //     } catch (e:any) {
//     //     if (!manager) await queryRunner?.rollbackTransaction();
//     //     throw new Error(lang.msgErrorFunction(operation, e.message));
//     //     } finally {
//     //     if (!manager) await queryRunner?.release();
//     //     }
//     // }

//     /** ปิดช่องแบบ manual (force ได้—แต่ต้องตรวจ sensor ถ้าไม่ force) */
//     async manualClose(aisle_id: string, reqUser: string, opts?: { force?: boolean; note?: string }, manager?: EntityManager) {
//         const response = new ApiResponse<any>();
//         const operation = 'T1MTaskService.manualClose';

//         const queryRunner = manager ? null : AppDataSource.createQueryRunner();
//         const em = manager || queryRunner?.manager;
//         if (!em) return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
//         if (!manager && queryRunner) { await queryRunner.connect(); await queryRunner.startTransaction(); }

//         try {
//         const tmRepo   = em.getRepository(TaskMrsDetail);
//         const taskRepo = em.getRepository(TaskMrs);
//         const logRepo  = em.getRepository(MrsLog);

//         // หา OPEN ล่าสุดของช่องนี้
//         const open = await tmRepo.findOne({ where: { target_aisle_id: String(aisle_id), action: 'OPEN' as any }, order: { started_at: 'DESC' } });
//         if (!open) return response.setIncomplete(lang.msg('validation.not_found'));

//         if (!(opts?.force)) {
//             const sensorClear = await this.isAisleSensorClear(aisle_id);
//             if (!sensorClear) {
//             await logRepo.save(logRepo.create({
//                 mrs_id: open.mrs_id, 
//                 aisle_id: String(aisle_id), 
//                 task_id: String(open.task_id),
//                 action: MrsLogAction.CLOSE_AISLE, 
//                 operator: ControlSource.MANUAL, 
//                 start_time: new Date(), 
//                 end_time: new Date(),
//                 result: LogResult.DISCARDED, 
//                 error_msg: 'Sensor detects object (manual)',
//             }));
//             await taskRepo.update({ task_id: open.task_id }, { status: StatusTasks.WAIT_CONFIRM, updated_at: new Date() });
//             return response.setIncomplete(lang.msg('validation.sensor_detect_object_discard_close'));
//             }
//         }

//         // insert CLOSE (MANUAL) + log แล้วส่งคำสั่ง
//         const closeDetail = await tmRepo.save(tmRepo.create({
//             task_id: open.task_id, 
//             mrs_id: open.mrs_id, 
//             target_aisle_id: open.target_aisle_id,
//             action: TaskMrsAction.CLOSED, 
//             operator: ControlSource.MANUAL, 
//             result: LogResult.PENDING, 
//             started_at: new Date(),
//         }));

//         await logRepo.save(logRepo.create({
//             mrs_id: closeDetail.mrs_id, 
//             aisle_id: closeDetail.target_aisle_id, 
//             task_id: String(closeDetail.task_id),
//             action: MrsLogAction.CLOSE_AISLE, 
//             operator: ControlSource.MANUAL, 
//             start_time: new Date(), 
//             result: LogResult.IN_PROGRESS,
//         }));

//         await this.gw.closeAisle({ mrs_id: Number(closeDetail.mrs_id), aisle_id: Number(closeDetail.target_aisle_id), task_mrs_id: closeDetail.id });
//         await taskRepo.update({ task_id: closeDetail.task_id }, { status: StatusTasks.CLOSING, updated_at: new Date() });

//         if (!manager && queryRunner) await queryRunner.commitTransaction();
//         return response.setComplete(lang.msgSuccessAction('updated', 'item.t1m_task'), { task_mrs_close_id: closeDetail.id });
//         } catch (e:any) {
//         if (!manager) await queryRunner?.rollbackTransaction();
//         throw new Error(lang.msgErrorFunction(operation, e.message));
//         } finally {
//         if (!manager) await queryRunner?.release();
//         }
//     }
// import { EntityManager } from "typeorm";
// import { AppDataSource } from "../config/app-data-source";
// import { ApiResponse } from "../models/api-response.model";
// import { TaskMrs } from "../entities/task_mrs.entity";
// import { MRS } from "../entities/mrs.entity";
// import { Aisle } from "../entities/aisle.entity";
// import { MrsGateway } from "../gateways/mrs.gateway";
// import { StatusOrders, AisleStatus } from "../common/global.enum";
// import * as lang from "../utils/LangHelper";

// /**
//  * Handles system-level startup and shutdown sequences (for FAT “Normal Start-Up / Shut-Down Process”)
//  */
// export class SystemStartupService {
//     constructor(private gw: MrsGateway) {}

//     /** ตรวจสอบทุก subsystem ว่า online ก่อนเริ่มงาน (WCS startup phase) */
//     async systemStartup(manager?: EntityManager): Promise<ApiResponse<any>> {
//         const operation = "SystemStartupService.systemStartup";
//         const response = new ApiResponse<any>();

//         const queryRunner = manager ? null : AppDataSource.createQueryRunner();
//         const useManager = manager ?? queryRunner?.manager;

//         try {
//             if (!useManager) throw new Error("No entity manager available");

//             if (queryRunner) {
//                 await queryRunner.connect();
//                 await queryRunner.startTransaction();
//             }

//             const mrsRepo = useManager.getRepository(MRS);
//             const aisleRepo = useManager.getRepository(Aisle);
//             const taskRepo = useManager.getRepository(TaskMrs);

//             // 1) ตรวจสอบการเชื่อมต่อ Gateway
//             const isGatewayOnline = await this.gw.healthCheck?.();
//             if (!isGatewayOnline) {
//                 throw new Error("MRS Gateway not reachable or offline");
//             }

//             // 2) ตรวจสอบสถานะ MRS ทั้งหมด
//             const allMRS = await mrsRepo.find();
//             for (const mrs of allMRS) {
//                 (mrs as any).is_available = true;
//                 (mrs as any).is_aisle_open = false;
//                 (mrs as any).current_task_id = null;
//                 (mrs as any).current_aisle_id = null;
//                 (mrs as any).open_session_aisle_id = null;
//                 (mrs as any).open_session_expires_at = null;
//                 await mrsRepo.save(mrs);
//             }

//             // 3) ปิด task ที่ค้างอยู่ในสถานะไม่สมบูรณ์
//             await taskRepo
//                 .createQueryBuilder()
//                 .update(TaskMrs)
//                 .set({ status: StatusOrders.CANCELLED, updated_at: new Date() })
//                 .where("status NOT IN (:...valid)", {
//                     valid: [StatusOrders.COMPLETED, StatusOrders.FAILED, StatusOrders.CANCELLED],
//                 })
//                 .execute();

//             // 4) Reset สถานะช่อง (aisle)
//             await aisleRepo
//                 .createQueryBuilder()
//                 .update(Aisle)
//                 .set({ status: AisleStatus.CLOSED as any, last_event_at: new Date() })
//                 .execute();

//             if (queryRunner) await queryRunner.commitTransaction();

//             return response.setComplete("System startup completed successfully", {
//                 gateway_online: true,
//                 mrs_count: allMRS.length,
//                 reset_tasks: true,
//                 reset_aisles: true,
//             });
//         } catch (error: any) {
//             if (queryRunner) await queryRunner.rollbackTransaction();
//             console.error(operation, error);
//             return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
//         } finally {
//             if (queryRunner) await queryRunner.release();
//         }
//     }

//     /** ปิดระบบอย่างปลอดภัย (WCS shutdown phase) */
//     async systemShutdown(manager?: EntityManager): Promise<ApiResponse<any>> {
//         const operation = "SystemStartupService.systemShutdown";
//         const response = new ApiResponse<any>();

//         const queryRunner = manager ? null : AppDataSource.createQueryRunner();
//         const useManager = manager ?? queryRunner?.manager;

//         try {
//             if (!useManager) throw new Error("No entity manager available");

//             if (queryRunner) {
//                 await queryRunner.connect();
//                 await queryRunner.startTransaction();
//             }

//             const mrsRepo = useManager.getRepository(MRS);
//             const aisleRepo = useManager.getRepository(Aisle);

//             // 1) ตรวจสอบว่ามี task active หรือไม่ (fail-safe)
//             const taskRepo = useManager.getRepository(TaskMrs);
//             const activeTasks = await taskRepo.find({
//                 where: [
//                     { status: StatusOrders.IN_PROGRESS },
//                     { status: StatusOrders.WAITING_FINISH },
//                     { status: StatusOrders.AISLE_OPEN },
//                     { status: StatusOrders.AISLE_CLOSE },
//                 ],
//             });
//             if (activeTasks.length > 0) {
//                 for (const t of activeTasks) {
//                     await taskRepo.update(
//                         { task_id: t.task_id },
//                         { status: StatusOrders.CANCELLED, updated_at: new Date() }
//                     );
//                 }
//             }

//             // 2) ปิด session ทั้งหมดใน MRS
//             const allMRS = await mrsRepo.find();
//             for (const mrs of allMRS) {
//                 (mrs as any).current_task_id = null;
//                 (mrs as any).current_aisle_id = null;
//                 (mrs as any).is_available = true;
//                 (mrs as any).is_aisle_open = false;
//                 (mrs as any).open_session_aisle_id = null;
//                 (mrs as any).open_session_expires_at = null;
//                 await mrsRepo.save(mrs);
//             }

//             // 3) ปิดสถานะ aisle ทั้งหมดเป็น CLOSED
//             await aisleRepo
//                 .createQueryBuilder()
//                 .update(Aisle)
//                 .set({ status: AisleStatus.CLOSED as any, last_event_at: new Date() })
//                 .execute();

//             // 4) ปิดการเชื่อมต่อ Gateway
//             if (typeof this.gw.disconnect === "function") {
//                 await this.gw.disconnect();
//             }

//             if (queryRunner) await queryRunner.commitTransaction();

//             return response.setComplete("System shutdown completed successfully", {
//                 closed_active_tasks: activeTasks.length,
//                 mrs_sessions_cleared: allMRS.length,
//                 gateway_disconnected: true,
//             });
//         } catch (error: any) {
//             if (queryRunner) await queryRunner.rollbackTransaction();
//             console.error(operation, error);
//             return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
//         } finally {
//             if (queryRunner) await queryRunner.release();
//         }
//     }
// }

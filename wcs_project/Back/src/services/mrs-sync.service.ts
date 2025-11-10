// // services/mrs-sync.service.ts
// import { DataSource } from 'typeorm';
// import { MrsGateway, HeartbeatMsg, StateMsg } from '../gateways/mrs.gateway';
// import { mrs as MRS } from '../entities/mrs.entity';
// import { mrs_log as MrsLog } from '../entities/mrs_log.entity';
// import { ControlSource, LogResult, MrsLogAction } from '../common/global.enum';

// export class MrsSyncService {
//   private ttlMs = 6000; // ถือว่ายังสดภายใน 6 วิ

//   constructor(private ds: DataSource, private gw: MrsGateway) {}

//   start() {
//     this.gw.on('heartbeat', (msg: HeartbeatMsg) => this.onHeartbeat(msg));
//     this.gw.on('state', (msg: StateMsg) => this.onState(msg));
//     this.gw.on('ack', (msg) => this.onAck(msg));
//   }

//   private async onHeartbeat(e: HeartbeatMsg) {
//     const repo = this.ds.getRepository(MRS);
//     const row = repo.create({
//       mrs_id: Number(e.mrs_id),
//       mrs_code: e.mrs_code,
//       bank_code: e.bank_code ?? 'B1',
//       is_available: e.is_available ? 1 : 0,
//       mrs_status: e.mrs_status,
//       e_stop: e.e_stop ? 1 : 0,
//       battery_level: e.battery_level,
//       last_heartbeat_at: new Date(e.ts),
//       last_update: new Date(), // แตะไว้เป็น last write
//     });
//     await repo.save(row); // upsert โดย PK/unique
//   }

//   private async onState(e: StateMsg) {
//     await this.ds.getRepository(MRS).update(
//       { mrs_id: Number(e.mrs_id) },
//       {
//         current_aisle_id: e.current_aisle_id?.toString(),
//         target_aisle_id: e.target_aisle_id?.toString(),
//         is_available: e.is_available ? 1 : 0,
//         mrs_status: e.mrs_status,
//         last_heartbeat_at: new Date(e.ts),
//         last_update: new Date(),
//       }
//     );
//   }

//   private async onAck(e: { correlation_id: string; mrs_id: string | number; result: 'OK' | 'ERROR'; error_code?: string; error_msg?: string; ts: string; }) {
//     // ตัวอย่าง: บันทึก log สั้น ๆ จาก ACK
//     await this.ds.getRepository(MrsLog).save({
//       mrs_id: String(e.mrs_id),
//       action: MrsLogAction.OPEN_AISLE,
//       operator: ControlSource.AUTO,
//       start_time: new Date(e.ts),
//       end_time: new Date(e.ts),
//       result: e.result === 'OK' ? LogResult.SUCCESS : LogResult.FAILED,
//       error_code: e.error_code,
//       error_msg: e.error_msg,
//       correlation_id: e.correlation_id,
//     });
//   }

//   /** helper: ใช้เช็กว่าข้อมูล mrs สดพอไหม */
//   isFresh(row: MRS) {
//     return row.last_heartbeat_at && (Date.now() - new Date(row.last_heartbeat_at).getTime()) < this.ttlMs;
//   }
// }

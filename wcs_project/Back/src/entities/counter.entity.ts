// import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

// /**
//  * counter: จุดให้หุ่นยนต์นำพัสดุมาส่งให้ผู้ใช้หยิบ/สแกน/ยืนยัน
//  * - รองรับสถานะไฟรวมของทั้ง counter (ถ้ามี “tower light” ร่วม)
//  * - รองรับสถานะ shutter ประตู (ถ้าจุดนั้นมีฝาปิด/ประตูอัตโนมัติ)
//  * - ถ้ามีไฟหรือ shutter แยก “ราย slot” จะไปเก็บที่ counter_slot แทน/เพิ่มเติม
//  */
// export type CounterStatus = 'IDLE' | 'OCCUPIED' | 'BLOCKED' | 'FAULT';
// export type LightMode = 'OFF' | 'STEADY' | 'BLINK_SLOW' | 'BLINK_FAST';
// export type ShutterStatus = 'CLOSED' | 'OPENING' | 'OPEN' | 'CLOSING' | 'BLOCKED' | 'FAULT';
// export type ShutterCmd = 'OPEN' | 'CLOSE' | 'STOP';

// @Entity({ name: 'counter' })
// @Index('idx_counter_status', ['status'])
// export class Counter {
//     @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Primary key of counter' })
//     counter_id!: string;

//     @Column({ type: 'varchar', length: 32, comment: 'Counter code, e.g., C1/C2' })
//     code!: string;

//     @Column({ type: 'varchar', length: 32, nullable: true, comment: 'Zone/area (optional)' })
//     zone?: string;

//     /** สถานะภาพรวมของ counter (ไม่ใช่ไฟ/ชัตเตอร์) */
//     @Column({ type: 'enum', enum: ['IDLE','OCCUPIED','BLOCKED','FAULT'], default: 'IDLE', comment: 'Counter status' })
//     status!: CounterStatus;

//     /** --- LIGHT (รวมทั้งจุด) --- */
//     @Column({ type: 'tinyint', width: 1, default: 0, comment: 'Has shared tower light? (0/1)' })
//     has_light!: boolean;

//     /** โหมดไฟรวม: ปิด/ติดคงที่/กระพริบช้า/เร็ว */
//     @Column({ type: 'enum', enum: ['OFF','STEADY','BLINK_SLOW','BLINK_FAST'], default: 'OFF', comment: 'Shared light mode' })
//     light_mode!: LightMode;

//     /** สีไฟรวม (hex #RRGGBB) ใช้ได้กับไฟ RGB; ถ้าเป็นไฟสีตายตัว ปล่อยค่าเป็น null หรือคงค่าเดิม */
//     @Column({ type: 'varchar', length: 7, nullable: true, comment: 'Shared light color in HEX, e.g., #00FF00 (optional)' })
//     light_color_hex?: string;

//     /** ความสว่าง 0–100% */
//     @Column({ type: 'tinyint', unsigned: true, nullable: true, comment: 'Shared light brightness (0-100), optional' })
//     light_brightness?: number;

//     /** เวลา/ผลการสั่งไฟล่าสุด (เพื่อสืบเหตุ) */
//     @Column({ type: 'timestamp',  nullable: true, comment: 'Last light command timestamp (optional)' })
//     light_updated_at?: Date;

//     /** --- SHUTTER (ประตู/ฝา) --- */
//     @Column({ type: 'tinyint', width: 1, default: 0, comment: 'Has shutter gate? (0/1)' })
//     has_shutter!: boolean;

//     /** สถานะชัตเตอร์ */
//     @Column({
//         type: 'enum',
//         enum: ['CLOSED','OPENING','OPEN','CLOSING','BLOCKED','FAULT'],
//         nullable: true,
//         comment: 'Shutter gate status (if any)'
//     })
//     shutter_status?: ShutterStatus;

//     /** คำสั่งล่าสุดที่ส่งไปที่ชัตเตอร์ + เวลา */
//     @Column({ type: 'enum', enum: ['OPEN','CLOSE','STOP'], nullable: true, comment: 'Last shutter command (optional)' })
//     shutter_last_cmd?: ShutterCmd;

//     @Column({ type: 'timestamp',  nullable: true, comment: 'Last shutter command timestamp (optional)' })
//     shutter_last_cmd_at?: Date;

//     /** รหัสผิดพลาด (ถ้ามี) ของชัตเตอร์ */
//     @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Shutter error code (optional)' })
//     shutter_error_code?: string;

//     @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Shutter error message (optional)' })
//     shutter_error_msg?: string;

//     /** สถานะ I/O เฉพาะรุ่น (เช่น sensor open/close, interlock) */
//     @Column({ type: 'json', nullable: true, comment: 'Raw/extra IO state for vendor-specific bits (optional)' })
//     shutter_io_state_json?: object;

//     /** --- เวลามีการเปลี่ยนแปลงสถานะรวมของ counter --- */
//     @Column({
//         type: 'timestamp', 
//         default: () => 'CURRENT_TIMESTAMP',
//         onUpdate: 'CURRENT_TIMESTAMP',
//         comment: 'Last state change'
//     })
//     last_event_at!: Date;
// }

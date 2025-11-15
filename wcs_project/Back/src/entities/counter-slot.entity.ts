// import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
// import { LightMode, ShutterStatus, ShutterCmd } from './m_counter.entity';

// /**
//  * counter_slot: ช่องย่อยในแต่ละ counter (S1/S2/…)
//  * - ถ้าไฟ/ชัตเตอร์แยก “รายช่อง” ให้เก็บสถานะไว้ที่นี่
//  */
// export type SlotStatus = 'IDLE' | 'OCCUPIED' | 'BLOCKED' | 'FAULT';

// @Entity({ name: 'counter_slot' })
// @Index('idx_cslot_counter', ['counter_id'])
// @Index('idx_cslot_status', ['status'])
// export class CounterSlot {
//     @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Primary key of counter_slot' })
//     cslot_id!: string;

//     @Column({ type: 'bigint', unsigned: true, comment: 'Counter id (parent)' })
//     counter_id!: string;

//     @Column({ type: 'varchar', length: 16, comment: 'Slot code, e.g., S1/S2' })
//     slot_code!: string;

//     @Column({ type: 'enum', enum: ['IDLE','OCCUPIED','BLOCKED','FAULT'], default: 'IDLE', comment: 'Slot status' })
//     status!: SlotStatus;

//     /** งานที่ครองช่องนี้อยู่ (ถ้ามี) */
//     @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Logical FK to task_wrs.id' })
//     task_wrs_id?: string;

//     /** --- LIGHT (รายช่อง) --- */
//     @Column({ type: 'tinyint', width: 1, default: 0, comment: 'Has per-slot light? (0/1)' })
//     has_light!: boolean;

//     @Column({ type: 'enum', enum: ['OFF','STEADY','BLINK_SLOW','BLINK_FAST'], default: 'OFF', comment: 'Slot light mode' })
//     light_mode!: LightMode;

//     @Column({ type: 'varchar', length: 7, nullable: true, comment: 'Slot light color HEX (optional)' })
//     light_color_hex?: string;

//     @Column({ type: 'tinyint', unsigned: true, nullable: true, comment: 'Slot light brightness (0-100), optional' })
//     light_brightness?: number;

//     @Column({ type: 'timestamp',  nullable: true, comment: 'Last slot light command time (optional)' })
//     light_updated_at?: Date;

//     /** --- SHUTTER (รายช่อง) — ถ้าช่องมีฝาแยก --- */
//     @Column({ type: 'tinyint', width: 1, default: 0, comment: 'Has per-slot shutter? (0/1)' })
//     has_shutter!: boolean;

//     @Column({
//         type: 'enum',
//         enum: ['CLOSED','OPENING','OPEN','CLOSING','BLOCKED','FAULT'],
//         nullable: true,
//         comment: 'Per-slot shutter status (optional)'
//     })
//     shutter_status?: ShutterStatus;

//     @Column({ type: 'enum', enum: ['OPEN','CLOSE','STOP'], nullable: true, comment: 'Last per-slot shutter command (optional)' })
//     shutter_last_cmd?: ShutterCmd;

//     @Column({ type: 'timestamp',  nullable: true, comment: 'Last per-slot shutter command time (optional)' })
//     shutter_last_cmd_at?: Date;

//     @Column({ type: 'json', nullable: true, comment: 'Per-slot shutter IO/extra state (optional)' })
//     shutter_io_state_json?: object;

//     /** เวลา confirm ล่าสุดของผู้ใช้ (เช่นกดปุ่ม/สแกน) */
//     @Column({ type: 'timestamp',  nullable: true, comment: 'Last user confirm at this slot (optional)' })
//     last_confirm_at?: Date;

//     /** เวลาที่สถานะช่องเปลี่ยนล่าสุด */
//     @Column({
//         type: 'timestamp', 
//         default: () => 'CURRENT_TIMESTAMP',
//         onUpdate: 'CURRENT_TIMESTAMP',
//         comment: 'Last state change'
//     })
//     last_event_at!: Date;
// }

// import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
// import { LogResult, WrsAction } from '../common/global.enum';

// /**
//  * wrs_log: บันทึก action ของหุ่นยนต์เพื่อรายงาน/สืบเหตุ
//  * เก็บเวลาเดินทาง, ระยะ, การลดแบต, ผลลัพธ์, error ฯลฯ
//  */
// @Entity({ name: 'wrs_log' })
// export class WrsLog {
//     @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Primary key of wrs_log' })
//     log_wrs_id!: string;

//     @Column({ type: 'bigint', unsigned: true, comment: 'WRS robot id' })
//     wrs_id!: string;

//     @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Task id linked (optional)' })
//     task_id?: string;

//     /** ตำแหน่งเกี่ยวข้อง (source/destination/counter) เพื่อสืบเหตุได้ชัด */
//     @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Source location id (optional)' })
//     source_location_id?: string;

//     @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Destination location id (optional)' })
//     dest_location_id?: string;

//     @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Counter id (optional)' })
//     counter_id?: string;

//     @Column({ type: 'varchar', length: 16, nullable: true, comment: 'Counter slot (optional)' })
//     counter_slot?: string;

//     @Column({
//         type: 'enum',
//         comment: 'Robot action type'
//     })
//     action!: WrsAction;

//     @Column({ type: 'timestamp',  comment: 'Action start (ms precision)' })
//     start_time!: Date;

//     @Column({ type: 'timestamp',  nullable: true, comment: 'Action end (ms precision)' })
//     end_time?: Date;

//     @Column({ type: 'int', unsigned: true, nullable: true, comment: 'Action duration (ms)' })
//     duration_ms?: number;

//     /** ตัวเลขช่วยรายงาน/ปรับจูน (มาจาก RCS/อุปกรณ์) */
//     @Column({ type: 'int', nullable: true, comment: 'Travel distance (mm), optional' })
//     distance_mm?: number;

//     @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true, comment: 'Average speed (m/s), optional' })
//     speed_avg?: string;

//     @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true, comment: 'Max speed (m/s), optional' })
//     speed_max?: string;

//     @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true, comment: 'Max acceleration (m/s^2), optional' })
//     accel_max?: string;

//     @Column({ type: 'tinyint', unsigned: true, nullable: true, comment: 'Battery drop during action (%), optional' })
//     battery_drop_pct?: number;

//     @Column({ type: 'enum', default: LogResult, comment: 'Final result' })
//     result!: LogResult;

//     @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Error code (if failed)' })
//     error_code?: string;

//     @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Error message (if failed)' })
//     error_msg?: string;

//     @Column({ type: 'timestamp',  default: () => 'CURRENT_TIMESTAMP', comment: 'Insert timestamp' })
//     created_at!: Date;
// }

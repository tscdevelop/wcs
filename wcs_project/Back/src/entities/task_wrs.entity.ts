// import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
// import { LogResult } from '../common/global.enum';

// /**
//  * task_wrs: รายการย่อยของ task สำหรับฝั่ง WRS (หุ่นยนต์ AGV)
//  * ใช้เก็บข้อมูลเส้นทาง/ต้นทาง/ปลายทาง/จุด Counter/ค่าควบคุม/ผลลัพธ์ของงาน
//  * หมายเหตุ: ไม่ใส่ใน tasks เพื่อให้ tasks เป็นกลาง ใช้ร่วมกับ T1M ได้
//  */
// @Entity({ name: 'task_wrs' })
// export class task_wrs {
//     /** รหัสรายละเอียด (PK) */
//     @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Primary key of task_wrs' })
//     id!: string;

//     /** อ้างถึงงานแม่ (logical FK → tasks.task_id) */
//     @Column({ type: 'bigint', unsigned: true, comment: 'FK -> tasks.task_id (logical)' })
//     task_id!: string;

//     /** หุ่นยนต์ที่รับงานนี้ */
//     @Column({ type: 'bigint', unsigned: true, comment: 'WRS robot id' })
//     wrs_id!: string;

//     /** ตำแหน่งต้นทางของสินค้า (เช่น pod/bin/slot) */
//     @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Source location id (bin/pod/slot)' })
//     source_location_id?: string;

//     /** ตำแหน่งปลายทางที่ต้องนำของไปวาง/รับ (เช่น Counter) */
//     @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Target location id (e.g., return bin/pod)' })
//     target_location_id?: string;

//     /** จุด Counter และช่อง Counter ที่จะเสิร์ฟให้ผู้ใช้ (UI scan/confirm) */
//     @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Counter id (pickup/putaway)' })
//     counter_id?: string;

//     @Column({ type: 'varchar', length: 16, nullable: true, comment: 'Counter slot (e.g., S1/S2), optional' })
//     counter_slot?: string;

//     /** ประเภทการกระทำหลักของงานหุ่นยนต์ */
//     @Column({
//         type: 'enum',
//         enum: ['PICK','MOVE','DELIVER_TO_COUNTER','RETURN_TO_STORAGE','TO_CHARGER','CHARGING'],
//         default: 'PICK',
//         comment: 'Primary robotic action for this task'
//     })
//     action!: 'PICK' | 'MOVE' | 'DELIVER_TO_COUNTER' | 'RETURN_TO_STORAGE' | 'TO_CHARGER' | 'CHARGING';

//     /** ชื่อ/ไอดีงานฝั่ง RCS (Robotics Control System) เพื่อกันสั่งซ้ำและติดตาม */
//     @Column({ type: 'varchar', length: 64, nullable: true, comment: 'External RCS job id (idempotency trace)' })
//     rcs_job_id?: string;

//     /** โปรไฟล์ควบคุมที่ใช้งาน (ถ้ามี override/เลือกได้ตาม scope) */
//     @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'robot_control_profile.control_id (optional)' })
//     control_id?: string;

//     /** ค่าควบคุมที่ส่งจริงกับงานนี้ (snapshot setpoints/limits) */
//     @Column({ type: 'json', nullable: true, comment: 'Snapshot of control params (e.g., {maxSpeed, accel})' })
//     control_params_json?: object;

//     /** เวลาเริ่ม/ถึงจุดรับ/ถึง Counter/ยืนยัน/กลับคืน/เสร็จงาน */
//     @Column({ type: 'timestamp',  nullable: true, comment: 'Start moving time' })
//     started_at?: Date;

//     @Column({ type: 'timestamp',  nullable: true, comment: 'Arrived at source location' })
//     arrived_source_at?: Date;

//     @Column({ type: 'timestamp',  nullable: true, comment: 'Arrived at counter' })
//     arrived_counter_at?: Date;

//     @Column({ type: 'timestamp',  nullable: true, comment: 'User confirm at counter (scan/press)' })
//     user_confirm_at?: Date;

//     @Column({ type: 'timestamp',  nullable: true, comment: 'Returned to storage complete' })
//     returned_at?: Date;

//     @Column({ type: 'timestamp',  nullable: true, comment: 'Finish time for the whole WRs task' })
//     finished_at?: Date;

//     /** ผลลัพธ์ของงาน */
//     @Column({ type: 'enum', default: LogResult.PENDING, comment: 'Final result' })
//     result!: LogResult;

//     /** การสั่งซ้ำ/เหตุขัดข้อง */
//     @Column({ type: 'int', unsigned: true, default: 0, comment: 'Retry count' })
//     retry_count!: number;

//     @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Error code if failed' })
//     error_code?: string;

//     @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Error message if failed' })
//     error_msg?: string;

//     /** ตัวช่วยทำรายงาน (เวลาเดินทาง/ระยะ/แบต) */
//     @Column({ type: 'int', unsigned: true, nullable: true, comment: 'Travel time from source to counter (ms), optional' })
//     travel_time_ms?: number;

//     @Column({ type: 'int', unsigned: true, nullable: true, comment: 'Wait time at counter (ms), optional' })
//     wait_counter_ms?: number;

//     @Column({ type: 'int', nullable: true, comment: 'Estimated/Measured travel distance (mm), optional' })
//     travel_distance_mm?: number;

//     @Column({ type: 'tinyint', unsigned: true, nullable: true, comment: 'Battery before (%)' })
//     battery_before?: number;

//     @Column({ type: 'tinyint', unsigned: true, nullable: true, comment: 'Battery after (%)' })
//     battery_after?: number;

//     /** โหมดการสั่งงาน (AUTO/ผู้ใช้กด MANUAL) */
//     @Column({ type: 'varchar', length: 10, default: 'AUTO', comment: 'Operator mode: AUTO or MANUAL' })
//     operator!: 'AUTO' | 'MANUAL';

//     /** Audit เวลาแทรกแถวนี้ */
//     @Column({ type: 'timestamp',  default: () => 'CURRENT_TIMESTAMP', comment: 'Insert timestamp' })
//     created_at!: Date;
// }

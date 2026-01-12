import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { StatusMRS, ControlSource } from "../common/global.enum";

/**
 * mrs_log: log ต่อ action ของ MRS (ใช้ทำรายงาน/สืบเหตุ)
 * - เก็บเวลาที่ใช้ ผลลัพธ์ การถูกบล็อก ค่าควบคุม/ค่าสรุป ฯลฯ
 */
@Entity({ name: "mrs_log" })
export class MrsLog {
    /** รหัส log (PK) */
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Primary key of MRS log' })
    log_mrs_id!: string;

    /** อ้างถึง MRS ที่ทำงาน */
    @Column({ type: 'bigint', unsigned: true, comment: 'MRS device id (logical FK)' })
    mrs_id?: string | null;

    /** ประเภทการกระทำ */
    @Column({ type: 'enum', enum: StatusMRS, default: StatusMRS.IDLE })
    status!: StatusMRS

    /** ช่องที่เกี่ยวข้อง */
    @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Aisle id involved (logical FK)' })
    aisle_id?: string | null;

    /** งานที่เกี่ยวข้อง */
    @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Task id linked to this action (logical FK)' })
    order_id?: string | null;

    /** ผู้ควบคุม: AUTO/Manual */
    @Column({ type: 'enum', enum:ControlSource, default: ControlSource.AUTO, comment: 'Operator mode: AUTO/MANUAL' })
    operator!: ControlSource;

    /** เวลาเริ่ม/จบงาน */
    @Column({ type: 'timestamp',  comment: 'Action start timestamp (ms precision)' })
    start_time!: Date;

    @Column({ type: 'timestamp',  nullable: true, comment: 'Action end timestamp (ms precision)' })
    end_time?: Date;

    /** ระยะเวลา (มิลลิวินาที) — บันทึกไว้ให้คิวรีรายงานเร็ว */
    @Column({ type: 'int', unsigned: true, nullable: true, comment: 'Action duration in milliseconds' })
    task_duration?: number | null;

    /** สรุปความเร็ว/เร่ง/ระยะที่เลื่อน (อ้างอิงจาก telemetry) */
    @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true, comment: 'Average speed (m/s)' })
    speed_avg?: string;

    @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true, comment: 'Max speed (m/s)' })
    speed_max?: string;

    @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true, comment: 'Max acceleration (m/s^2)' })
    accel_max?: string;

    @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true, comment: 'Max deceleration (m/s^2)' })
    decel_max?: string;

    @Column({ type: 'int', nullable: true, comment: 'Traveled distance in millimeters' })
    distance_mm?: number;

    /** เวลาเปิด/ปิดจริง (เพื่อวิเคราะห์ performance) */
    @Column({ type: 'int', unsigned: true, nullable: true, comment: 'Open aisle duration (ms)' })
    open_duration_ms?: number;

    @Column({ type: 'int', unsigned: true, nullable: true, comment: 'Close aisle duration (ms)' })
    close_duration_ms?: number;

    /** เหตุการณ์ถูกบล็อก/มีสิ่งกีดขวาง */
    @Column({ type: 'tinyint', width: 1, default: 0, comment: 'Blocked by object (0/1)' })
    blocked_flag!: boolean;

    @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Reason of blocking (if any)' })
    blocked_reason?: string;

    /** การยืนยันโดยผู้ใช้ / timeout */
    @Column({ type: 'timestamp',  nullable: true, comment: 'User confirm timestamp' })
    confirm_time?: Date;

    @Column({ type: 'tinyint', width: 1, default: 0, comment: 'Completed by timeout (0/1)' })
    timeout_flag!: boolean;

    /** การสั่งซ้ำ/ผลลัพธ์/รหัสผิดพลาด */
    @Column({ type: 'int', unsigned: true, default: 0, comment: 'Number of retries' })
    retry_count!: number;

    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Error code if failed' })
    error_code?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Error message if failed' })
    error_msg?: string;

    /** อ้างอิงโปรไฟล์/ชุดเทเลเมทรี (optional) */
    @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Control profile id used (optional)' })
    control_id?: string;

    /** พลังงานที่ใช้ (Wh) ถ้าเก็บได้จากระบบไฟ/แบต */
    @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true, comment: 'Energy consumed in Wh' })
    energy_used_wh?: string;

    /** อ้างอิงชุด telemetry ที่ใช้สรุป (ถ้ามีการทำ roll-up แยก) */
    @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Reference id to telemetry batch/rollup (optional)' })
    telemetry_ref?: string;

    //เชื่อมกับคำสั่ง/ACK
    @Column({ type: 'varchar', length: 64, nullable: true, comment: 'Correlation/message id' })
    correlation_id?: string;

    /** เวลาเขียน log */
    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    created_at!: Date;
}

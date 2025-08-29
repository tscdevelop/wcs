import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { ControlSource, LogResult, TaskMrsAction } from '../common/global.enum';

/**
 * task_mrs: รายการย่อยของ task สำหรับฝั่ง MRS
 * - บันทึกว่า MRS เครื่องไหน เปิด/ปิด aisle ไหน ใช้ค่าควบคุมอะไร ผลลัพธ์เป็นอย่างไร
 * - ใช้เป็นทั้ง "detail" และ "log ต่อรอบงาน" ได้
 */
@Entity({ name: 'task_mrs' })
export class TaskMrs {
    /** รหัสรายละเอียด (PK) */
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Primary key of task_mrs' })
    id!: string;

    /** อ้างถึงงานแม่ (logical FK → tasks.task_id) */
    @Column({ type: 'bigint', unsigned: true, comment: 'FK -> tasks.task_id (logical)' })
    task_id!: string;

    /** อุปกรณ์ MRS ที่ทำงานนี้ */
    @Column({ type: 'bigint', unsigned: true, comment: 'MRS device id' })
    mrs_id!: string;

    /** ช่องทางเดินที่เกี่ยวข้องกับงานนี้ */
    @Column({ type: 'bigint', unsigned: true, comment: 'Target aisle id for this action (optional)' })
    target_aisle_id!: string;

    /** ประเภทการกระทำของ MRS */
    @Column({ type: 'enum', enum: TaskMrsAction , comment: 'คำสั่งที่สั่งให้ MRS ทำ” (เปิด หรือ ปิด)' })
    action: TaskMrsAction;

    /** โหมดการสั่งงาน (AUTO/ผู้ใช้กด MANUAL) */
    @Column({ type: 'enum', enum: ControlSource, default: ControlSource.AUTO, comment: 'Operator mode: AUTO or MANUAL' })
    operator!: ControlSource;

    /** โปรไฟล์ควบคุมที่ใช้งาน (ถ้ามี) */
    @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'robot_control_profile.control_id (optional)' })
    control_id?: string;

    /** สแนปช็อตค่าควบคุมที่ส่งจริงกับงานนี้ (setpoints/limits) */
    @Column({ type: 'json', nullable: true, comment: 'Snapshot of control params (e.g., {maxSpeed, accel})' })
    control_params_json?: object;

    /** เวลาเริ่ม/จบการกระทำ */
    @Column({ type: 'timestamp',  nullable: true, comment: 'Action start time (ms precision)' })
    started_at?: Date;

    @Column({ type: 'timestamp',  nullable: true, comment: 'Action finish time (ms precision)' })
    finished_at?: Date;

    /** ผลลัพธ์สุดท้ายของการกระทำ */
    @Column({ type: 'enum', enum: LogResult, default: LogResult.SUCCESS, comment: 'Final result' })
    result!: LogResult;

    /** จำนวนครั้งที่สั่งซ้ำ */
    @Column({ type: 'int', unsigned: true, default: 0, comment: 'Retry count' })
    retry_count!: number;

    /** มีสิ่งกีดขวางหรือไม่ + เหตุผล */
    @Column({ type: 'tinyint', width: 1, default: 0, comment: 'Blocked by object (0/1)' })
    blocked_flag!: boolean;

    @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Blocking reason (if any)' })
    blocked_reason?: string;

    /** ช่วยรายงาน: เวลาเปิด/ปิดจริง (ms) */
    @Column({ type: 'int', unsigned: true, nullable: true, comment: 'Open duration (ms)' })
    open_duration_ms?: number;

    @Column({ type: 'int', unsigned: true, nullable: true, comment: 'Close duration (ms)' })
    close_duration_ms?: number;

    /** ค่า max speed/accel ที่สังเกตหรือที่ตั้ง (สะดวกทำสรุปต่อรอบงาน) */
    @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true, comment: 'Max speed (m/s) observed or set' })
    speed_max?: string;

    @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true, comment: 'Max acceleration (m/s^2) observed or set' })
    accel_max?: string;

    /** เวลาแทรกแถวนี้ (เพื่อ audit) */
    @Column({ type: 'timestamp',  default: () => "CURRENT_TIMESTAMP" })
    created_at!: Date;
}

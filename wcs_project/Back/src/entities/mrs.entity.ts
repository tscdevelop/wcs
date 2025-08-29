import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Connectivity, Health, Mode } from "../common/global.enum";

@Entity({ name: "mrs" })
export class MRS {
    @PrimaryGeneratedColumn()
    mrs_id: number;

    @Column({ length: 100, nullable: false })
    mrs_code: string;

    /** สถานะการทำงานสั้นๆ เช่น IDLE/RUNNING/ERROR (ตามที่คุณใช้ภายใน) */
    @Column({ length: 100, nullable: false })
    mrs_status: string;

    /** โหมดทำงาน: อัตโนมัติ/แมนนวล/บำรุงรักษา */
    @Column({ type: 'enum', enum: Mode, default: Mode.AUTO, comment: 'Operating mode' })
    mode!: Mode;

    // /** สุขภาพระบบ: OK/WARN/FAULT (ใช้กับ dashboard) */
    // @Column({ type: 'enum', default: 'OK', comment: 'Health status for monitoring' })
    // health_status!: Health;

    // /** โค้ด/ข้อความ fault ล่าสุด (ถ้ามี) */
    // @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Latest fault code' })
    // fault_code?: string;

    /** กลุ่มชั้นวางเคลื่อนที่ที่ “แชร์ราง/คอนโทรลชุดเดียวกัน” เปิดได้ทีละช่องในกลุ่มนั้นเท่านั้น */
    @Column({ type: 'varchar', length: 16, default: 'B1' })
    bank_code!: string;

    @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Latest fault message' })
    fault_msg?: string;

    /** ปุ่มฉุกเฉินถูกกดอยู่หรือไม่ */
    @Column({ type: 'tinyint', width: 1, default: 0, comment: 'Emergency stop active (0/1)' })
    e_stop!: boolean;

    // /** สถานะการสื่อสารกับอุปกรณ์ */
    // @Column({ type: 'enum', default: 'ONLINE', comment: 'Connectivity status' })
    // connectivity!: Connectivity;

    // /** รุ่นเฟิร์มแวร์ */
    // @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Firmware version string' })
    // firmware_version?: string;

    /** งานที่กำลังทำอยู่ (เชื่อมเชิงตรรกะกับ task_mrs) */
    @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Current running task id (logical FK)' })
    current_task_id?: string;

    /** ช่องทางเดินปัจจุบัน */
    @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Current aisle id (logical FK)' })
    current_aisle_id?: string;

    /** ช่องที่กำลังสั่งให้เปิด */
    @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Target aisle id to open (logical FK)' })
    target_aisle_id?: string;

    // /** ตำแหน่งบนราง (มม.) ถ้าอุปกรณ์ส่งมา */
    // @Column({ type: 'int', nullable: true, comment: 'Linear rail position in millimeters' })
    // position_mm?: number;

    // /** อุณหภูมิภายใน (°C) */
    // @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, comment: 'Internal temperature in °C' })
    // temperature_c?: string;

    /** ระดับแบตเตอรี่ (%) */
    @Column({ type: 'tinyint', unsigned: true, nullable: true, comment: 'Battery level 0-100%' })
    battery_level?: number;

     /** พร้อมรับงานหรือไม่ (ใช้วางคิว) */
    @Column({ type: 'tinyint', width: 1, default: 1, comment: 'Available for assignment (0/1)' })
    is_available!: boolean;

    @Column({ type: 'timestamp',  default: () => "CURRENT_TIMESTAMP" })
    last_update: Date;

    @Column({ type: 'timestamp', nullable: true, comment: 'Last heartbeat from device' })
    last_heartbeat_at?: Date;

    /** วันบำรุงรักษาล่าสุด (เพื่อ PM schedule) */
    @Column({ type: 'timestamp', nullable: true, comment: 'Last maintenance datetime' })
    last_maintenance?: Date;

    /** (เลือกใช้) โปรไฟล์ควบคุมแบบ override รายเครื่อง; ถ้าไม่ใช้ให้ลบคอลัมน์นี้ได้ */
    @Column({ type: 'tinyint',  unsigned: true, nullable: false })
    control_id: number;                 //FK m_control

      // ⭐ Session fields
    @Column({ type: 'tinyint', width: 1, default: 0, comment: 'Aisle is currently open in a session (0/1)' })
    is_aisle_open!: boolean;

    @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Aisle id for the open session' })
    open_session_aisle_id?: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Order id bound to the open session (optional)' })
    open_session_order_id?: string | null;

    @Column({ type: 'timestamp', nullable: true, comment: 'Session idle timeout' })
    open_session_expires_at?: Date | null;
}



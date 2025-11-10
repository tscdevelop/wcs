import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { ControlSource, RobotType, TargetScope } from '../common/global.enum';

//ชุดพารามิเตอร์ควบคุมการเคลื่อนที่/ความปลอดภัย เช่น ความเร็วสูงสุด–ต่ำสุด, อัตราเร่ง–หน่วง, เวลารันพ์, โซนช้า/ข้อจำกัดความปลอดภัย ฯลฯ
@Entity({ name: 'robot_control_profile' })
export class robot_control_profile {
    /** รหัสโปรไฟล์ควบคุม (PK) */
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Primary key of control profile' })
    control_id!: string;

    /** ชื่อโปรไฟล์ (เช่น Safe/FastPicking) */
    @Column({ type: 'varchar', length: 50, comment: 'Profile name' })
    profile_name!: string;

    /** ประเภทอุปกรณ์ที่ใช้โปรไฟล์นี้ */
    @Column({ type: 'enum', enum: RobotType, comment: 'Target robot type' })
    robot_type!: RobotType;

    /** ขอบเขตการใช้งาน: ทั้งระบบ / ระบุอุปกรณ์ / ระบุ aisle */
    @Column({ type: 'enum',enum: TargetScope, default: TargetScope.GLOBAL, comment: 'Application scope' })
    target_scope!: TargetScope;

    /** ถ้า BY_DEVICE ให้ระบุ mrs_id/wrs_id; ถ้า BY_AISLE ให้ระบุ aisle_id (เก็บเป็นข้อความยืดหยุ่น) */
    @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Scope reference (device id or aisle id), optional' })
    scope_ref?: string;

    /** ค่า min/max speed (m/s) และ acceleration/deceleration (m/s^2) */
    @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true, comment: 'Minimum speed (m/s)' })
    min_speed?: string;

    @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true, comment: 'Maximum speed (m/s)' })
    max_speed?: string;

    @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true, comment: 'Acceleration (m/s^2)' })
    acceleration?: string;

    @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true, comment: 'Deceleration (m/s^2)' })
    deceleration?: string;

    /** เวลาขึ้น/ลงรอบเร่ง (มิลลิวินาที) */
    @Column({ type: 'int', unsigned: true, nullable: true, comment: 'Ramp-up time (ms)' })
    ramp_up_ms?: number;

    @Column({ type: 'int', unsigned: true, nullable: true, comment: 'Ramp-down time (ms)' })
    ramp_down_ms?: number;

    /** ข้อจำกัดความปลอดภัย/โซนช้า เก็บเป็น JSON เพื่อยืดหยุ่น */
    @Column({ type: 'json', nullable: true, comment: 'Safety limits, slow zones, etc. (JSON)' })
    safety_limits_json?: object;

    /** เวลาบังคับใช้ของโปรไฟล์ */
    @Column({ type: 'timestamp', nullable: true, comment: 'Effective from (nullable = active immediately)' })
    effective_from?: Date;

    @Column({ type: 'timestamp', nullable: true, comment: 'Effective to (nullable = no expiry)' })
    effective_to?: Date;

    /** แหล่งที่มาของการตั้งค่า และผู้ที่ปรับแก้ */
    @Column({ type: 'enum', enum: ControlSource, default: ControlSource.MANUAL, comment: 'Change origin' })
    source!: ControlSource;

    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Who applied/updated this profile' })
    applied_by?: string;

    /** เวอร์ชันของพารามิเตอร์ */
    @Column({ type: 'int', unsigned: true, default: 1, comment: 'Parameter version' })
    param_version!: number;

    /** เวลาอัปเดตล่าสุด */
    @Column({ type: 'timestamp',  default: () => "CURRENT_TIMESTAMP" })
    updated_at!: Date;
}

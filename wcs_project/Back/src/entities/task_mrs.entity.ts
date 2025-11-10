import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { ScanStatus, StatusTasks , TypeInfm} from '../common/global.enum';

/**
 * tasks: งานกลางที่ผู้ใช้ร้องขอ (SKU/จำนวน/priority)
 * - ใช้ควบคุมวงจรงานรวม และเป็นแม่ของงานย่อยฝั่ง MRS (task_mrs)
 * - สำหรับ T1M ให้ตั้ง store_type = 'T1M'
 */
@Entity({ name: 'task_mrs' })
export class TaskMrs {
    /** รหัสงาน (PK) */
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Primary key of task' })
    task_id!: string;
    
    /*รหัสงาน TID-YYYYMMDD-NNN*/
    @Column({ type: 'varchar', length: 32, unique: true })
    task_code: string;

    /** หมายเลข waiting ID (FK → waiting_id) */
    @Column({ type: 'varchar', length: 50, comment: 'Waiting id', nullable: true, default: null})
    waiting_id?: string;

    /** SKU ที่ร้องขอ */
    @Column({ type: 'varchar', length: 100, comment: 'Requested SKU' })
    stock_item!: string;

    /** จำนวนที่ต้องการ */
    @Column({ type: 'int', default: 0, comment: 'Plan Quantity' })
    plan_qty?: number;

    /** จำนวนที่ยิงจริง */
    @Column({ type: 'int', default: 0, comment: 'Actual Quantity' })
    actual_qty?: number;

    /** ลำดับความสำคัญ 1–9 (น้อย→มาก) */
    @Column({ type: 'tinyint', unsigned: true, default: 5, comment: 'Priority 1-9 (low→high)' })
    priority!: number;

    /** ประเภท: Inbound(Receipt) or Outbound(Usage) or Transfer */
    @Column({ type: 'enum', enum:TypeInfm, comment: 'Type of the task' })
    type!: TypeInfm;

    /** สถานะงานรวม */
    @Column({ type: 'enum',enum:StatusTasks ,comment: 'Overall task state'})
    status!: StatusTasks;

    @Column({ type: 'bigint', nullable: true})
    target_aisle_id: string | null;

    @Column({ type: 'varchar', length: 16, nullable: true })
    target_bank_code: string | null;

    /** โค้ด/ข้อความความผิดพลาด (ระดับงานรวม) */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Error code (if failed)' })
    error_code?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Error message (if failed)' })
    error_msg?: string;

    /** ผู้ร้องขอ */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Requester user id/name' })
    requested_by?: string;

    /** เวลารับคำขอ */
    @Column({ type: 'timestamp',  default: () => 'CURRENT_TIMESTAMP', comment: 'Requested at' })
    requested_at!: Date;

    /** เวลาอัปเดตล่าสุดของงาน */
    @Column({  type: 'timestamp',  nullable: true, default: () => null })
    updated_at?: Date;

    /** สถานะที่แสกน */
    @Column({  type: 'enum', enum: ScanStatus , nullable: false, default: ScanStatus.PENDING  })
    actual_status: ScanStatus;

    /** ผู้ร้องขอแสกนของ */
    @Column({ type: 'varchar', length: 50, nullable: true })
    actual_by?: string;

    /** เวลาที่ยิงของ */
    @Column({ type: 'timestamp',  nullable: true, default: () => null})
    actual_at?: Date;

    /** สถานะการคอนเฟิร์ม */
    @Column({ default: false, nullable: false })
    is_confirm: boolean;

    /** เวลาที่กดคอนเฟิร์ม */
    @Column({ type: 'timestamp',  nullable: true, default: () => null})
    confirm_at?: Date;

}
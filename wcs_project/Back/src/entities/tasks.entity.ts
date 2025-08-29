import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { StatusTasks } from '../common/global.enum';

/**
 * tasks: งานกลางที่ผู้ใช้ร้องขอ (SKU/จำนวน/priority)
 * - ใช้ควบคุมวงจรงานรวม และเป็นแม่ของงานย่อยฝั่ง MRS (task_mrs)
 * - สำหรับ T1M ให้ตั้ง store_type = 'T1M'
 */
@Entity({ name: 'tasks' })
export class Task {
    /** รหัสงาน (PK) */
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Primary key of task' })
    task_id!: string;
    
    /*รหัสงาน TID-YYYYMMDD-NNN*/
    @Column({ type: 'varchar', length: 32, unique: true })
    task_code: string;

    /** หมายเลขออเดอร์/ใบคำขอ (ใช้รวม task หลายแถวของ SKU ต่างๆ ให้อยู่ชุดเดียวกัน) */
    @Column({ type: 'varchar', length: 50, comment: 'Order id to group multiple SKU tasks', nullable: true, default: null,insert: false, })
    order_id?: string;

    /** SKU ที่ร้องขอ */
    @Column({ type: 'varchar', length: 100, comment: 'Requested SKU' })
    sku!: string;

    /** จำนวน (ถ้ามี) */
    @Column({ type: 'decimal', precision: 12, scale: 3, nullable: true, comment: 'Quantity (optional)' })
    qty?: string;

    /** ลำดับความสำคัญ 1–9 (น้อย→มาก) */
    @Column({ type: 'tinyint', unsigned: true, default: 5, comment: 'Priority 1-9 (low→high)' })
    priority!: number;

    /** ประเภทคลัง: T1 (WRS) หรือ T1M (MRS) */
    @Column({ type: 'enum', enum: ['T1','T1M'], default: 'T1M', comment: 'Store type of the task' })
    store_type!: 'T1' | 'T1M';

    /** สถานะงานรวม */
    @Column({ type: 'enum',enum:StatusTasks ,comment: 'Overall task state'})
    status!: StatusTasks;

    @Column({ type: 'bigint', nullable: true})
    target_aisle_id: string | null;

    @Column({ type: 'varchar', length: 16, nullable: true })
    target_bank_code: string | null;

    /** ผู้ร้องขอ */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Requester user id/name' })
    requested_by?: string;

    /** เวลารับคำขอ */
    @Column({ type: 'timestamp',  default: () => 'CURRENT_TIMESTAMP', comment: 'Requested at' })
    requested_at!: Date;

    /** โค้ด/ข้อความความผิดพลาด (ระดับงานรวม) */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Error code (if failed)' })
    error_code?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Error message (if failed)' })
    error_msg?: string;

    /** เวลาอัปเดตล่าสุดของงาน */
    @Column({  type: 'timestamp',  default: () => "CURRENT_TIMESTAMP" })
    updated_at!: Date;
}
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { ScanStatus, StatusOrders, TypeInfm } from '../common/global.enum';

/**
 * order tasks: ใช้ควบคุมรายการที่ต้องการทำ task ทั้งหมด รวมทั้ง MRS และ WRS
 */
@Entity({ name: 'orders' })
export class Orders {
    /** รหัสงาน (PK) */
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Primary key of order task' })
    order_id!: string;

    /** ประเภทคลัง: T1 (WRS) หรือ T1M (MRS) */
    @Column({ type: 'enum', enum: ['T1','T1M'], default: 'T1M', comment: 'Store type of the task' })
    store_type!: 'T1' | 'T1M';

    /** ประเภท: Inbound(Receipt) or Outbound(Usage) or Transfer */
    @Column({ type: 'enum', enum:TypeInfm, comment: 'Type of the task' })
    type!: TypeInfm;

    /** สถานะงานที่รอ */
    @Column({ type: 'enum',enum:StatusOrders ,default: StatusOrders.WAITING, comment: 'Overall order task state'})
    status!: StatusOrders;

    /** หมายเลขออเดอร์/ใบคำขอ */
    @Column({ type: 'varchar', length: 50, nullable: true, default: null, comment: 'Order ID to group multiple SKU tasks'})
    work_order?: string;
    
    /** usage_num */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Usage number' })
    usage_num?: string;

    /** line */
    @Column({ type: 'varchar', length: 30, nullable: true, comment: 'Line' })
    line?: string;

    /** SKU ที่ร้องขอ */
    @Column({ type: 'varchar', length: 100, comment: 'Requested SKU' })
    stock_item!: string;

    /** จำนวนที่ต้องการ */
    @Column({ type: 'int', nullable: true, default: null, comment: 'Plan Quantity' })
    plan_qty?: number;
    
    /** จำนวนที่ยิงจริง */
    @Column({ type: 'int', default: 0, comment: 'Actual Quantity' })
    actual_qty?: number;

    /** จำนวน cat */
    @Column({ type: 'int', nullable: true, default: null, comment: 'Cat Quantity' })
    cat_qty?: number;

    /** จำนวน recond */
    @Column({ type: 'int', nullable: true, default: null, comment: 'Recond Quantity' })
    recond_qty?: number;

    /** จากตำแหน่ง MRS (ชื่อรางเคลื่อนที่) mock*/
    @Column({ type: 'varchar', length: 100, nullable: true, comment: 'From location' })
    from_location?: string;

    /** มีเฉพาะ usage และ transfer */
    @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Source location' })
    source_loc?: string;

    /** มีเฉพาะ usage และ transfer */
    @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Source box location' })
    source_box_loc?: string;

    /** มีเฉพาะ receipt และ transfer */
    @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Destination location' })
    dest_loc?: string;

    /** มีเฉพาะ receipt และ transfer */
    @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Destination box location' })
    dest_box_loc?: string;

    /** ประเภทการใช้งาน เช่น ISSUE (Usage) */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Usage type (e.g. ISSUE)' })
    usage_type?: string;

    /** สภาพสินค้า เช่น NEW หรือ CAPITAL */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Item condition (NEW / CAPITAL)' })
    cond?: string;

    /** split flag (0 = no split) */
    @Column({ type: 'tinyint', default: 0, comment: 'Split flag (0 = no split, 1 = split)' })
    split?: number;
    
    /** ราคาต่อหน่วย (Unit Cost) */
    @Column({
        type: 'decimal',
        precision: 15, // รวมจำนวนหลักทั้งหมด เช่น 999,999,999,999.99
        scale: 2,      // จำนวนหลักทศนิยม (2 = เก็บทศนิยม 2 ตำแหน่ง)
        default: 0,
        comment: 'Unit Cost (Materials to be handled)',
        transformer: {
            // optional — เพื่อให้เวลาดึงจาก DB กลับมาเป็น number (ไม่ใช่ string)
            to: (value: number) => value,
            from: (value: string | null) => (value ? parseFloat(value) : 0),
        },
    })
    unit_cost_handled?: number;

    /** ราคาต่อหน่วย (Unit Cost) */
    @Column({
        type: 'decimal',
        precision: 15, // รวมจำนวนหลักทั้งหมด เช่น 999,999,999,999.99
        scale: 2,      // จำนวนหลักทศนิยม (2 = เก็บทศนิยม 2 ตำแหน่ง)
        default: 0,
        comment: 'Total Cost (Materials to be handled)',
        transformer: {
            // optional — เพื่อให้เวลาดึงจาก DB กลับมาเป็น number (ไม่ใช่ string)
            to: (value: number) => value,
            from: (value: string | null) => (value ? parseFloat(value) : 0),
        },
    })
    total_cost_handled?: number;

    /** เลขติดต่อ */
    @Column({ type: 'varchar', length: 20, nullable: true, comment: 'Contract Number' })
    contract_num?: string;

    /** PO Number */
    @Column({ type: 'varchar', length: 30, nullable: true, comment: 'PO Number' })
    po_num?: string;

    /** Object ID */
    @Column({ type: 'varchar', length: 20, nullable: true, comment: 'Object ID' })
    object_id?: string;

    /** ผู้ร้องขอ */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Requester user id/name' })
    requested_by?: string;

    /** เวลารับคำขอ */
    @Column({ type: 'timestamp',  default: () => 'CURRENT_TIMESTAMP', comment: 'Requested at' })
    requested_at!: Date;

    /** เวลาอัปเดตล่าสุดของงาน ตาม log*/
    @Column({  type: 'timestamp',  nullable: true, default: () => null })
    updated_at?: Date;

    /** สถานะที่แสกน */
    @Column({  type: 'enum', enum: ScanStatus , nullable: false, default: ScanStatus.PENDING  })
    actual_status: ScanStatus;

    /** ผู้ร้องขอแสกนของ */
    @Column({ type: 'varchar', length: 50, nullable: true })
    actual_by?: string;

    /** เวลาเสร็จออเดอร์ = ตอนยิงของ */
    @Column({ type: 'timestamp',  nullable: true, default: () => null, comment: 'Finished date' })
    finished_at?: Date;

    /** สถานะการคอนเฟิร์ม */
    @Column({ default: false, nullable: false })
    is_confirm: boolean;

    /** เวลาที่เริ่มทำออเดอร์ */
    @Column({ type: 'timestamp',  nullable: true, default: () => null})
    started_at?: Date;

    /** เวลาที่เข้าคิว */
    @Column({ type: 'timestamp',  nullable: true, default: () => null})
    queued_at?: Date;

    /** ลำดับความสำคัญ 1–9 (น้อย→มาก) */
    @Column({ type: 'tinyint', unsigned: true, default: 5, comment: 'Priority 1-9 (low→high)' })
    priority!: number;

    /** โค้ด/ข้อความความผิดพลาด (ระดับงานรวม) */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Error code (if failed)' })
    error_code?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Error message (if failed)' })
    error_msg?: string;

}
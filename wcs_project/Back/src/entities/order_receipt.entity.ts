import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * order list: ใช้เก็บข้อมูล order receipt
 */
@Entity({ name: 'orders_receipt' })
export class OrdersReceipt {
    /** รหัสงาน (PK) */
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true, comment: 'Primary key of order receipt' })
    receipt_id!: number;

    /** FK เชื่อมกับ Orders */
    @Column({ type: 'int', unsigned: true })
    order_id!: number;

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
    unit_cost_handled: number;

    /** เลขติดต่อ */
    @Column({ type: 'varchar', length: 20, nullable: true, comment: 'Contract Number' })
    contract_num?: string;

    /** PO Number */
    @Column({ type: 'varchar', length: 30, nullable: true, comment: 'PO Number' })
    po_num?: string;

    /** Object ID */
    @Column({ type: 'varchar', length: 20, nullable: true, comment: 'Object ID' })
    object_id?: string;

}
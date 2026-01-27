import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * order list: ใช้เก็บข้อมูล order transfer
 */
@Entity({ name: 'orders_transfer' })
export class OrdersTransfer {
    /** รหัสงาน (PK) */
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true, comment: 'Primary key of order transfer' })
    transfer_id!: number;

    /** FK เชื่อมกับ Orders */
    @Column({ type: 'int', unsigned: true })
    order_id!: number;

    /** ไอดี location (Fk) โดยเก็บ location ต้นทาง และ loc_id ใน Orders คือเก็บปลายทาง*/
    @Column({ type: 'int', unsigned: true })
    from_loc_id: number;

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
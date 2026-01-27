import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * order list: ใช้เก็บข้อมูล order return อ้างอิง usage ด้วย
 */
@Entity({ name: 'orders_return' })
export class OrdersReturn {
    /** รหัสงาน (PK) */
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Primary key of order return' })
    return_id!: string;

    /** FK เชื่อมกับ Orders */
    @Column({ type: 'bigint', unsigned: true })
    order_id!: string;

    /** FK inventory_trx id ที่เป็น USAGE : RETURN order คืนจาก USAGE ไหน*/
    @Column({ type: 'bigint', unsigned: true })
    usage_trx_id!: string;

    /** FK inventory */
    @Column({ type: 'bigint', unsigned: true })
    inv_id!: string;

    /** FK Usage (ของที่เคยเบิก) */
    @Column({ type: 'bigint', unsigned: true })
    usage_id!: string;

    // /** หมายเลขออเดอร์/ใบคำขอ */
    // @Column({ type: 'varchar', length: 50, nullable: true, default: null, comment: 'Order ID to group multiple SKU tasks'})
    // work_order?: string;
    
    // /** return_num */
    // @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Usage number(No.)' })
    // return_num?: string;

    // /** line */
    // @Column({ type: 'varchar', length: 30, nullable: true, comment: 'Usage Line' })
    // return_line?: string;

    // /** เหตุผลการคืน */
    // @Column({ type: 'varchar', length: 100, nullable: true })
    // return_reason?: string;
}
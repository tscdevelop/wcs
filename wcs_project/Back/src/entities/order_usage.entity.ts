import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * order list: ใช้เก็บข้อมูล order usage
 */
@Entity({ name: 'orders_usage' })
export class OrdersUsage {
    /** รหัสงาน (PK) */
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Primary key of order usage' })
    usage_id!: string;

    /** FK เชื่อมกับ Orders */
    @Column({ type: 'bigint', unsigned: true })
    order_id!: string;

    /** หมายเลขออเดอร์/ใบคำขอ */
    @Column({ type: 'varchar', length: 50, nullable: true, default: null, comment: 'Order ID to group multiple SKU tasks'})
    work_order?: string;
    
    /** usage_num */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Usage number' })
    usage_num?: string;

    /** line */
    @Column({ type: 'varchar', length: 30, nullable: true, comment: 'Line' })
    line?: string;

    /** ประเภทการใช้งาน เช่น ISSUE (Usage) */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Usage type (e.g. ISSUE)' })
    usage_type?: string;

    /** split flag (0 = no split) */
    @Column({ type: 'tinyint', default: 0, comment: 'Split flag (0 = no split, 1 = split)' })
    split?: number;
}
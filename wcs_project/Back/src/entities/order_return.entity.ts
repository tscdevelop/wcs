import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * order return: ใช้เก็บข้อมูล order return อ้างอิง usage ด้วย
 */
@Entity({ name: 'orders_return' })
export class OrdersReturn {
    /** รหัสงาน (PK) */
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true, comment: 'Primary key of order return' })
    return_id!: number;

    /** FK เชื่อมกับ Orders */
    @Column({ type: 'int', nullable: true })
    order_id?: number;

    /** FK orders_usage (ของที่เคยเบิก) */
    @Column({ type: 'int', nullable: true })
    usage_id?: number;

}
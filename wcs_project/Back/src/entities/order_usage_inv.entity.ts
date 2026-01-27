import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * order list: ใช้เก็บข้อมูล order return อ้างอิง usage ด้วย
 */
@Entity({ name: 'usage_inventory' })
export class UsageInventory {
    /** รหัสงาน (PK) */
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true, comment: 'Primary key of order return' })
    usage_inv_id: number;

    /** FK Usage */
    @Column({ type: 'int', nullable: true })
    usage_id?: number;

    /** FK Inventory */
    @Column({ type: 'int', nullable: true })
    inv_id?: number;

    /** จำนวนเบิกย่อย */
    @Column({ type: 'int', nullable: true, default: 0 })
    usage_qty?: number;

}
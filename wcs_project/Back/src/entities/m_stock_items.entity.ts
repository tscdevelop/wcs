import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * master table เก็บข้อมูล items ทุกตัว
 */
@Entity({ name: 'm_stock_items' })
export class StockItems {
    /** รหัสงาน (PK) */
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Stock items' })
    item_id!: string;

    /** รหัส material */
    @Column({ type: 'varchar', length: 100, comment: 'Requested material(SKU)' })
    stock_item!: string;

    /** ชื่อ material */
    @Column({ type: 'varchar', length: 50, nullable: true, default: null, comment: 'ชื่อ item'})
    item_name?: string;

    /** คำอธิบายสินค้า */
    @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Item description' })
    item_desc?: string; 
    
    @Column({ length: 255, nullable: true })
    item_img: string;                   // รูปเครื่องมือ

    @Column({ length: 500, nullable: true })
    item_img_url: string;               // url เครื่องมือ

    @Column({ nullable: false, default: true })
    is_active: boolean;

    /** ผู้ร้องขอ */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Requester user id/name' })
    requested_by?: string;

    /** เวลารับคำขอ */
    @Column({ type: 'timestamp',  default: () => 'CURRENT_TIMESTAMP', comment: 'Requested at' })
    requested_at!: Date;

    @Column({ length: 30, nullable: true })
    update_by: string;

}
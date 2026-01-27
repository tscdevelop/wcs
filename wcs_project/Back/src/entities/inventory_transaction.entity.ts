import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * inventory transaction table เก็บประวัติรายการสินค้าที่เกิดขึ้นจริง
 */
@Entity({ name: 'inventory_trx' })
export class InventoryTrx {

    /** ไอดี inventory (PK) */
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true, comment: 'Inventory Transaction ID' })
    trx_id!: number;

    /** ไอดี inventory (Fk) */
    @Column({ type: 'int', unsigned: true })
    inv_id!: number;

    /** ไอดี order (Fk) */
    @Column({ type: 'int', unsigned: true })
    order_id!: number;

    /** ประเภท transaction*/
    @Column({ type: 'varchar', length: 30, nullable: true, comment: 'RECEIPT | USAGE | TRANSFER' })
    order_type: string;

    /** ไอดี stock item (Fk) */
    @Column({ type: 'int', unsigned: true })
    item_id!: number;

    @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Requested material(SKU)' })
    stock_item: string;

    /** ไอดี location และ box (FK) */
    @Column({ type: 'int', unsigned: true })
    loc_id!: number;

    /** location */
    @Column({ type: 'varchar', length: 100, nullable: true, default: null, comment: 'location' })
    loc: string;

    /** box location */
    @Column({ type: 'varchar', length: 100, nullable: true, default: null, comment: 'box location' })
    box_loc: string;

    /** จำนวนใน inventory transaction */
    @Column({ type: 'int', nullable: true, default: 0, comment: 'Inventory Transaction Quantity' })
    qty!: number;

    /** ราคาต่อหน่วย (Unit Cost) */
    @Column({
        type: 'decimal',
        precision: 15, // รวมจำนวนหลักทั้งหมด เช่น 999,999,999,999.99
        scale: 2,      // จำนวนหลักทศนิยม (2 = เก็บทศนิยม 2 ตำแหน่ง)
        default: 0,
        comment: 'Unit Cost (Materials in Inventory Transaction)',
        transformer: {
            // optional — เพื่อให้เวลาดึงจาก DB กลับมาเป็น number (ไม่ใช่ string)
            to: (value: number) => value,
            from: (value: string | null) => (value ? parseFloat(value) : 0),
        },
    })
    unit_cost: number;

    /** ราคาต่อหน่วย (Unit Cost) */
    @Column({
        type: 'decimal',
        precision: 15, // รวมจำนวนหลักทั้งหมด เช่น 999,999,999,999.99
        scale: 2,      // จำนวนหลักทศนิยม (2 = เก็บทศนิยม 2 ตำแหน่ง)
        default: 0,
        comment: 'Total Cost (Materials in Inventory Transaction)',
        transformer: {
            // optional — เพื่อให้เวลาดึงจาก DB กลับมาเป็น number (ไม่ใช่ string)
            to: (value: number) => value,
            from: (value: string | null) => (value ? parseFloat(value) : 0),
        },
    })
    total_cost: number;

    /** created_at */
    @Column({ type: 'timestamp',  default: () => 'CURRENT_TIMESTAMP', comment: 'Created Date' })
    created_at!: Date;

}
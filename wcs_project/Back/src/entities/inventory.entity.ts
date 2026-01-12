import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * inventory table เก็บรายการและจำนวนสินค้าที่มีอยู่ โดยแต่ละ stock item สามารถมีหลาย location ได้
 */
@Entity({ name: 'inventory' })
export class Inventory {
    /** ไอดี inventory (PK) */
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Inventory ID' })
    inv_id!: string;

    /** ไอดี stock item (Fk) */
    @Column({ type: 'bigint', unsigned: true })
    item_id!: string;

    /** ไอดี location และ box (FK) */
    @Column({ type: 'bigint', unsigned: true })
    loc_id!: string;

        /** ราคาต่อหน่วย (Unit Cost) */
    @Column({
        type: 'decimal',
        precision: 15, // รวมจำนวนหลักทั้งหมด เช่น 999,999,999,999.99
        scale: 2,      // จำนวนหลักทศนิยม (2 = เก็บทศนิยม 2 ตำแหน่ง)
        default: 0,
        comment: 'Unit Cost (Materials in Inventory)',
        transformer: {
            // optional — เพื่อให้เวลาดึงจาก DB กลับมาเป็น number (ไม่ใช่ string)
            to: (value: number) => value,
            from: (value: string | null) => (value ? parseFloat(value) : 0),
        },
    })
    unit_cost_inv: number;

    /** ราคาต่อหน่วย (Unit Cost) */
    @Column({
        type: 'decimal',
        precision: 15, // รวมจำนวนหลักทั้งหมด เช่น 999,999,999,999.99
        scale: 2,      // จำนวนหลักทศนิยม (2 = เก็บทศนิยม 2 ตำแหน่ง)
        default: 0,
        comment: 'Total Cost (Materials in Inventory)',
        transformer: {
            // optional — เพื่อให้เวลาดึงจาก DB กลับมาเป็น number (ไม่ใช่ string)
            to: (value: number) => value,
            from: (value: string | null) => (value ? parseFloat(value) : 0),
        },
    })
    total_cost_inv: number;

    /** ORG ID */
    @Column({ type: 'varchar', length: 20, nullable: true, default: null, comment: 'ORG ID'})
    org_id?: string;
    
    /** จำนวนใน inventory */
    @Column({ type: 'int', nullable: true, default: 0, comment: 'Inventory Quantity' })
    inv_qty!: number;

    /** stock_status */
    @Column({ nullable: false, default: true })
    is_active: boolean;

    /** updated_at */
    @Column({ type: 'timestamp',  default: () => 'CURRENT_TIMESTAMP', comment: 'Requested at' })
    updated_at!: Date;

}
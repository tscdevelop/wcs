import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { StatusOrders, TaskReason, TaskSource, TaskSubsystem, TypeInfm } from "../common/global.enum";

@Entity({ name: 'orders_log' })
export class OrdersLog {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: string;

    @Column({ type: 'bigint', unsigned: true })
    order_id!: string;

    /** ประเภท: Inbound(Receipt) or Outbound(Usage) or Transfer */
    @Column({ type: 'enum', enum: TypeInfm, comment: 'Type of the task' })
    type!: TypeInfm;

    /** ไอดี stock item (Fk) */
    @Column({ type: 'bigint', unsigned: true })
    item_id!: string | null;
    
    @Column({ type: 'varchar', length: 100, comment: 'Requested material(SKU)' })
    stock_item!: string | null;

    /** ชื่อ material */
    @Column({ type: 'varchar', length: 50, nullable: true, default: null, comment: 'ชื่อ item'})
    item_name?: string | null;

    /** คำอธิบายสินค้า */
    @Column({ type: 'varchar', length: 255, nullable: true, default: null, comment: 'Item description' })
    item_desc?: string | null;

    /** ไอดี location (Fk) */
    @Column({ type: 'bigint', unsigned: true })
    loc_id: string | null;

    /** location */
    @Column({ type: 'varchar', length: 100, nullable: true, default: null, comment: 'location' })
    loc?: string | null;

    /** box location */
    @Column({ type: 'varchar', length: 100, nullable: true, default: null, comment: 'box location' })
    box_loc?: string | null;

    /** สภาพสินค้า เช่น NEW หรือ CAPITAL */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Item condition (NEW / CAPITAL)' })
    cond?: string | null;

    /** จำนวนที่ต้องการ */
    @Column({ type: 'int', default: 0, comment: 'Plan Quantity' })
    plan_qty!: number;

    /** จำนวนที่ยิงจริง */
    @Column({ type: 'int', default: 0, comment: 'Actual Quantity' })
    actual_qty!: number;

    @Column({ type: 'enum', enum: StatusOrders, nullable: true, default: null })
    status?: StatusOrders | null;

    /** สถานะการคอนเฟิร์ม */
    @Column({ default: false })
    is_confirm!: boolean;

    @Column({ type: 'varchar', length: 50, nullable: true, default: null })
    actor?: string | null; // admin / SYSTEM / AUTO

    @Column({ type: 'varchar', length: 50, nullable: true, default: null })
    source?: TaskSource | null; // API / DISPATCHER / GATEWAY

    @Column({ type: 'varchar', length: 20, nullable: true, default: null })
    subsystem?: TaskSubsystem | null; // ซับซิสเต็มที่ทำให้เกิดเหตุการณ์

    @Column({ type: 'varchar', length: 50, nullable: true, default: null })
    reason_code?: TaskReason | null; // BANK_BUSY, PREEMPT, SENSOR_BLOCKED, ...

    @Column({ type: 'json', nullable: true, default: null })
    meta_json!: any;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;
}

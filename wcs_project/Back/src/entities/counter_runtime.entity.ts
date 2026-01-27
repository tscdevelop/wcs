import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

//ใข้ตอน scan ส่ง
@Entity({ name: 'counter_runtime' })
export class CounterRuntime {
    
    @PrimaryColumn({ type: 'int', unsigned: true })
    counter_id!: number;

    @Column({ type: "int", nullable: true })
    order_id: number | null;

    @Column({ default: 0 })
    actual_qty!: number;

    @UpdateDateColumn()
    updated_at!: Date;
}

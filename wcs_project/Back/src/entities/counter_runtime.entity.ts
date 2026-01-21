import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

//ใข้ตอน scan ส่ง
@Entity({ name: 'counter_runtime' })
export class CounterRuntime {
    
    @PrimaryColumn()
    counter_id!: number;

    @Column()
    order_id!: number;

    @Column({ default: 0 })
    actual_qty!: number;

    @UpdateDateColumn()
    updated_at!: Date;
}

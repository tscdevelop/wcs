import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'counter' })
export class Counter {

    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    counter_id!: string;

    @Column({ type: 'varchar', length: 32 })
    code!: string;

    /** Empty / WAITING_AMR / READY_TO_PICK / ERROR */
    @Column({ type: 'enum', enum: ['EMPTY','WAITING_AMR','READY_TO_PICK','ERROR'] })
    status!: string;

    /** สีของ execution group ที่ lock counter นี้ */
    @Column({ type: 'varchar', length: 20, nullable: true })
    group_color?: string;

    @Column({ type: 'varchar', length: 7, nullable: true })
    light_color_hex?: string;

    @Column({ type: 'enum', enum: ['OFF','ON','BLINK'] })
    light_mode!: string;

    @Column({ default: false })
    gate_open!: boolean;

    @Column({ type: 'bigint', unsigned: true, nullable: true })
    current_order_id?: string;

    @Column({ type: 'bigint', unsigned: true, nullable: true })
    current_wrs_id?: string;

    @Column({ type: 'timestamp', nullable: true })
    last_event_at?: Date;
}

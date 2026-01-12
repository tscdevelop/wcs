import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * execution_group_id
 */
@Entity({ name: 'execution_group' })
export class ExecutionGroup {

    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    execution_group_id!: string;

    /** WAITING / RUNNING / FINISHED */
    @Column({ type: 'varchar', length: 20 })
    status!: string;

    /** สีของกลุ่ม (ไม่ซ้ำกับ group ที่ RUNNING อื่น) */
    @Column({ type: 'varchar', length: 20, nullable: true })
    counter_color?: string;

    /** จำนวน order ทั้งหมดใน group */
    @Column({ type: 'int', default: 0 })
    total_orders!: number;

    /** จำนวน order ที่ทำเสร็จแล้ว */
    @Column({ type: 'int', default: 0 })
    finished_orders!: number;

    @Column({ type: 'timestamp', nullable: true })
    started_at?: Date;

    @Column({ type: 'timestamp', nullable: true })
    finished_at?: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;
}

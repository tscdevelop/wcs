import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { ControlSource } from '../common/global.enum';

/**
 * WRS_log/AMR_log: ใช้เก็บประวัติการทำงานของหุ่นยนต์
 */
@Entity({ name: 'wrs_log' })
export class WrsLog {

    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    log_wrs_id!: string;

    @Column({ type: 'bigint', unsigned: true })
    wrs_id!: string;

    @Column({ type: 'bigint', unsigned: true, nullable: true })
    order_id?: string;

    /** เช่น Idle → Delivering */
    @Column({ type: 'varchar', length: 30 })
    status!: string;

    /** ผู้ควบคุม: AUTO/Manual */
    @Column({ type: 'enum', enum:ControlSource, default: ControlSource.AUTO, comment: 'Operator mode: AUTO/MANUAL' })
    operator!: ControlSource;

    /** event จาก RCS หรือ WCS */
    @Column({ type: 'varchar', length: 100 })
    event!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    message?: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;
}

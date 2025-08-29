import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { StatusTasks, TaskReason, TaskSource, TaskSubsystem } from "../common/global.enum";

// entities/tasks_history.entity.ts
@Entity({ name: 'tasks_history' })
export class TaskHistory {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: string;

    @Column({ type: 'bigint', unsigned: true })
    task_id!: string;

    @Column({ type: 'enum', enum: ['T1', 'T1M'], default: 'T1M' })
    store_type!: 'T1' | 'T1M';

    @Column({ type: 'varchar', length: 64 })
    event!: string; // TASK_CREATED, TASK_ROUTING, TASK_EXECUTING, TASK_WAIT_CONFIRM, QUEUED, SENSOR_BLOCKED, ...

    @Column({ type: 'enum', enum: StatusTasks, nullable: true })
    prev_status?: StatusTasks | null;

    @Column({ type: 'enum', enum: StatusTasks, nullable: true })
    new_status?: StatusTasks | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    actor?: string | null; // admin / SYSTEM / AUTO

    @Column({ type: 'varchar', length: 50, nullable: true })
    source?: TaskSource | null; // API / DISPATCHER / GATEWAY

    @Column({ type: 'varchar', length: 20, nullable: true })
    subsystem?: TaskSubsystem | null;

    @Column({ type: 'bigint', unsigned: true, nullable: true })
    mrs_id?: string | null;

    @Column({ type: 'bigint', unsigned: true, nullable: true })
    aisle_id?: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    reason_code?: TaskReason | null; // BANK_BUSY, PREEMPT, SENSOR_BLOCKED, ...

    @Column({ type: 'json', nullable: true })
    meta_json?: any;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;
}
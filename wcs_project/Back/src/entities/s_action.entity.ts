import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "s_action" })
export class s_action {
    @PrimaryColumn({ length: 20 })
    action_code: string;

    @Column({ length: 30, nullable: false })
    action_name: string;

    @Column({ length: 255, nullable: true })
    action_description: string;

    @Column({ nullable: false, default: true })
    action_is_active: boolean;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;

    @Column({ length: 30, nullable: false })
    create_by: string;

    @Column({ type: 'timestamp', nullable: true, default: () => null })
    update_date: Date;

    @Column({ length: 30, nullable: true })
    update_by: string;

}

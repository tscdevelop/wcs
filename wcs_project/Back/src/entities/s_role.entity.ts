import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "s_role" })
export class s_role {
    @PrimaryColumn({ length: 20 })
    role_code: string;

    @Column({ length: 30, nullable: false })
    role_name: string;

    @Column({ length: 255, nullable: true })
    role_description: string;

    @Column({ nullable: false, default: true })
    role_is_active: boolean;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;

    @Column({ length: 30, nullable: false })
    create_by: string;

    @Column({ type: 'timestamp', nullable: true, default: () => null })
    update_date: Date;

    @Column({ length: 30, nullable: true })
    update_by: string;

}

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "s_role_permis_menu" })
export class s_role_permis_menu {
    @PrimaryGeneratedColumn()
    rpm_id: number;

    @Column({ length: 10 })
    role_code: string; // FK -> s_role

    @Column()
    menu_id: number; // FK -> s_menu
}

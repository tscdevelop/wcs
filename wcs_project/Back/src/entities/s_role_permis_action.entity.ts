import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "s_role_permis_action" })
export class s_role_permis_action {
    @PrimaryGeneratedColumn()  
    rpa_id: number;

    @Column() 
    rpm_id: number; // FK -> s_role_permis_menu

    @Column({ length: 20 })
    action_code: string; // FK -> s_action
}

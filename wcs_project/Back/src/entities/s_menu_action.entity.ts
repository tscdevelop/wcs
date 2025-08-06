import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "s_menu_action" })
export class s_menu_action {
    @PrimaryGeneratedColumn()
    menuact_id: number;

    @Column()
    menu_id: number;    // FK -> s_menu

    @Column({ length: 20 })
    action_code: string; // FK -> s_action
}

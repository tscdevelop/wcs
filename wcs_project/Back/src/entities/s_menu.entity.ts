import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "s_menu" })
export class s_menu {
    @PrimaryGeneratedColumn()
    menu_id: number;

    @Column({ length: 10, nullable: true }) // 01-001
    menu_seq: string;

    @Column({ length: 100, nullable: false })
    menu_name: string;

    @Column({ length: 100, nullable: true })
    menu_name_desc: string;

    @Column({ nullable: true })
    parent_menu_id: number;   // FK -> s_menu.menu_id ถ้ามีเมนูหลัก ให้เอา menu_id มาใส่

    @Column({ nullable: false, default: true })
    menu_is_active: boolean;

    @Column({ default: 1, nullable: false })
    menu_level: number;

    @Column({ length: 255, nullable: true })
    menu_route: string;

    @Column({ length: 50, nullable: true })
    menu_key: string;

    @Column({ length: 50, nullable: true })
    menu_icon: string; 

    @Column({ length: 255, nullable: true })
    menu_component: string;
}

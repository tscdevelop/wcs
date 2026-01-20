import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";

@Entity({ name: "s_user" })
export class s_user {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({ length: 30, nullable: false })
    username: string;

    @Column({ length: 80, nullable: false })
    password: string;

    @Column({ length: 10, nullable: true })
    role_code: string; // FK -> s_role

    @Column({ length: 255, nullable: false })
    user_first_name: string;         // ชื่อ

    @Column({ length: 255, nullable: true })
    user_last_name: string;          // นามสกุล

    @Column({ length: 100, nullable: true })
    user_email: string;                  // Email

    @Column({ type: 'varchar', length: 7, nullable: true })
    user_color_hex?: string;        // เก็บสีของ user ตามที่ฟิก

    @Column({ nullable: false, default: true })
    is_active: boolean;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    create_date: Date;

    @Column({ length: 30, nullable: false })
    create_by: string;

    @Column({ type: 'timestamp', nullable: true, default: () => null })
    update_date: Date;

    @Column({ length: 30, nullable: true })
    update_by: string;

}
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "mrs_aisle" })
export class MRS_AISLE {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Primary key of MRS' })
    id: string;

    /** ไอดี mrs (FK) */
    @Column({ type: 'bigint', unsigned: true })
    mrs_id!: string;

    /** ไอดี aisle (FK) */
    @Column({ type: 'bigint', unsigned: true })
    aisle_id!: string;
}
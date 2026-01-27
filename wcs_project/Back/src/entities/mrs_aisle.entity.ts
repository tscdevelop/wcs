import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "mrs_aisle" })
export class MRS_AISLE {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true, comment: 'Primary key of MRS' })
    id: number;

    /** ไอดี mrs (FK) */
    @Column({ type: 'int', unsigned: true })
    mrs_id!: number;

    /** ไอดี aisle (FK) */
    @Column({ type: 'int', unsigned: true })
    aisle_id!: number;
}
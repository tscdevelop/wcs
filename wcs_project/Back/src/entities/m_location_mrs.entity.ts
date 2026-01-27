import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * m_location_mrs table เก็บ location และ mrs
 */
@Entity({ name: 'm_location_mrs' })
export class LocationsMrs {

    /** PK ของ mapping */
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;
    
    /** ไอดี location (FK) */
    @Column({ type: 'bigint', unsigned: true, comment: 'Location ID' })
    loc_id: string;

    /** ไอดี mrs (Fk) */
    @Column({ type: 'bigint', unsigned: true })
    mrs_id: string;

}
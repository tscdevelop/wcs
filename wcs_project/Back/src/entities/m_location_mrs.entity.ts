import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * m_location_mrs table เก็บ location และ mrs
 */
@Entity({ name: 'm_location_mrs' })
export class LocationsMrs {

    /** PK ของ mapping */
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id: number;
    
    /** ไอดี location (FK) */
    @Column({ type: 'int', unsigned: true, comment: 'Location ID' })
    loc_id: number;

    /** ไอดี mrs (Fk) */
    @Column({ type: 'int', unsigned: true })
    mrs_id: number;

}
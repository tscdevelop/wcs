import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * m_location_wrs table เก็บ location และ wrs/amr
 */
@Entity({ name: 'm_location_wrs' })
export class LocationsWrs {

    /** PK ของ mapping */
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;
    
    /** ไอดี location (FK) */
    @Column({ type: 'bigint', unsigned: true, comment: 'Location ID' })
    loc_id: string;

    /** ไอดี wrs (Fk) */
    @Column({ type: 'bigint', unsigned: true })
    wrs_id: string;

     /** รหัส node / waypoint ที่ robot เข้าใจ */
    @Column({ type: 'varchar', length: 50, comment: 'Robot node / waypoint code' })
    node_code: string;

    /** จุดจอด / pose */
    @Column({ type: 'varchar', length: 50, nullable: true })
    approach_pose?: string;
}

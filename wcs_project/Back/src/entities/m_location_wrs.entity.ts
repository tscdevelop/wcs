import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * m_location_wrs table เก็บ location และ wrs/amr
 */
@Entity({ name: 'm_location_wrs' })
export class LocationsWrs {

    /** PK ของ mapping */
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id: number;
    
    /** ไอดี location (FK) */
    @Column({ type: 'int', unsigned: true, comment: 'Location ID' })
    loc_id: number;

    /** ไอดี wrs (Fk) */
    @Column({ type: 'int', unsigned: true })
    wrs_id: number;

     /** รหัส node / waypoint ที่ robot เข้าใจ */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Robot node / waypoint code' })
    node_code: string;

    /** จุดจอด / pose */
    @Column({ type: 'varchar', length: 50, nullable: true })
    approach_pose?: string;
}

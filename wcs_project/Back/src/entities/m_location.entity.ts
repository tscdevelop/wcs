import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * m_location table เก็บ location และ box
 */
@Entity({ name: 'm_location' })
export class Locations {
    /** ไอดี location (PK) */
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Location ID' })
    loc_id!: string;

    /** ประเภทคลัง: T1 (WRS) หรือ T1M (MRS) หรือ AGMB*/
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Store type of the stock item location' })
    store_type: string;

    /** เก็บ location */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Location(Source/Destination Location)' })
    loc: string; 

    /** เก็บ location box */
    @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Bin Location(Source/Destination Box)' })
    box_loc: string; 

}
// import { Entity, PrimaryGeneratedColumn, Column, Index, PrimaryColumn } from 'typeorm';
// import { AisleStatus } from '../common/global.enum';

// /**
//  * product: รายละเอียด sku
//  */
// @Entity({ name: 'product' })
// export class product {

//     // @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Primary key of aisle' })
//     // sku_id: string;

//     /** รหัสsku*/
//     @PrimaryColumn({ type: 'varchar', length: 20, comment: 'Aisle code, e.g., A/B/C' })
//     sku_code: string;

//     /** name */
//     @Column({ type: 'varchar', length: 20, nullable: true, comment: 'Sku name' })
//     sku_name: string;

// }
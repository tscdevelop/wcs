// import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
// import { Connectivity, Health, Mode } from '../common/global.enum';

// /**
//  * wrs: ทะเบียนหุ่นยนต์/รถ AGV ในคลัง T1
//  * ใช้ดูความพร้อม/ออนไลน์/ตำแหน่งคร่าว/งานที่กำลังทำ/ระดับแบต/ปุ่ม E-Stop
//  */
// @Entity({ name: 'wrs' })
// export class wrs {
//     @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: 'Primary key of WRS robot' })
//     wrs_id!: string;

//     @Column({ type: 'varchar', length: 100, comment: 'Human readable robot name/code' })
//     name!: string;

//     @Column({ type: 'varchar', length: 32, default: 'IDLE', comment: 'Runtime status label (IDLE/RUNNING/ERROR/...)' })
//     status!: string;

//     @Column({ type: 'enum', default: Mode.AUTO, enum:Mode ,comment: 'Operating mode' })
//     mode!: Mode;

//     @Column({ type: 'enum', default: Health.OK, enum: Health, comment: 'Health status' })
//     health_status!: Health;

//     @Column({ type: 'tinyint', width: 1, default: 0, comment: 'Emergency stop active (0/1)' })
//     e_stop!: boolean;

//     @Column({ type: 'enum', default: Connectivity.ONLINE , enum:Connectivity, comment: 'Connectivity status' })
//     connectivity!: Connectivity;

//     @Column({ type: 'varchar', length: 50, nullable: true, comment: 'Firmware version' })
//     firmware_version?: string;

//     /** ตำแหน่ง/จุดจอดปัจจุบันแบบตรรกะ (ที่ระดับระบบรู้จัก) */
//     @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Current logical location id (pod/bin/area)' })
//     current_location_id?: string;

//     /** งานที่กำลังทำ (logical FK) */
//     @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Current running task id (logical)' })
//     current_task_id?: string;

//     /** ระดับแบตเตอรี่ (%) */
//     @Column({ type: 'tinyint', unsigned: true, nullable: true, comment: 'Battery level 0-100%' })
//     battery_level?: number;

//     /** override โปรไฟล์รายเครื่อง (ถ้าใช้แนวเดียวกับ MRS) */
//     @Column({ type: 'bigint', unsigned: true, nullable: true, comment: 'Override control profile (optional)' })
//     control_id?: string;

//     @Column({ type: 'tinyint', width: 1, default: 1, comment: 'Available for assignment (0/1)' })
//     is_available!: boolean;

//     @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
//     last_update: Date;
// }

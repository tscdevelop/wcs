import { EntityManager, Not, QueryFailedError, Repository } from "typeorm";
import { AppDataSource } from "../config/app-data-source";
import { ApiResponse } from "../models/api-response.model";
import * as lang from '../utils/LangHelper';
import * as validate from '../utils/ValidationUtils';

import { MRS } from "../entities/mrs.entity";
import { StatusOrders } from "../common/global.enum";
import { Aisle } from "../entities/aisle.entity";
import { Orders } from "../entities/orders.entity";
import { StockItems } from "../entities/m_stock_items.entity";
import { Locations } from "../entities/m_location.entity";

export class MRSService {
    private mrsRepository : Repository<MRS>;
    private taskRepository : Repository<Orders>;

    constructor(){
        this.mrsRepository = AppDataSource.getRepository(MRS);
        this.taskRepository = AppDataSource.getRepository(Orders);
    }

    // async updateStop(
    //     data: Partial<mrs>,
    //     reqUsername: string,
    //     manager?: EntityManager
    //     ): Promise<ApiResponse<any>> {
    //     let response = new ApiResponse<mrs>();
    //     const operation = 'MRSService.updateStop';

    //     const queryRunner = manager ? null : AppDataSource.createQueryRunner();
    //     const useManager = manager || queryRunner?.manager;

    //     if (!useManager) {
    //         return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
    //     }

    //     if (!manager && queryRunner) {
    //         await queryRunner.connect();
    //         await queryRunner.startTransaction();
    //     }

    //     try {
    //         const repository = useManager.getRepository(mrs);

    //         // ----- Validate -----
    //         if (validate.isNullOrEmpty(data.mrs_id)) {
    //             return response.setIncomplete(lang.msgRequired('mrs.mrs_id'));
    //         }
    //         if (validate.isNullOrEmpty(data.status)) {
    //             return response.setIncomplete(lang.msgRequired('mrs.status'));
    //         }

    //         const existing = await repository.findOneBy({ mrs_id: data.mrs_id! });
    //         if (!existing) {
    //             return response.setIncomplete(lang.msgNotFound('item.mrs'));
    //         }

    //         const validStatuses = Object.values(MRSStatus);
    //         if (!validStatuses.includes(data.status as MRSStatus)) {
    //             return response.setIncomplete(
    //                 lang.msg('validation.enum_invalid', {
    //                 field: 'status',
    //                 allow: validStatuses.join(', ')
    //                 })
    //             );
    //         }

    //         // อัปเดตเฉพาะฟิลด์ที่ตั้งใจจะเปลี่ยน
    //         repository.merge(existing, {
    //             status: data.status as MRSStatus,
    //             update_by: reqUsername,
    //             last_event_at: new Date(),
    //         });

    //         // บันทึก (เป็น update)
    //         const savedData = await repository.save(existing);

    //         // แนะนำ: ใช้ "updated" เพราะเป็นการอัปเดต ไม่ใช่สร้างใหม่
    //         response = response.setComplete(
    //             lang.msgSuccessAction('updated', 'item.mrs'),
    //             savedData
    //         );

    //         if (!manager && queryRunner) {
    //             await queryRunner.commitTransaction();
    //         }
    //         return response;

    //     } catch (error: any) {
    //         if (!manager) {
    //             await queryRunner?.rollbackTransaction();
    //         }
    //         console.error('Error during mrs control:', error);
    //         throw new Error(lang.msgErrorFunction(operation, error.message));
    //     } finally {
    //         if (!manager) {
    //             await queryRunner?.release();
    //         }
    //     }
    // }

    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'MRSService.getAll';

        try {
            const repository = manager ? manager.getRepository(MRS) : this.mrsRepository;

            const rawData = await repository
                .createQueryBuilder('mrs')
                .leftJoin(Aisle, 'aisle', 'mrs.target_aisle_id = aisle.aisle_id')
                .leftJoin(Orders, 'order', 'mrs.current_order_id = order.order_id')
                //ป้องกันเคส order ที่ loc_id ไม่ได้ผูกกับ MRS นี้จริง
                .leftJoin(
                    'm_location_mrs',
                    'loc_mrs',
                    'loc_mrs.mrs_id = mrs.mrs_id AND loc_mrs.loc_id = order.loc_id'
                )
                .leftJoin(Locations, 'loc', 'loc.loc_id = order.loc_id')
                .leftJoin(StockItems, 'stock', 'stock.item_id = order.item_id')
                .select([
                    'mrs.mrs_id AS mrs_id',
                    'mrs.mrs_code AS mrs_code',
                    "mrs.mrs_status AS mrs_status", 
                    'mrs.target_aisle_id AS target_aisle_id',
                    'aisle.aisle_code AS aisle_code',
                    'mrs.bank_code AS bank_code',
                    'order.order_id AS order_id',
                    'order.type AS type',
                    'stock.item_id AS item_id',
                    'stock.stock_item AS stock_item',
                    'stock.item_desc AS item_desc',
                    'loc.loc AS loc',
                    'loc.box_loc AS box_loc',
                    'order.status AS status',
                    "DATE_FORMAT(order.requested_at, '%d/%m/%Y') AS requested_at",
                    "order.plan_qty AS plan_qty",
                    "order.actual_qty AS actual_qty",
                ])
                .orderBy('mrs.mrs_id', 'ASC')
                .getRawMany();

            if (!rawData || rawData.length === 0) {
            return response.setIncomplete(lang.msgNotFound('item.mrs'));
            }

            return response.setComplete(lang.msgFound('item.mrs'), rawData);

        } catch (error: any) {
            console.error('Error in getAll:', error);

            if (error instanceof QueryFailedError) {
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }



}
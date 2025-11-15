import { EntityManager, Not, QueryFailedError, Repository } from "typeorm";
import { AppDataSource } from "../config/app-data-source";
import { ApiResponse } from "../models/api-response.model";
import * as lang from '../utils/LangHelper';
import * as validate from '../utils/ValidationUtils';

import { MRS } from "../entities/mrs.entity";
import { StatusOrders } from "../common/global.enum";
import { Aisle } from "../entities/aisle.entity";
import { Orders } from "../entities/orders.entity";

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
                .leftJoin(Aisle, 'aisle', 'mrs.current_aisle_id = aisle.aisle_id')
                .leftJoin(Orders, 'order', 'mrs.current_order_id = order.order_id')
                .leftJoin('m_stock_items', 'stock', 'stock.stock_item = order.stock_item')
                .select([
                    'mrs.mrs_id AS mrs_id',
                    'mrs.mrs_code AS mrs_code',
                    "mrs.mrs_status AS mrs_status", 
                    'mrs.target_aisle_id AS target_aisle_id',
                    'mrs.bank_code AS bank_code',
                    'mrs.current_aisle_id AS current_aisle_id',
                    // 'aisle.aisle_code AS current_aisle_code',
                    'order.order_id AS order_id',
                    'order.type AS type',
                    'order.stock_item AS stock_item',
                    'stock.item_name AS item_name',
                    'stock.item_desc AS item_desc',
                    'order.from_location AS from_location',
                    'order.status AS status',
                    "DATE_FORMAT(order.requested_at, '%d %b %y %H:%i:%s') AS requested_at",
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
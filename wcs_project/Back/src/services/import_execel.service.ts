import { EntityManager } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper';
import * as validate from '../utils/ValidationUtils';

import { Orders } from '../entities/orders.entity';
import { OrdersUsage } from '../entities/order_usage.entity';
import { OrdersLog } from '../entities/orders_log.entity';
import { StockItems } from '../entities/m_stock_items.entity';
import { StatusOrders, TypeInfm, TaskSource, TaskSubsystem } from '../common/global.enum';

import { Locations } from '../entities/m_location.entity';
import { Inventory } from '../entities/inventory.entity';
import { s_user } from '../entities/s_user.entity';
import { OrdersReceipt } from '../entities/order_receipt.entity';


export class ImportService {
    async createUsageJson(
        data: any[],
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'ImportService.createUsageJson';

        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;

        if (!useManager) {
        return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }

        if (!manager && queryRunner) {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        }

        try {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Excel data is empty');
        }

        const ordersRepo = useManager.getRepository(Orders);
        const usageRepo = useManager.getRepository(OrdersUsage);
        const logRepo = useManager.getRepository(OrdersLog);
        const stockRepo = useManager.getRepository(StockItems);
        const locationRepo = useManager.getRepository(Locations);
        const inventoryRepo = useManager.getRepository(Inventory);
        const userRepo = useManager.getRepository(s_user);

        /** เตรียม buffer */
        const buffer: {
            order: Partial<Orders>;
            usage: Partial<OrdersUsage>;
            log: Partial<OrdersLog>;
            item_id: number;
            loc_id: number;
            plan_qty: number;
        }[] = [];

        // =========================
        // Phase 1: Validate + Lookup
        // =========================
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNo = i + 1;

        /** ---------- Required ---------- */
        const requiredFields = [
            'loc',
            'box_loc',
            'stock_item',
            'item_desc',
            'plan_qty',
            'cond',
            'mc_code',
            'requested_at',
            'requested_by',
            'usage_type',
            'work_order',
            'spr_no',
            'usage_num',
            'usage_line',
            'split',
            'invuse_status',
        ];


        for (const f of requiredFields) {
            if (validate.isNullOrEmpty(row[f])) {
                throw new Error(`Row ${rowNo}: ${f} is required`);
            }
        }

         /** ---------- Location ---------- */
        const location = await locationRepo.findOne({
            where: {
            loc: row.loc,
            box_loc: row.box_loc,
            },
        });

            
        if (!location) {
            throw new Error(
            `Row ${rowNo}: Location not found (${row.loc} / ${row.box_loc})`
            );
        }

        /** ---------- Stock Item ---------- */
        const stockItem = await stockRepo.findOne({
            where: { stock_item: row.stock_item },
        });

        if (!stockItem) {
            throw new Error(
            `Row ${rowNo}: Stock item not found (${row.stock_item})`
            );
        }
        // replace item_desc
        row.item_desc = stockItem.item_desc;
        row.item_id = stockItem.item_id;

        /** ---------- Inventory ---------- */
        const inventories = await inventoryRepo
            .createQueryBuilder('inv')
            .setLock('pessimistic_write')
            .where('inv.item_id = :item_id', { item_id: stockItem.item_id })
            .andWhere('inv.loc_id = :loc_id', { loc_id: location.loc_id })
            .orderBy('inv.inv_id', 'ASC')
            .getMany();

        if (!inventories.length) {
            throw new Error(
            `Row ${rowNo}: Inventory not found`
            );
        }

         /** ---------- Requested Date ---------- */
        const requestedAt = row.requested_at
            ? new Date(row.requested_at)
            : undefined;

        /** ---------- Requested User ---------- */
        const requestedUser = await userRepo.findOne({
        where: { username: row.requested_by },
        });

        if (!requestedUser) {
        throw new Error(
            `Row ${rowNo}: Requested user not found (${row.requested_by})`
        );
        }

        buffer.push({
            order: {
                mc_code: row.mc_code,
                cond: row.cond,
                plan_qty: Number(row.plan_qty),

                requested_at: requestedAt,
                requested_by: row.requested_by,
                created_by_user_id: requestedUser.user_id,

                loc_id: location.loc_id,
                store_type: location.store_type,
                item_id: stockItem.item_id,

                status: StatusOrders.WAITING,
                type: TypeInfm.USAGE,
                
                import_by: reqUsername,
            },
            usage: {
                usage_type: row.usage_type,
                work_order: row.work_order,
                spr_no: row.spr_no,
                usage_num: row.usage_num,
                usage_line: row.usage_line,
                split: row.split,
                invuse_status: row.invuse_status,
            },
            log: {
                type: TypeInfm.USAGE,
                item_id: stockItem.item_id,
                stock_item: stockItem.stock_item,
                item_desc: stockItem.item_desc,
                loc_id: location.loc_id,
                loc: location.loc,
                box_loc: location.box_loc,
                cond: row.cond,
                plan_qty: Number(row.plan_qty),
                status: StatusOrders.WAITING,
                actor: reqUsername,
                source: TaskSource.SYSTEM,
                subsystem: TaskSubsystem.CORE,
            },
                item_id: stockItem.item_id,
                loc_id: location.loc_id,
                plan_qty: Number(row.plan_qty),
        });
        }

        // =========================
        // Phase 2: เช็ค stock แบบ SUM
        // =========================
        const usageMap = new Map<
            string,
            {
                item_id: number;
                stock_item: string;
                loc_id: number;
                loc: string;
                box_loc: string;
                totalPlanQty: number;
            }
            >();

            for (const row of buffer) {
                const key = `${row.item_id}_${row.loc_id}`;

                if (!usageMap.has(key)) {
                    usageMap.set(key, {
                    item_id: row.item_id,
                    stock_item: row.log.stock_item ?? '',
                    loc_id: row.loc_id,
                    loc: row.log.loc ?? '',
                    box_loc: row.log.box_loc ?? '',
                    totalPlanQty: 0,
                    });
                }
                usageMap.get(key)!.totalPlanQty += row.plan_qty;
            }

            for (const [, data] of usageMap) {
                const { item_id, stock_item, loc_id, loc, box_loc, totalPlanQty } = data;

                const result = await inventoryRepo
                    .createQueryBuilder('inv')
                    .select('SUM(inv.inv_qty)', 'sum')
                    .where('inv.item_id = :item_id', { item_id })
                    .andWhere('inv.loc_id = :loc_id', { loc_id })
                    .getRawOne();

                const availableQty = Number(result.sum || 0);

                if (availableQty < totalPlanQty) {
                    throw new Error(
                    `Inventory not enough (stock_item=${stock_item}, loc=${loc}, box_loc=${box_loc}, required=${totalPlanQty}, available=${availableQty})`
                    );
                }
            }

        // =========================
        // Phase 3: Save
        // =========================
        const savedOrders: Orders[] = [];

        for (const row of buffer) {
            const savedOrder = await ordersRepo.save(row.order);

            await usageRepo.save({
                ...row.usage,
                order_id: savedOrder.order_id,
            });


            await logRepo.save({
                ...row.log,
                order_id: savedOrder.order_id,
            });

            savedOrders.push(savedOrder);
        }

        if (!manager && queryRunner) {
            await queryRunner.commitTransaction();
        }

        return response.setComplete(
            lang.msgSuccessAction('created', 'orders'),
            savedOrders
        );

        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`❌ ${operation}`, error);
            return response.setIncomplete(error.message);
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }

    async createReceiptJson(
        data: any[],
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'ImportService.createReceiptJson';

        const queryRunner = manager ? null : AppDataSource.createQueryRunner();
        const useManager = manager || queryRunner?.manager;

        if (!useManager) {
        return response.setIncomplete(lang.msg('validation.no_entityManager_or_queryRunner_available'));
        }

        if (!manager && queryRunner) {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        }

        try {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Excel data is empty');
        }

        const ordersRepo = useManager.getRepository(Orders);
        const receiptRepo = useManager.getRepository(OrdersReceipt);
        const logRepo = useManager.getRepository(OrdersLog);
        const stockRepo = useManager.getRepository(StockItems);
        const locationRepo = useManager.getRepository(Locations);
        const inventoryRepo = useManager.getRepository(Inventory);
        const userRepo = useManager.getRepository(s_user);

        /** เตรียม buffer */
        const buffer: {
            order: Partial<Orders>;
            receipt: Partial<OrdersReceipt>;
            log: Partial<OrdersLog>;
            item_id: number;
            loc_id: number;
            plan_qty: number;
        }[] = [];

        // =========================
        // Phase 1: Validate + Lookup
        // =========================
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNo = i + 1;

        /** ---------- Required ---------- */
        const requiredFields = [
            'type',
            'loc',
            'box_loc',
            'stock_item',
            'item_desc',
            'plan_qty',
            'cond',
            'mc_code',
            'requested_at',
            'unit_cost_handled',
            'po_num',
            'object_id',
        ];


        for (const f of requiredFields) {
            if (validate.isNullOrEmpty(row[f])) {
                throw new Error(`Row ${rowNo}: ${f} is required`);
            }
        }

         /** ---------- Location ---------- */
        const location = await locationRepo.findOne({
            where: {
            loc: row.loc,
            box_loc: row.box_loc,
            },
        });

            
        if (!location) {
            throw new Error(
            `Row ${rowNo}: Location not found (${row.loc} / ${row.box_loc})`
            );
        }

        /** ---------- Stock Item ---------- */
        const stockItem = await stockRepo.findOne({
            where: { stock_item: row.stock_item },
        });

        if (!stockItem) {
            throw new Error(
            `Row ${rowNo}: Stock item not found (${row.stock_item})`
            );
        }
        // replace item_desc
        row.item_desc = stockItem.item_desc;
        row.item_id = stockItem.item_id;

         /** ---------- Requested Date ---------- */
        const requestedAt = row.requested_at
            ? new Date(row.requested_at)
            : undefined;

        /** ---------- Requested User ---------- */
        const requestedUser = await userRepo.findOne({
        where: { username: reqUsername },
        });

        if (!requestedUser) {
            throw new Error('Requested user not found');
        }

        buffer.push({
            order: {
                mc_code: row.mc_code,
                cond: row.cond,
                plan_qty: Number(row.plan_qty),

                requested_at: requestedAt,
                requested_by: reqUsername,
                created_by_user_id: requestedUser.user_id,

                loc_id: location.loc_id,
                store_type: location.store_type,
                item_id: stockItem.item_id,

                status: StatusOrders.WAITING,
                type: row.type,
                
                import_by: reqUsername,
            },
            receipt: {
                po_num: row.po_num,
                object_id: row.object_id,
            },
            log: {
                type: row.type,
                item_id: stockItem.item_id,
                stock_item: stockItem.stock_item,
                item_desc: stockItem.item_desc,
                loc_id: location.loc_id,
                loc: location.loc,
                box_loc: location.box_loc,
                cond: row.cond,
                plan_qty: Number(row.plan_qty),
                status: StatusOrders.WAITING,
                actor: reqUsername,
                source: TaskSource.SYSTEM,
                subsystem: TaskSubsystem.CORE,
            },
                item_id: stockItem.item_id,
                loc_id: location.loc_id,
                plan_qty: Number(row.plan_qty),
        });
        }

        // =========================
        // Phase 3: Save
        // =========================
        const savedOrders: Orders[] = [];

        for (const row of buffer) {
            const savedOrder = await ordersRepo.save(row.order);

            await receiptRepo.save({
                ...row.receipt,
                order_id: savedOrder.order_id,
            });

            await logRepo.save({
                ...row.log,
                order_id: savedOrder.order_id,
            });

            savedOrders.push(savedOrder);
        }

        if (!manager && queryRunner) {
            await queryRunner.commitTransaction();
        }

        return response.setComplete(
            lang.msgSuccessAction('created', 'orders'),
            savedOrders
        );

        } catch (error: any) {
            if (!manager && queryRunner) {
                await queryRunner.rollbackTransaction();
            }
            console.error(`❌ ${operation}`, error);
            return response.setIncomplete(error.message);
        } finally {
            if (!manager && queryRunner) {
                await queryRunner.release();
            }
        }
    }
}


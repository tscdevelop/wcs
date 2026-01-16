import { EntityManager, QueryFailedError } from "typeorm";
import { ApiResponse } from "../models/api-response.model";
import * as lang from "../utils/LangHelper";
import { Orders } from "../entities/orders.entity";
import { AppDataSource } from "../config/app-data-source";
import { Counter } from "../entities/counter.entity";
import { StatusOrders } from "../common/global.enum";
import { OrdersUsage } from "../entities/order_usage.entity";
import { StockItems } from "../entities/m_stock_items.entity";
import { OrdersReceipt } from "../entities/order_receipt.entity";
import { OrdersTransfer } from "../entities/order_transfer.entity";

export class CounterService {

    async getOrderAllByUser(
        userId?: number,
        manager?: EntityManager
    ): Promise<ApiResponse<any | null>> {

        const response = new ApiResponse<any | null>();
        const operation = 'CounterService.getOrderAllByUser';

        try {
            const repository = manager
                ? manager.getRepository(Counter)
                : AppDataSource.getRepository(Counter);

            const qb = repository
                .createQueryBuilder('counter')
                // ❗ INNER JOIN = ตัด counter ที่ไม่มี current_order_id ทิ้งอัตโนมัติ
                .innerJoin(
                    Orders,
                    'order',
                    'order.order_id = counter.current_order_id'
                )
                .leftJoin('orders_usage', 'usage', 'usage.order_id = order.order_id')
                .leftJoin('m_stock_items', 'stock', 'stock.item_id = order.item_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = order.loc_id')
                .select([
                    'counter.counter_id AS counter_id',
                    'counter.light_color_hex AS counter_color',

                    'order.order_id AS order_id',
                    'order.mc_code AS mc_code',
                    'order.type AS type',
                    'order.spr_no AS spr_no',
                    'usage.work_order AS work_order',

                    'stock.item_id AS item_id',
                    'stock.stock_item AS stock_item',
                    'order.cond AS cond',
                    'order.status AS status',
                    'order.plan_qty AS plan_qty',
                    'order.actual_qty AS actual_qty',
                    "DATE_FORMAT(order.requested_at, '%d/%m/%Y') AS requested_at",
                ])
                // ❗ ตัด EMPTY counter ทิ้งทุกกรณี
                .where('counter.status <> :emptyStatus', { emptyStatus: 'EMPTY' })
                .orderBy('counter.counter_id', 'ASC');

            // ✅ filter user เฉพาะกรณี REQUESTER (ส่ง userId มา)
            if (userId) {
                qb.andWhere('order.user_id = :userId', { userId });
            }

            const rawData = await qb.getRawMany();

            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('field.orders'));
            }

            const cleanedData = rawData.map((item: any) => ({
                ...item,
                actual_qty:
                    item.actual_qty != null && !isNaN(Number(item.actual_qty))
                        ? Number(item.actual_qty)
                        : 0,
                order_id: item.order_id ?? '-',
                work_order: item.work_order ?? '-',
                spr_no: item.spr_no ?? '-',
            }));

            return response.setComplete(lang.msgFound('field.orders'), cleanedData);

        } catch (error: any) {
            console.error(`Error during ${operation}:`, error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(
                    lang.msgErrorFunction(operation, error.message)
                );
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }


    async getCounterAllByUser(
        userId?: number,
        manager?: EntityManager
    ): Promise<ApiResponse<any | null>> {

        const response = new ApiResponse<any | null>();
        const operation = 'CounterService.getCounterAllByUser';

        try {
            const repository = manager
                ? manager.getRepository(Counter)
                : AppDataSource.getRepository(Counter);

            const qb = repository
                .createQueryBuilder('counter')
                .leftJoin(
                    Orders,
                    'order',
                    'order.order_id = counter.current_order_id'
                );

            // ✅ filter เฉพาะ REQUESTER
            if (userId) {
                qb.andWhere('order.user_id = :userId', { userId });
            }

            const rawData = await qb
                .select([
                    'counter.counter_id AS id',
                    'counter.status AS status',
                    'counter.light_color_hex AS color',
                    'order.order_id AS order_id',
                    'order.actual_qty AS actual',
                    'order.plan_qty AS plan',
                    'order.status AS order_status',
                ])
                .orderBy('counter.counter_id', 'ASC')
                .getRawMany();

            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('counter'));
            }

            const cleanedData = rawData.map((item: any) => ({
                ...item,
                order_id: item.order_id ?? '-',
                actual: item.actual ?? 0,
                plan: item.plan ?? 0,
            }));

            return response.setComplete(lang.msgFound('counter'), cleanedData);

        } catch (error: any) {
            console.error('Error in getCounterAllByUser:', error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(
                    lang.msgErrorFunction(operation, error.message)
                );
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }



    // get counter id for screen counter
    async getByCounterId(
        counterId: number,
        manager?: EntityManager
        ): Promise<ApiResponse<any[] | null>> {
        const response = new ApiResponse<any[] | null>();
        const operation = 'CounterService.getByCounterId';

        try {
            const counterRepo = manager
            ? manager.getRepository(Counter)
            : AppDataSource.getRepository(Counter);

            const rawData = await counterRepo
            .createQueryBuilder('counter')
            .leftJoin(
                Orders,
                'order',
                'order.order_id = counter.current_order_id'
            )

            // ===== USAGE =====
            .leftJoin(
                OrdersUsage,
                'usage',
                'usage.order_id = order.order_id'
            )

            // ===== RECEIPT =====
            .leftJoin(
                OrdersReceipt,
                'receipt',
                'receipt.order_id = order.order_id'
            )

            // ===== TRANSFER =====
            .leftJoin(
                OrdersTransfer,
                'transfer',
                'transfer.order_id = order.order_id'
            )

            // ===== ITEM =====
            .leftJoin(
                StockItems,
                'item',
                'item.item_id = order.item_id'
            )

            .select([
                // counter
                'counter.counter_id AS counter_id',
                'counter.light_color_hex AS color',
                'counter.light_mode AS light_mode',

                // order
                'order.order_id AS order_id',
                'order.type AS trx_type',
                'order.mc_code AS mc_code',
                'order.spr_no AS spr_no',
                'order.plan_qty AS plan_qty',
                'order.actual_qty AS actual_qty',
                'order.item_id AS item_id',

                // USAGE
                'usage.work_order AS work_order',
                'usage.usage_num AS usage_num',
                'usage.line AS usage_line',

                // RECEIPT
                'receipt.po_num AS receipt_po_num',
                'receipt.object_id AS receipt_object_id',

                // TRANSFER
                'transfer.po_num AS transfer_po_num',
                'transfer.object_id AS transfer_object_id',

                // item
                'item.stock_item AS stock_item',
                'item.item_desc AS item_desc',
                'item.item_img AS item_img',
                'item.item_img_url AS item_img_url',
            ])
            .where('counter.counter_id = :counterId', { counterId })
            .getRawMany();

            if (!rawData || rawData.length === 0) {
            return response.setIncomplete(lang.msgNotFound('counter'));
            }

            const flattenedData = rawData.map((row) => {
            const isUsage = row.trx_type === 'USAGE';
            const isReceipt = row.trx_type === 'RECEIPT';
            const isTransfer = row.trx_type === 'TRANSFER';

            return {
                // counter
                counter_id: row.counter_id,
                color: row.color,
                light_mode: row.light_mode,

                // order
                order_id: row.order_id,
                trx_type: row.trx_type,
                mc_code: row.mc_code,
                spr_no: row.spr_no,
                plan_qty: row.plan_qty,
                actual_qty: row.actual_qty,

                // ===== conditional =====
                work_order: isUsage ? row.work_order : null,
                usage_num: isUsage ? row.usage_num : null,
                usage_line: isUsage ? row.usage_line : null,

                po_num: isReceipt
                ? row.receipt_po_num
                : isTransfer
                ? row.transfer_po_num
                : null,

                object_id: isReceipt
                ? row.receipt_object_id
                : isTransfer
                ? row.transfer_object_id
                : null,

                // item
                item_id: row.item_id,
                stock_item: row.stock_item,
                item_desc: row.item_desc,
                item_img: row.item_img,
                item_img_url: row.item_img_url,
            };
            });

            return response.setComplete(lang.msgFound('counter'), flattenedData);
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error.message);
            if (error instanceof QueryFailedError) {
            return response.setIncomplete(
                lang.msgErrorFunction(operation, error.message)
            );
            }
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

}
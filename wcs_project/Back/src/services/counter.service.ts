import { EntityManager, QueryFailedError } from "typeorm";
import { ApiResponse } from "../models/api-response.model";
import * as lang from "../utils/LangHelper";
import { Orders } from "../entities/orders.entity";
import { AppDataSource } from "../config/app-data-source";
import { Counter } from "../entities/counter.entity";
import { StatusOrders } from "../common/global.enum";

export class CounterService {
// async getOrderAll(
//      options?: {
//         isExecution?: boolean;   
//             store_type?: string;
//             mc_code?: string;
//         },
//     manager?: EntityManager
//     ): Promise<ApiResponse<any | null>> {
//         const response = new ApiResponse<any | null>();
//         const operation = 'CounterService.getOrderAll';

//         try {
//             const repository = manager
//     ? manager.getRepository(Orders)
//     : AppDataSource.getRepository(Orders);

//             // Query order ข้อมูลทั้งหมดในรูปแบบ raw data
//            const query = repository
//                 .createQueryBuilder('o')
//                 .leftJoin('orders_usage', 'usage', 'usage.order_id = o.order_id')
//                 .leftJoin('m_stock_items', 'stock', 'stock.item_id = o.item_id')
//                 .leftJoin('m_location', 'loc', 'loc.loc_id = o.loc_id')
//                 .leftJoin(
//                     'counter',
//                     'counter',
//                     'counter.current_order_id = o.order_id'
//                 )
//                 .select([
//                     'o.order_id AS order_id',
//                     'o.mc_code AS mc_code',
//                     'o.type AS type',
//                     'o.spr_no AS spr_no',
//                     'usage.work_order AS work_order',
//                     'stock.item_id AS item_id',
//                     'stock.stock_item AS stock_item',
//                     'o.cond AS cond',
//                     'o.status AS status',
//                     'o.plan_qty AS plan_qty',
//                     'o.actual_qty AS actual_qty',
//                     'o.store_type AS store_type',
//                     'counter.counter_id AS counter_id',
//                     "DATE_FORMAT(o.requested_at, '%d/%m/%Y') AS requested_at",

//                 ])
//                 .orderBy('o.requested_at', 'ASC')

//                 .cache(false);

//                  // 🔥 status filter
//                 if (options?.isExecution === true) {
//                     // เฉพาะ processinh
//                     query.andWhere('o.status = :processingStatus', {
//                         processingStatus: StatusOrders.PROCESSING,
//                     });
//                 } else if (options?.isExecution === false) {
//                     // ทุกสถานะ ยกเว้น processinh
//                     query.andWhere('o.status <> :processingStatus', {
//                         processingStatus: StatusOrders.PROCESSING,
//                     });
//                 }
//                 // undefined → ไม่ใส่ where (ได้ทุกสถานะ)

//             // 🔎 filter store_type
//             if (options?.store_type) {
//                 query.andWhere('o.store_type = :store_type', {
//                     store_type: options.store_type,
//                 });
//             }

//             // 🔎 filter mc_code
//             if (options?.mc_code) {
//                 query.andWhere('o.mc_code = :mc_code', {
//                     mc_code: options.mc_code,
//                 });
//             }

//             const rawData = await query.getRawMany();

//             if (!rawData || rawData.length === 0) {
//                 return response.setIncomplete(lang.msgNotFound('field.orders'));
//             }

//             // ✅ normalize ค่าเหมือนเดิม
//             const cleanedData = rawData.map((item: any) => ({
//                 ...item,
//                 actual_qty:
//                     item.actual_qty != null && !isNaN(Number(item.actual_qty))
//                         ? Number(item.actual_qty)
//                         : 0,
                
//                 counter_id: item.counter_id ?? '-',
//                 spr_no: item.spr_no ?? '-',
//                 work_order: item.work_order ?? '-'
//             }));

//             return response.setComplete(lang.msgFound('field.orders'), cleanedData);
//         } catch (error: any) {
//             console.error('Error in getOrderAll:', error);

//             if (error instanceof QueryFailedError) {
//                 return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
//             }

//             throw new Error(lang.msgErrorFunction(operation, error.message));
//         }
//     }


async getOrderAllByUser(userId: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
    const response = new ApiResponse<any | null>();
    const operation = 'CounterService.getOrderAllByUser';

    try {
        const repository = manager
            ? manager.getRepository(Counter)
            : AppDataSource.getRepository(Counter);

        const query = repository
            .createQueryBuilder('counter')
            .innerJoin(
                Orders,
                'order',
                'order.order_id = counter.current_order_id AND order.user_id = :userId',
                { userId }
            )
            .leftJoin('orders_usage', 'usage', 'usage.order_id = order.order_id')
            .leftJoin('m_stock_items', 'stock', 'stock.item_id = order.item_id')
            .leftJoin('m_location', 'loc', 'loc.loc_id = order.loc_id')
            .select([
                'counter.counter_id AS counter_id',
                //'counter.status AS counter_status',
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
            .orderBy('counter.counter_id', 'ASC');

        const rawData = await query.getRawMany();

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
        console.error('Error in getOrderAllByUser:', error);

        if (error instanceof QueryFailedError) {
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
        }

        throw new Error(lang.msgErrorFunction(operation, error.message));
    }
}

async getCounterAllByUser(userId: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
    const response = new ApiResponse<any | null>();
    const operation = 'CounterService.getCounterAllByUser';

    try {
        const repository = manager
            ? manager.getRepository(Counter)
            : AppDataSource.getRepository(Counter);

        // INNER JOIN เพื่อเอาเฉพาะ counter ที่มี order ของ user
        const rawData = await repository
            .createQueryBuilder('counter')
            .innerJoin(
                Orders,
                'order',
                'order.order_id = counter.current_order_id AND order.user_id = :userId',
                { userId }
            )
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
            plan: item.plan ?? 0
        }));

        return response.setComplete(lang.msgFound('counter'), cleanedData);

    } catch (error: any) {
        console.error('Error in getCounterAllByUser:', error);

        if (error instanceof QueryFailedError) {
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
        }

        throw new Error(lang.msgErrorFunction(operation, error.message));
    }
}



async getByCounterId(counterId: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
    const response = new ApiResponse<any | null>();
    const operation = 'CounterService.getByCounterId';

    try {
        const repository = manager
            ? manager.getRepository(Counter)
            : AppDataSource.getRepository(Counter);

        // Query ด้วย counter_id
        const rawData = await repository
            .createQueryBuilder('counter')
            .leftJoin(
                Orders,
                'order',
                'order.order_id = counter.current_order_id'
            )
            .select([
                'counter.counter_id AS counter_id',
                'counter.status AS status',
                'counter.light_color_hex AS color',
                'order.order_id AS order_id',
                'order.actual_qty AS actual',
                'order.plan_qty AS plan',
                'order.status AS order_status'
            ])
            .where('counter.counter_id = :counterId', { counterId })
            .getRawMany();

        if (!rawData || rawData.length === 0) {
            return response.setIncomplete(lang.msgNotFound('counter'));
        }

        const cleanedData = rawData.map((item: any) => ({
            ...item,
            counter_id: item.counter_id ?? '-',
            order_id: item.order_id ?? '-',
            actual: item.actual ?? 0,
            plan: item.plan ?? 0,
            order_status: item.order_status ?? '-'
        }));

        return response.setComplete(lang.msgFound('counter'), cleanedData);
    } catch (error: any) {
        console.error(`Error during ${operation}:`, error.message);
        if (error instanceof QueryFailedError)
            return response.setIncomplete(lang.msgErrorFunction(operation, error.message));

        throw new Error(lang.msgErrorFunction(operation, error.message));
    }
}


}
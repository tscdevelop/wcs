import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import { Orders } from '../entities/orders.entity';
import { StatusOrders, TypeInfm } from '../common/global.enum';

export class AllOrdersService {
    private ordersRepository: Repository<Orders>;

    constructor(){
        this.ordersRepository = AppDataSource.getRepository(Orders);
    }

    async getUsageAll(
        options?: {
            isExecution?: boolean;   // ✅ true = status Waiting / false = all status except FINISHED/COMPLETED
            store_type?: string;
            mc_code?: string;
        },
        manager?: EntityManager
        ): Promise<ApiResponse<any | null>> {
    
        const response = new ApiResponse<any | null>();
        const operation = 'AllOrdersService.getUsageAll';

        try {
            const repository = manager
                ? manager.getRepository(Orders)
                : this.ordersRepository;

            const query = repository
                .createQueryBuilder('order')
                .leftJoin('orders_usage', 'usage', 'usage.order_id = order.order_id')
                .leftJoin('m_stock_items', 'stock', 'stock.item_id = order.item_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = order.loc_id')
                .select([
                    'order.order_id AS order_id',
                    'order.mc_code AS mc_code',
                    'order.type AS type',
                    'order.spr_no AS spr_no',
                    'order.status AS status',
                    'usage.usage_id AS usage_id',
                    'usage.work_order AS work_order',
                    'usage.usage_num AS usage_num',
                    'usage.line AS line',
                    'usage.usage_type AS usage_type',
                    'usage.split AS split',
                    'stock.item_id AS item_id',
                    'stock.stock_item AS stock_item',
                    'stock.item_desc AS item_desc',
                    'loc.loc_id AS loc_id',
                    'loc.loc AS loc',
                    'loc.box_loc AS box_loc',
                    'order.store_type AS store_type',
                    'order.cond AS cond',
                    'order.plan_qty AS plan_qty',
                    'order.actual_qty AS actual_qty',
                    'order.requested_by AS requested_by',
                    "DATE_FORMAT(order.requested_at, '%d/%m/%Y') AS requested_at",
                ])
                // 🔒 base condition
                .where('order.type = :type', { type: 'USAGE' })
                .orderBy('order.requested_at', 'ASC')
                .cache(false);

            // 🔥 true = status Waiting / false = all status except FINISHED/COMPLETED / undefined = all status
            if (options?.isExecution === true) {
                    // เฉพาะ WAITING
                    query.andWhere('order.status = :waitingStatus', {
                        waitingStatus: StatusOrders.WAITING,
                    });
                } else if (options?.isExecution === false) {
                    // ทุกสถานะ ยกเว้น WAITING และ FINISHED/COMPLETED
                    query.andWhere('order.status NOT IN (:...excludedStatuses)', {
                        excludedStatuses: [
                            StatusOrders.WAITING,
                            StatusOrders.FINISHED,
                            StatusOrders.COMPLETED
                        ],
                    });
                }
                // undefined → ไม่ใส่ where (ได้ทุกสถานะ)

            // 🔎 filter store_type
            if (options?.store_type) {
                query.andWhere('order.store_type = :store_type', {
                    store_type: options.store_type,
                });
            }

            // 🔎 filter mc_code
            if (options?.mc_code) {
                query.andWhere('order.mc_code = :mc_code', {
                    mc_code: options.mc_code,
                });
            }

            const rawData = await query.getRawMany();

            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('field.usage'));
            }

            // ✅ normalize ค่าเหมือนเดิม
            const cleanedData = rawData.map((item: any) => ({
                ...item,
                actual_qty:
                    item.actual_qty != null && !isNaN(Number(item.actual_qty))
                        ? Number(item.actual_qty)
                        : 0,
            }));

            return response.setComplete(lang.msgFound('field.usage'), cleanedData);

        } catch (error: any) {
            console.error(`Error in ${operation}:`, error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(
                    lang.msgErrorFunction(operation, error.message)
                );
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getReceiptAll(
        options?: {
            isExecution?: boolean;   // ✅ true = status Waiting / false = all status except FINISHED/COMPLETED
            store_type?: string;
            mc_code?: string;
        },
        manager?: EntityManager
        ): Promise<ApiResponse<any | null>> {
    
        const response = new ApiResponse<any | null>();
        const operation = 'AllOrdersService.getReceiptAll';

        try {
            const repository = manager
                ? manager.getRepository(Orders)
                : this.ordersRepository;

            const query = repository
                .createQueryBuilder('order')
                .leftJoin('orders_receipt', 'receipt', 'receipt.order_id = order.order_id')
                .leftJoin('m_stock_items', 'stock', 'stock.item_id = order.item_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = order.loc_id')
                .select([
                    'order.order_id AS order_id',
                    'order.mc_code AS mc_code',
                    'order.type AS type',
                    'order.spr_no AS spr_no',
                    'order.status AS status',
                    'receipt.receipt_id AS receipt_id',
                    'receipt.po_num AS po_num',
                    'receipt.object_id AS object_id',
                    'receipt.contract_num AS contract_num',
                    'stock.item_id AS item_id',
                    'stock.stock_item AS stock_item',
                    'stock.item_desc AS item_desc',
                    'loc.loc_id AS loc_id',
                    'loc.loc AS loc',
                    'loc.box_loc AS box_loc',
                    'order.store_type AS store_type',
                    'order.cond AS cond',
                    'order.plan_qty AS plan_qty',
                    'order.actual_qty AS actual_qty',
                    'order.requested_by AS requested_by',
                    "DATE_FORMAT(order.requested_at, '%d/%m/%Y') AS requested_at",
                ])
                // 🔒 base condition
                .where('order.type = :type', { type: 'RECEIPT' })
                .orderBy('order.requested_at', 'ASC')
                .cache(false);

            // 🔥 true = status Waiting / false = all status except FINISHED/COMPLETED / undefined = all status
            if (options?.isExecution === true) {
                    // เฉพาะ WAITING
                    query.andWhere('order.status = :waitingStatus', {
                        waitingStatus: StatusOrders.WAITING,
                    });
                } else if (options?.isExecution === false) {
                    // ทุกสถานะ ยกเว้น WAITING และ FINISHED/COMPLETED
                    query.andWhere('order.status NOT IN (:...excludedStatuses)', {
                        excludedStatuses: [
                            StatusOrders.WAITING,
                            StatusOrders.FINISHED,
                            StatusOrders.COMPLETED
                        ],
                    });
                }
                // undefined → ไม่ใส่ where (ได้ทุกสถานะ)

            // 🔎 filter store_type
            if (options?.store_type) {
                query.andWhere('order.store_type = :store_type', {
                    store_type: options.store_type,
                });
            }

            // 🔎 filter mc_code
            if (options?.mc_code) {
                query.andWhere('order.mc_code = :mc_code', {
                    mc_code: options.mc_code,
                });
            }

            const rawData = await query.getRawMany();

            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('field.receipt'));
            }

            // ✅ normalize ค่าเหมือนเดิม
            const cleanedData = rawData.map((item: any) => ({
                ...item,
                actual_qty:
                    item.actual_qty != null && !isNaN(Number(item.actual_qty))
                        ? Number(item.actual_qty)
                        : 0,
            }));

            return response.setComplete(lang.msgFound('field.receipt'), cleanedData);

        } catch (error: any) {
            console.error(`Error in ${operation}:`, error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(
                    lang.msgErrorFunction(operation, error.message)
                );
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getReturnAll(
        options?: {
            isExecution?: boolean;   // ✅ true = status Waiting / false = all status except FINISHED/COMPLETED
            store_type?: string;
            mc_code?: string;
        },
        manager?: EntityManager
        ): Promise<ApiResponse<any | null>> {
    
        const response = new ApiResponse<any | null>();
        const operation = 'AllOrdersService.getReturnAll';

        try {
            const repository = manager
                ? manager.getRepository(Orders)
                : this.ordersRepository;

            const query = repository
                .createQueryBuilder('order')
                .leftJoin('orders_return', 'return', 'return.order_id = order.order_id')
                .leftJoin('orders_usage', 'usage', 'usage.usage_id = return.usage_id')
                .leftJoin('m_stock_items', 'stock', 'stock.item_id = order.item_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = order.loc_id')
                .select([
                    'order.order_id AS order_id',
                    'order.mc_code AS mc_code',
                    'order.type AS type',
                    'order.spr_no AS spr_no',
                    'order.status AS status',
                    'usage.usage_id AS usage_id',
                    'usage.work_order AS work_order',
                    'usage.usage_num AS usage_num',
                    'usage.line AS line',
                    'stock.item_id AS item_id',
                    'stock.stock_item AS stock_item',
                    'stock.item_desc AS item_desc',
                    'loc.loc_id AS loc_id',
                    'loc.loc AS loc',
                    'loc.box_loc AS box_loc',
                    'order.store_type AS store_type',
                    'order.cond AS cond',
                    'order.plan_qty AS plan_qty',
                    'order.actual_qty AS actual_qty',
                    'order.requested_by AS requested_by',
                    "DATE_FORMAT(order.requested_at, '%d/%m/%Y') AS requested_at",
                ])
                // 🔒 base condition
                .where('order.type = :type', { type: 'RETURN' })
                .orderBy('order.requested_at', 'ASC')
                .cache(false);

            // 🔥 true = status Waiting / false = all status except FINISHED/COMPLETED / undefined = all status
            if (options?.isExecution === true) {
                    // เฉพาะ WAITING
                    query.andWhere('order.status = :waitingStatus', {
                        waitingStatus: StatusOrders.WAITING,
                    });
                } else if (options?.isExecution === false) {
                    // ทุกสถานะ ยกเว้น WAITING และ FINISHED/COMPLETED
                    query.andWhere('order.status NOT IN (:...excludedStatuses)', {
                        excludedStatuses: [
                            StatusOrders.WAITING,
                            StatusOrders.FINISHED,
                            StatusOrders.COMPLETED
                        ],
                    });
                }
                // undefined → ไม่ใส่ where (ได้ทุกสถานะ)

            // 🔎 filter store_type
            if (options?.store_type) {
                query.andWhere('order.store_type = :store_type', {
                    store_type: options.store_type,
                });
            }

            // 🔎 filter mc_code
            if (options?.mc_code) {
                query.andWhere('order.mc_code = :mc_code', {
                    mc_code: options.mc_code,
                });
            }

            const rawData = await query.getRawMany();

            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('field.return'));
            }

            // ✅ normalize ค่าเหมือนเดิม
            const cleanedData = rawData.map((item: any) => ({
                ...item,
                actual_qty:
                    item.actual_qty != null && !isNaN(Number(item.actual_qty))
                        ? Number(item.actual_qty)
                        : 0,
            }));

            return response.setComplete(lang.msgFound('field.return'), cleanedData);

        } catch (error: any) {
            console.error(`Error in ${operation}:`, error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(
                    lang.msgErrorFunction(operation, error.message)
                );
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    // async getStatusAll(
    //     options?: {
    //         isExecution?: boolean;   
    //         // true = WAITING
    //         // false = exclude WAITING
    //         // undefined = all
    //         store_type?: string;
    //         mc_code?: string;
    //         type?: TypeInfm.RECEIPT | TypeInfm.USAGE | TypeInfm.RETURN | TypeInfm.TRANSFER;
    //     },
    //     manager?: EntityManager
    // ): Promise<ApiResponse<any | null>> {

    //     const response = new ApiResponse<any | null>();
    //     const operation = 'AllOrdersService.getStatusAll';

    //     try {
    //         const repository = manager
    //             ? manager.getRepository(Orders)
    //             : this.ordersRepository;

    //         const trxSubQuery = repository
    //             .createQueryBuilder()
    //             .select('trx.order_id', 'order_id')
    //             .addSelect('SUM(trx.total_cost * -1)', 'sum_total_cost')
    //             .addSelect('SUM(ABS(trx.qty))', 'sum_qty')
    //             .from('inventory_trx', 'trx')
    //             .groupBy('trx.order_id');

    //         const query = repository
    //             .createQueryBuilder('order')
                
    //             .leftJoin(
    //                 'orders_usage',
    //                 'usage',
    //                 `usage.order_id = order.order_id AND order.type = 'USAGE'`
    //             )
    //             .leftJoin(
    //                 'orders_receipt',
    //                 'receipt',
    //                 `receipt.order_id = order.order_id AND order.type = 'RECEIPT'`
    //             )

    //             .leftJoin(
    //                 'orders_return',
    //                 'return',
    //                 `return.order_id = order.order_id AND order.type = 'RETURN'`
    //             )

    //             .leftJoin(
    //                 'orders_transfer',
    //                 'transfer',
    //                 `transfer.order_id = order.order_id AND order.type = 'TRANSFER'`
    //             )

    //             .leftJoin('m_stock_items', 'stock', 'stock.item_id = order.item_id')
    //             // to location (order.loc_id)
    //             .leftJoin(
    //                 'm_location',
    //                 'loc_to',
    //                 'loc_to.loc_id = order.loc_id'
    //             )
    //             // from location (transfer.from_loc_id)
    //             .leftJoin(
    //                 'm_location',
    //                 'loc_from',
    //                 'loc_from.loc_id = transfer.from_loc_id'
    //             )
    //             .leftJoin(
    //                 '(' + trxSubQuery.getQuery() + ')',
    //                 'trx_sum',
    //                 'trx_sum.order_id = order.order_id'
    //             )
    //             .setParameters(trxSubQuery.getParameters())
    //             .select([
    //                 'order.order_id AS order_id',
    //                 'order.mc_code AS mc_code',
    //                 'order.type AS type',
    //                 'order.spr_no AS spr_no',

    //                 'usage.work_order AS work_order',
    //                 'usage.usage_id AS usage_id',
    //                 'usage.usage_num AS usage_num',
    //                 'usage.line AS line',
    //                 'usage.split AS split',

    //                 'receipt.po_num AS po_num',
    //                 'receipt.object_id AS object_id',

    //                 "DATE_FORMAT(order.requested_at, '%d/%m/%Y') AS requested_at",

    //                 'stock.item_id AS item_id',
    //                 'stock.stock_item AS stock_item',
    //                 'stock.item_desc AS item_desc',

    //                 'order.cond AS cond',
    //                 'order.store_type AS store_type',
    //                 'order.plan_qty AS plan_qty',
    //                 'order.actual_qty AS actual_qty',
    //                 'order.status AS status',

    //                 // ---- FROM ----
    //                 `
    //                 CASE
    //                     WHEN order.type = 'USAGE'
    //                         THEN loc_to.loc
    //                     WHEN order.type = 'TRANSFER'
    //                         THEN loc_from.loc
    //                     ELSE NULL
    //                 END AS from_loc
    //                 `,

    //                 `
    //                 CASE
    //                     WHEN order.type = 'USAGE'
    //                         THEN loc_to.box_loc
    //                     WHEN order.type = 'TRANSFER'
    //                         THEN loc_from.box_loc
    //                     ELSE NULL
    //                 END AS from_box_loc
    //                 `,

    //                 // ---- TO ----
    //                 `
    //                 CASE
    //                     WHEN order.type IN ('RECEIPT','RETURN','TRANSFER')
    //                         THEN loc_to.loc
    //                     ELSE NULL
    //                 END AS to_loc
    //                 `,

    //                 `
    //                 CASE
    //                     WHEN order.type IN ('RECEIPT','RETURN','TRANSFER')
    //                         THEN loc_to.box_loc
    //                     ELSE NULL
    //                 END AS to_box_loc
    //                 `,

    //                 // ✅ unit_cost
    //                 `
    //                 CASE
    //                     WHEN order.type = 'RECEIPT'
    //                     THEN receipt.unit_cost_handled

    //                     WHEN order.type IN ('USAGE','TRANSFER')
    //                         AND order.status IN ('FINISHED','COMPLETED')
    //                     THEN trx_sum.sum_total_cost / NULLIF(trx_sum.sum_qty, 0)

    //                     ELSE NULL
    //                 END AS unit_cost
    //                 `,

    //                 // ✅ total_cost
    //                 `
    //                 CASE
    //                     WHEN order.type = 'RECEIPT'
    //                     THEN receipt.unit_cost_handled * order.actual_qty

    //                     WHEN order.type IN ('USAGE','TRANSFER')
    //                         AND order.status IN ('FINISHED','COMPLETED')
    //                     THEN trx_sum.sum_total_cost

    //                     ELSE NULL
    //                 END AS total_cost
    //                 `,

    //                 // ✅ recond_qty
    //                 `
    //                 CASE
    //                     WHEN order.type = 'RECEIPT'
    //                         THEN COALESCE(receipt.recond_qty, 0)
    //                     WHEN order.type = 'TRANSFER'
    //                         THEN COALESCE(transfer.recond_qty, 0)
    //                     ELSE 0
    //                 END AS recond_qty
    //                 `

    //             ])
    //             .orderBy(`
    //                 CASE
    //                     WHEN order.status = 'PROCESSING' THEN 1
    //                     WHEN order.status = 'PENDING' THEN 3
    //                     WHEN order.status = 'COMPLETED' THEN 4
    //                     WHEN order.status = 'FINISHED' THEN 5
    //                     ELSE 2
    //                 END
    //             `, 'ASC')
    //             .addOrderBy('order.requested_at', 'ASC')
    //             .cache(false);
    //             //เรียงลำดับ PROCESSING > สถานะอื่นๆ > PENDING > COMPLETED > FINISHED

    //         // 🔥 status filter
    //         if (options?.isExecution === true) {
    //             // เฉพาะ WAITING
    //             query.andWhere('order.status = :waitingStatus', {
    //                 waitingStatus: StatusOrders.WAITING,
    //             });
    //         } else if (options?.isExecution === false) {
    //             // ทุกสถานะ ยกเว้น WAITING
    //             query.andWhere('order.status <> :waitingStatus', {
    //                 waitingStatus: StatusOrders.WAITING,
    //             });
    //         }
    //         // undefined → ไม่ใส่ where (ได้ทุกสถานะ)

    //         // 🔎 store_type
    //         if (options?.store_type) {
    //             query.andWhere('order.store_type = :store_type', {
    //                 store_type: options.store_type
    //             });
    //         }

    //         // 🔎 mc_code
    //         if (options?.mc_code) {
    //             query.andWhere('order.mc_code = :mc_code', {
    //                 mc_code: options.mc_code
    //             });
    //         }

    //         // 🔎 filter order.type
    //         if (options?.type) {
    //             query.andWhere('order.type = :type', {
    //                 type: options.type,
    //             });
    //         }
    //         const rawData = await query.getRawMany();

    //         if (!rawData || rawData.length === 0) {
    //             return response.setIncomplete(lang.msgNotFound('field.order'));
    //         }

    //         // ✅ normalize ถ้า cond มีค่า 'CAPITAL' > plan_qty | cond มีค่า 'NEW' = plan_qty
    //         const cleanedData = rawData.map((item: any) => {
    //             const planQty = Number(item.plan_qty || 0);

    //             const isCapital = item.cond === 'CAPITAL';
    //             const isNew = item.cond === 'NEW';

    //             return {
    //                 ...item,

    //                 from_loc: item.from_loc ?? "-",
    //                 from_box_loc: item.from_box_loc ?? "-",

    //                 to_loc: item.to_loc ?? "-",
    //                 to_box_loc: item.to_box_loc ?? "-",

    //                 spr_no: item.spr_no ?? "-",

    //                 work_order: item.work_order ?? "-",
    //                 usage_num: item.usage_num ?? "-",
    //                 line: item.line ?? "-",

    //                 po_num: item.po_num ?? "-",
    //                 object_id: item.object_id ?? "-",

    //                 // ---- qty ----
    //                 plan_qty: planQty,
    //                 actual_qty: Number(item.actual_qty || 0),

    //                 capital_qty: isCapital ? planQty : 0,
    //                 new_qty: isNew ? planQty : 0,

    //                 // ---- cost ----
    //                 unit_cost:
    //                     item.unit_cost != null
    //                         ? Number(Number(item.unit_cost).toFixed(2))
    //                         : 0.0,

    //                 total_cost:
    //                     item.total_cost != null
    //                         ? Number(Number(item.total_cost).toFixed(2))
    //                         : 0.0,

    //                 recond_qty:
    //                     item.recond_qty != null
    //                         ? Number(item.recond_qty)
    //                         : 0,

    //                 split:
    //                     item.split != null
    //                         ? Number(item.split)
    //                         : 0,
    //             };
    //         });

    //         return response.setComplete(
    //             lang.msgFound('field.order'),
    //             cleanedData
    //         );

    //     } catch (error: any) {
    //         console.error(`Error in ${operation}:`, error);

    //         if (error instanceof QueryFailedError) {
    //             return response.setIncomplete(
    //                 lang.msgErrorFunction(operation, error.message)
    //             );
    //         }

    //         throw new Error(lang.msgErrorFunction(operation, error.message));
    //     }
    // }

    async getStatusAll(
    options?: {
        isExecution?: boolean;
        store_type?: string;
        mc_code?: string;
        type?: TypeInfm.RECEIPT | TypeInfm.USAGE | TypeInfm.RETURN | TypeInfm.TRANSFER;
    },
    manager?: EntityManager
): Promise<ApiResponse<any | null>> {

    const response = new ApiResponse<any | null>();
    const operation = 'AllOrdersService.getStatusAll';

    try {
        const repository = manager
            ? manager.getRepository(Orders)
            : this.ordersRepository;

        // ----------------------------
        // sub query: inventory_trx summary
        // ----------------------------
        const trxSubQuery = repository
            .createQueryBuilder()
            .select('trx.order_id', 'order_id')
            .addSelect('SUM(trx.total_cost * -1)', 'sum_total_cost')
            .addSelect('SUM(ABS(trx.qty))', 'sum_qty')
            .from('inventory_trx', 'trx')
            .groupBy('trx.order_id');

        const query = repository
            .createQueryBuilder('order')

            // ----------------------------
            // USAGE (direct)
            // ----------------------------
            .leftJoin(
                'orders_usage',
                'usage_direct',
                `usage_direct.order_id = order.order_id AND order.type = 'USAGE'`
            )

            // ----------------------------
            // RETURN → orders_return → orders_usage
            // ----------------------------
            .leftJoin(
                'orders_return',
                'ret',
                `ret.order_id = order.order_id AND order.type = 'RETURN'`
            )
            .leftJoin(
                'orders_usage',
                'usage_from_return',
                `usage_from_return.usage_id = ret.usage_id`
            )

            // ----------------------------
            // RECEIPT / TRANSFER
            // ----------------------------
            .leftJoin(
                'orders_receipt',
                'receipt',
                `receipt.order_id = order.order_id AND order.type = 'RECEIPT'`
            )
            .leftJoin(
                'orders_transfer',
                'transfer',
                `transfer.order_id = order.order_id AND order.type = 'TRANSFER'`
            )

            // ----------------------------
            // master data
            // ----------------------------
            .leftJoin('m_stock_items', 'stock', 'stock.item_id = order.item_id')

            // to location
            .leftJoin(
                'm_location',
                'loc_to',
                'loc_to.loc_id = order.loc_id'
            )

            // from location (transfer)
            .leftJoin(
                'm_location',
                'loc_from',
                'loc_from.loc_id = transfer.from_loc_id'
            )

            // trx summary
            .leftJoin(
                '(' + trxSubQuery.getQuery() + ')',
                'trx_sum',
                'trx_sum.order_id = order.order_id'
            )
            .setParameters(trxSubQuery.getParameters())

            // ----------------------------
            // SELECT
            // ----------------------------
            .select([
                'order.order_id AS order_id',
                'order.mc_code AS mc_code',
                'order.type AS type',
                'order.spr_no AS spr_no',

                // ----------------------------
                // usage info (USAGE / RETURN)
                // ----------------------------
                `
                CASE
                    WHEN order.type = 'USAGE'
                        THEN usage_direct.work_order
                    WHEN order.type = 'RETURN'
                        THEN usage_from_return.work_order
                    ELSE NULL
                END AS work_order
                `,
                `
                CASE
                    WHEN order.type = 'USAGE'
                        THEN usage_direct.usage_id
                    WHEN order.type = 'RETURN'
                        THEN usage_from_return.usage_id
                    ELSE NULL
                END AS usage_id
                `,
                `
                CASE
                    WHEN order.type = 'USAGE'
                        THEN usage_direct.usage_num
                    WHEN order.type = 'RETURN'
                        THEN usage_from_return.usage_num
                    ELSE NULL
                END AS usage_num
                `,
                `
                CASE
                    WHEN order.type = 'USAGE'
                        THEN usage_direct.line
                    WHEN order.type = 'RETURN'
                        THEN usage_from_return.line
                    ELSE NULL
                END AS line
                `,
                `
                CASE
                    WHEN order.type = 'USAGE'
                        THEN usage_direct.split
                    WHEN order.type = 'RETURN'
                        THEN usage_from_return.split
                    ELSE NULL
                END AS split
                `,

                // receipt
                'receipt.po_num AS po_num',
                'receipt.object_id AS object_id',

                "DATE_FORMAT(order.requested_at, '%d/%m/%Y') AS requested_at",

                'stock.item_id AS item_id',
                'stock.stock_item AS stock_item',
                'stock.item_desc AS item_desc',

                'order.cond AS cond',
                'order.store_type AS store_type',
                'order.plan_qty AS plan_qty',
                'order.actual_qty AS actual_qty',
                'order.status AS status',

                // ----------------------------
                // FROM location
                // ----------------------------
                `
                CASE
                    WHEN order.type = 'USAGE'
                        THEN loc_to.loc
                    WHEN order.type = 'TRANSFER'
                        THEN loc_from.loc
                    ELSE NULL
                END AS from_loc
                `,
                `
                CASE
                    WHEN order.type = 'USAGE'
                        THEN loc_to.box_loc
                    WHEN order.type = 'TRANSFER'
                        THEN loc_from.box_loc
                    ELSE NULL
                END AS from_box_loc
                `,

                // ----------------------------
                // TO location
                // ----------------------------
                `
                CASE
                    WHEN order.type IN ('RECEIPT','RETURN','TRANSFER')
                        THEN loc_to.loc
                    ELSE NULL
                END AS to_loc
                `,
                `
                CASE
                    WHEN order.type IN ('RECEIPT','RETURN','TRANSFER')
                        THEN loc_to.box_loc
                    ELSE NULL
                END AS to_box_loc
                `,

                // ----------------------------
                // cost
                // ----------------------------
                `
                CASE
                    WHEN order.type = 'RECEIPT'
                        THEN receipt.unit_cost_handled
                    WHEN order.type IN ('USAGE','TRANSFER')
                        AND order.status IN ('FINISHED','COMPLETED')
                        THEN trx_sum.sum_total_cost / NULLIF(trx_sum.sum_qty, 0)
                    ELSE NULL
                END AS unit_cost
                `,
                `
                CASE
                    WHEN order.type = 'RECEIPT'
                        THEN receipt.unit_cost_handled * order.actual_qty
                    WHEN order.type IN ('USAGE','TRANSFER')
                        AND order.status IN ('FINISHED','COMPLETED')
                        THEN trx_sum.sum_total_cost
                    ELSE NULL
                END AS total_cost
                `,

                // recond
                `
                CASE
                    WHEN order.type = 'RECEIPT'
                        THEN COALESCE(receipt.recond_qty, 0)
                    WHEN order.type = 'TRANSFER'
                        THEN COALESCE(transfer.recond_qty, 0)
                    ELSE 0
                END AS recond_qty
                `
            ])

            // ----------------------------
            // order by
            // ----------------------------
            .orderBy(`
                CASE
                    WHEN order.status = 'PROCESSING' THEN 1
                    WHEN order.status = 'PENDING' THEN 3
                    WHEN order.status = 'COMPLETED' THEN 4
                    WHEN order.status = 'FINISHED' THEN 5
                    ELSE 2
                END
            `, 'ASC')
            .addOrderBy('order.requested_at', 'ASC')
            .cache(false);

        // ----------------------------
        // filters
        // ----------------------------
        if (options?.isExecution === true) {
            query.andWhere('order.status = :waiting', {
                waiting: StatusOrders.WAITING,
            });
        } else if (options?.isExecution === false) {
            query.andWhere('order.status <> :waiting', {
                waiting: StatusOrders.WAITING,
            });
        }

        if (options?.store_type) {
            query.andWhere('order.store_type = :store_type', {
                store_type: options.store_type
            });
        }

        if (options?.mc_code) {
            query.andWhere('order.mc_code = :mc_code', {
                mc_code: options.mc_code
            });
        }

        if (options?.type) {
            query.andWhere('order.type = :type', {
                type: options.type
            });
        }

        const rawData = await query.getRawMany();

        if (!rawData || rawData.length === 0) {
            return response.setIncomplete(lang.msgNotFound('field.order'));
        }

        // ----------------------------
        // normalize
        // ----------------------------
        const cleanedData = rawData.map((item: any) => {
            const planQty = Number(item.plan_qty || 0);
            const isCapital = item.cond === 'CAPITAL';
            const isNew = item.cond === 'NEW';

            return {
                ...item,
                from_loc: item.from_loc ?? "-",
                from_box_loc: item.from_box_loc ?? "-",
                to_loc: item.to_loc ?? "-",
                to_box_loc: item.to_box_loc ?? "-",

                spr_no: item.spr_no ?? "-",
                work_order: item.work_order ?? "-",
                usage_num: item.usage_num ?? "-",
                line: item.line ?? "-",
                po_num: item.po_num ?? "-",
                object_id: item.object_id ?? "-",

                plan_qty: planQty,
                actual_qty: Number(item.actual_qty || 0),

                capital_qty: isCapital ? planQty : 0,
                new_qty: isNew ? planQty : 0,

                unit_cost: item.unit_cost != null
                    ? Number(Number(item.unit_cost).toFixed(2))
                    : 0,

                total_cost: item.total_cost != null
                    ? Number(Number(item.total_cost).toFixed(2))
                    : 0,

                recond_qty: Number(item.recond_qty || 0),
                split: Number(item.split || 0),
            };
        });

        return response.setComplete(
            lang.msgFound('field.order'),
            cleanedData
        );

    } catch (error: any) {
        console.error(`Error in ${operation}:`, error);

        if (error instanceof QueryFailedError) {
            return response.setIncomplete(
                lang.msgErrorFunction(operation, error.message)
            );
        }

        throw error;
    }
}

}
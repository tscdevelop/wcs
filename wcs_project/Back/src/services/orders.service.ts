import { Repository, EntityManager, Not, QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/app-data-source';
import { ApiResponse } from '../models/api-response.model';
import * as lang from '../utils/LangHelper'; // Import LangHelper for specific functions
import * as validate from '../utils/ValidationUtils'; // Import ValidationUtils

import { Orders } from '../entities/orders.entity';
import { StatusOrders, TypeInfm } from '../common/global.enum';
import { OrdersLog } from '../entities/orders_log.entity';
import { T1MOrdersService } from './order_mrs.service';
import { OrdersLogService } from '../utils/logTaskEvent';
import { REPLCommand } from 'repl';
import { StockItems } from '../entities/m_stock_items.entity';
import { OrdersUsage } from '../entities/order_usage.entity';
import { OrdersReceipt } from '../entities/order_receipt.entity';
import { OrdersTransfer } from '../entities/order_transfer.entity';
import { Locations } from '../entities/m_location.entity';
import { s_user } from '../entities/s_user.entity';

interface CreateOrderInput extends Partial<Orders> {
    usage?: Partial<OrdersUsage>;
    receipt?: Partial<OrdersReceipt>;
    transfer?: Partial<OrdersTransfer>;
}

export class OrdersService {
    private ordersRepository: Repository<Orders>;
    private logRepository: Repository<OrdersLog>;
    private stockItemsRepository: Repository<StockItems>;
    private locationRepository: Repository<Locations>;
    private userRepository: Repository<s_user>;

    constructor(){
        this.ordersRepository = AppDataSource.getRepository(Orders);
        this.logRepository = AppDataSource.getRepository(OrdersLog);
        this.stockItemsRepository = AppDataSource.getRepository(StockItems);
        this.locationRepository = AppDataSource.getRepository(Locations);
        this.userRepository = AppDataSource.getRepository(s_user);
    }

    
    async create(data: CreateOrderInput, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<Orders>();
        const operation = 'OrdersService.create';

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

            const repository = useManager.getRepository(Orders);

            if (validate.isNullOrEmpty(data.type)) {
                return response.setIncomplete(lang.msgRequired('item.type'));
            }
            if (validate.isNullOrEmpty(data.item_id)) {
                return response.setIncomplete(lang.msgRequired('item.item_id'));
            }
            if (validate.isNullOrEmpty(data.mc_code)) {
                return response.setIncomplete(lang.msgRequired('item.mc_code'));
            }

            // ตรวจสอบว่ามี item_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingItem = await this.stockItemsRepository.findOne({ where: { item_id: data.item_id } });
            if (!existingItem) {
                return response.setIncomplete('stock item not found');
            }

            // ตรวจสอบว่ามี loc_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingLocation = await this.locationRepository.findOne({ where: { loc_id: data.loc_id } });
            if (!existingLocation) {
                return response.setIncomplete('location not found');
            }

            //เช็คเอา user_id
            const user = await this.userRepository.findOne({ where: { username: reqUsername } });
            if (!user) {
                return response.setIncomplete(lang.msgNotFound('user not found'));
            }

            // 👉 ดึง store_type จาก m_location
            const storeType = existingLocation.store_type;
            const user_id = user.user_id;

            const cleanedData: Partial<Orders> = {
                ...data,
                type: data.type?.toUpperCase() as any,
                requested_at: new Date(),
                requested_by: reqUsername,
                created_by_user_id: user_id,
                store_type: storeType
            };

            const entity = repository.create(cleanedData);

            // --- Save Entity ---
            const savedData = await repository.save(entity);
            
            // ------------------------------------
            //         SAVE SUB TABLE BY TYPE
            // ------------------------------------

            const type = cleanedData.type;
            
            if (type === TypeInfm.USAGE) {
                const usageRepo = useManager.getRepository(OrdersUsage);

                const usageEntity = usageRepo.create({
                    ...data.usage,                // ต้องส่งจาก frontend: data.usage = {...}
                    order_id: savedData.order_id
                });

                await usageRepo.save(usageEntity);
            }

            else if (type === TypeInfm.RECEIPT) {
                const rcptRepo = useManager.getRepository(OrdersReceipt);

                const receiptEntity = rcptRepo.create({
                    ...data.receipt,              // ต้องส่งจาก frontend: data.receipt = {...}
                    order_id: savedData.order_id
                });

                await rcptRepo.save(receiptEntity);
            }

            else if (type === TypeInfm.TRANSFER) {
                const transferRepo = useManager.getRepository(OrdersTransfer);

                const transferEntity = transferRepo.create({
                    ...data.transfer,             // ต้องส่งจาก frontend: data.transfer = {...}
                    order_id: savedData.order_id
                });

                await transferRepo.save(transferEntity);
            }

            // บันทึกลงใน table OrdersLog
            const logService = new OrdersLogService();
            await logService.logTaskEvent(useManager, savedData, { actor: reqUsername, status: StatusOrders.WAITING });
        
            if (!manager && queryRunner) await queryRunner.commitTransaction();

            return response.setComplete(lang.msgSuccessAction('created', 'item.waiting'), savedData);
        } catch (error: any) {
            if (!manager && queryRunner) await queryRunner.rollbackTransaction();
            console.error(`Error during ${operation}:`, error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw error;
        } finally {
            if (!manager && queryRunner) await queryRunner.release();
        }
    }

    async updateOrder(
        order_id: string,
        data: CreateOrderInput,
        reqUsername: string,
        manager?: EntityManager
    ): Promise<ApiResponse<Orders>> {
        const response = new ApiResponse<Orders>();
        const operation = 'OrdersService.updateOrder';

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
            const repository = useManager.getRepository(Orders);

            const existing = await repository.findOne({ where: { order_id } });
            if (!existing) {
                return response.setIncomplete(lang.msgNotFound('item.waiting'));
            }

            if (validate.isNullOrEmpty(data.type)) {
                return response.setIncomplete(lang.msgRequired('item.type'));
            }
            if (validate.isNullOrEmpty(data.item_id)) {
                return response.setIncomplete(lang.msgRequired('item.item_id'));
            }

            // ตรวจสอบว่ามี item_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingItem = await this.stockItemsRepository.findOne({ where: { item_id: data.item_id } });
            if (!existingItem) {
                return response.setIncomplete('stock item not found');
            }

            // ตรวจสอบว่ามี loc_id ปัจจุบันอยู่ในระบบหรือไม่
            const existingLocation = await this.locationRepository.findOne({ where: { loc_id: data.loc_id } });
            if (!existingLocation) {
                return response.setIncomplete('location not found');
            }

            //เช็คเอา user_id
            const user = await this.userRepository.findOne({ where: { username: reqUsername } });
            if (!user) {
                return response.setIncomplete(lang.msgNotFound('user not found'));
            }

            // 👉 ดึง store_type จาก m_location
            const storeType = existingLocation.store_type;
            const user_id = user.user_id;

            const cleanedData: Partial<Orders> = {
                ...data,
                updated_at: new Date(),
                requested_by: reqUsername,
                created_by_user_id: user_id,
                store_type: storeType
            };

            repository.merge(existing, cleanedData);
            const savedData = await repository.save(existing);

            // ----------------------------
            // 5. UPDATE SUB TABLE ตาม TYPE
            // ----------------------------
            const type = cleanedData.type;

            if (type === TypeInfm.USAGE && data.usage) {
                const usageRepo = useManager.getRepository(OrdersUsage);
                const existingUsage = await usageRepo.findOne({ where: { order_id } });

                if (existingUsage) {
                    usageRepo.merge(existingUsage, data.usage);
                    await usageRepo.save(existingUsage);
                }
            }

            else if (type === TypeInfm.RECEIPT && data.receipt) {
                const rcptRepo = useManager.getRepository(OrdersReceipt);
                const existingReceipt = await rcptRepo.findOne({ where: { order_id } });

                if (existingReceipt) {
                    rcptRepo.merge(existingReceipt, data.receipt);
                    await rcptRepo.save(existingReceipt);
                }
            }

            else if (type === TypeInfm.TRANSFER && data.transfer) {
                const transferRepo = useManager.getRepository(OrdersTransfer);
                const existingTransfer = await transferRepo.findOne({ where: { order_id } });

                if (existingTransfer) {
                    transferRepo.merge(existingTransfer, data.transfer);
                    await transferRepo.save(existingTransfer);
                }
            }

             // บันทึกลงใน table OrdersLog
            const logService = new OrdersLogService();
            await logService.logTaskEvent(useManager, savedData, { actor: reqUsername, status: StatusOrders.WAITING });
        

            if (!manager && queryRunner) await queryRunner.commitTransaction();

            return response.setComplete(lang.msgSuccessAction('updated', 'item.waiting'), savedData);
        } catch (error: any) {
            if (!manager && queryRunner) await queryRunner.rollbackTransaction();
            console.error(`Error during ${operation}:`, error);
            if (error instanceof QueryFailedError) return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            throw error;
        } finally {
            if (!manager && queryRunner) await queryRunner.release();
        }
    }

    async delete(order_id: string, reqUsername: string, manager?: EntityManager): Promise<ApiResponse<void>> {
        const response = new ApiResponse<void>();
        const operation = 'OrdersService.delete';

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
            const repository = useManager.getRepository(Orders);

            // ตรวจสอบว่า order_id นี้อยู่สถานะ WAITING และมีอยู่จริง
            const existing = await repository.findOne({
                where: { 
                    order_id: order_id.toString(),
                    status: StatusOrders.WAITING
                }
            });

            if (!existing) {
                return response.setIncomplete('You cannot delete this order because it has already started.');
            }

            // ------------------------------------
            //         DELETE ORDER LOG
            // ------------------------------------
            const logRepo = useManager.getRepository(OrdersLog);
            await logRepo.delete({ order_id: existing.order_id });

            // ------------------------------------
            //      DELETE SUB TABLE BY TYPE
            // ------------------------------------
            if (existing.type === TypeInfm.USAGE) {
                const usageRepo = useManager.getRepository(OrdersUsage);
                await usageRepo.delete({ order_id: existing.order_id });
            }

            else if (existing.type === TypeInfm.RECEIPT) {
                const rcptRepo = useManager.getRepository(OrdersReceipt);
                await rcptRepo.delete({ order_id: existing.order_id });
            }

            else if (existing.type === TypeInfm.TRANSFER) {
                const transferRepo = useManager.getRepository(OrdersTransfer);
                await transferRepo.delete({ order_id: existing.order_id });
            }

            // ------------------------------------
            //            DELETE MAIN ORDER
            // ------------------------------------
            await repository.remove(existing);

            if (!manager && queryRunner) await queryRunner.commitTransaction();

            return response.setComplete(lang.msgSuccessAction('deleted', 'item.waiting'));
        }

        catch (error: any) {
            if (!manager && queryRunner) await queryRunner.rollbackTransaction();
            console.error(`Error during ${operation}:`, error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }

        finally {
            if (!manager && queryRunner) await queryRunner.release();
        }
    }

    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'OrdersService.getAll';

        try {
            const repository = manager ? manager.getRepository(Orders) : this.ordersRepository;

            // Query order ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('order')
                .leftJoin('m_stock_items', 'stock', 'stock.item_id = order.item_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = order.loc_id')
                .select([
                    'order.order_id AS order_id',
                    'order.type AS type',
                    'order.mc_code AS mc_code',
                    'stock.item_id AS item_id',
                    'stock.stock_item As stock_item',
                    'stock.item_name AS item_name',
                    'stock.item_desc AS item_desc',
                    'loc.loc_id AS loc_id',
                    'loc.loc AS loc',
                    'loc.box_loc AS box_loc',
                    'order.cond AS cond',
                    'order.status AS status',
                    "DATE_FORMAT(order.requested_at, '%d/%m/%Y') AS requested_at",
                    "order.plan_qty AS plan_qty",
                    "order.actual_qty AS actual_qty",
                ])
                .where('order.status = :status', { status: 'WAITING' }) // ✅ ใช้ parameter binding
                .orderBy('order.requested_at', 'ASC') // ✅ เรียงจากเก่ามาใหม่
                .cache(false) // ✅ ปิด Query Cache
                .getRawMany();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('item.waiting'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('item.waiting'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getUsageAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'OrdersService.getUsageAll';

        try {
            const repository = manager ? manager.getRepository(Orders) : this.ordersRepository;

            const rawData = await repository.createQueryBuilder('order')
                .leftJoin('orders_usage', 'usage', 'usage.order_id = order.order_id')
                .leftJoin('m_stock_items', 'stock', 'stock.item_id = order.item_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = order.loc_id')
                .select([
                    'order.order_id AS order_id',
                    'order.type AS type',
                    'order.status AS status',
                    'usage.usage_id AS usage_id',
                    'usage.work_order AS work_order',
                    'usage.usage_num AS usage_num',
                    'usage.line AS line',
                    'usage.usage_type AS usage_type',
                    'usage.split AS split',
                    'stock.item_id AS item_id',
                    'stock.stock_item AS stock_item',
                    'stock.item_name AS item_name',
                    'loc.loc_id AS loc_id',
                    'loc.loc AS loc',
                    'loc.box_loc AS box_loc',
                    'loc.store_type AS store_type',
                    'order.cond AS cond',
                    'order.plan_qty AS plan_qty',
                    'order.actual_qty AS actual_qty',
                    'order.is_confirm AS is_confirm',
                    'order.requested_by AS requested_by',
                    "DATE_FORMAT(order.requested_at, '%d/%m/%Y') AS requested_at",
                ])
                .where('order.type = :type', { type: 'USAGE' })
                .orderBy('order.requested_at', 'ASC')
                .cache(false)
                .getRawMany();

            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('field.usage'));
            }

            // ✅ บังคับให้ actual_qty และ is_confirm เป็น 0 ถ้าไม่มีค่า
            const cleanedData = rawData.map((item: any) => ({
                ...item,
                actual_qty: item.actual_qty != null && !isNaN(Number(item.actual_qty)) ? Number(item.actual_qty) : 0,
                is_confirm: item.is_confirm != null && !isNaN(Number(item.is_confirm)) ? Number(item.is_confirm) : 0,
            }));

            return response.setComplete(lang.msgFound('field.usage'), cleanedData);
        } catch (error: any) {
            console.error('Error in getUsageAll:', error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getUsageById(order_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'OrdersService.getUsageById';

        try {
            const repository = manager ? manager.getRepository(Orders) : this.ordersRepository;

            const IdStr = String(order_id);

            const rawData = await repository.createQueryBuilder('order')
                .leftJoin('orders_usage', 'usage', 'usage.order_id = order.order_id')
                .leftJoin('m_stock_items', 'stock', 'stock.item_id = order.item_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = order.loc_id')
                .select([
                    'order.order_id AS order_id',
                    'order.type AS type',
                    'order.status AS status',
                    'order.mc_code AS mc_code',

                    'usage.usage_id AS usage_id',
                    'usage.work_order AS work_order',
                    'usage.usage_num AS usage_num',
                    'usage.line AS line',
                    'usage.usage_type AS usage_type',
                    'usage.split AS split',

                    'stock.item_id AS item_id',
                    'stock.stock_item AS stock_item',
                    'stock.item_name AS item_name',

                    'loc.loc_id AS loc_id',
                    'loc.loc AS loc',
                    'loc.box_loc AS box_loc',

                    'order.plan_qty AS plan_qty',
                    'order.cond AS cond',
                ])
                .where('order.order_id = :order_id', { order_id: IdStr })
                .andWhere('order.type = :type', { type: 'USAGE' })
                .getRawOne();

            if (!rawData)
                return response.setIncomplete(lang.msgNotFound('order.order_id'));

            return response.setComplete(lang.msgFound('order.order_id'), rawData);

        } catch (error: any) {
            console.error(`Error during ${operation}:`, error.message);
            if (error instanceof QueryFailedError)
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getReceiptAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'OrdersService.getReceiptAll';

        try {
            const repository = manager ? manager.getRepository(Orders) : this.ordersRepository;

            const rawData = await repository.createQueryBuilder('order')
                .leftJoin('orders_receipt', 'receipt', 'receipt.order_id = order.order_id')
                .leftJoin('m_stock_items', 'stock', 'stock.item_id = order.item_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = order.loc_id')
                .select([
                    'order.order_id AS order_id',
                    'order.type AS type',
                    'order.status AS status',
                    'stock.item_id AS item_id',
                    'stock.stock_item AS stock_item',
                    'stock.item_name AS item_name',
                    'stock.item_desc AS item_desc',
                    'loc.loc_id AS loc_id',
                    'loc.loc AS loc',
                    'loc.box_loc AS box_loc',
                    'loc.store_type AS store_type',
                    'receipt.receipt_id AS receipt_id',
                    'receipt.cat_qty AS cat_qty',
                    'receipt.recond_qty AS recond_qty',
                    'receipt.unit_cost_handled AS unit_cost_handled',
                    'receipt.contract_num AS contract_num',
                    'receipt.po_num AS po_num',
                    'receipt.object_id AS object_id',
                    'order.cond AS cond',
                    'order.plan_qty AS plan_qty',
                    'order.actual_qty AS actual_qty',
                    'order.is_confirm AS is_confirm',
                    'order.requested_by AS requested_by',
                    "DATE_FORMAT(order.requested_at, '%d/%m/%Y') AS requested_at",
                ])
                .where('order.type = :type', { type: 'RECEIPT' })
                .orderBy('order.requested_at', 'ASC')
                .cache(false)
                .getRawMany();

            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('field.receipt'));
            }

            // หลังจากดึง rawData แล้ว
            const cleanedData = rawData.map((item: any) => ({
                ...item,
                actual_qty: item.actual_qty != null && !isNaN(Number(item.actual_qty)) ? Number(item.actual_qty) : 0,
                is_confirm: item.is_confirm != null && !isNaN(Number(item.is_confirm)) ? Number(item.is_confirm) : 0,
                total_cost_handled: (item.unit_cost_handled || 0) * (item.plan_qty || 0), // ✅ คำนวณ total
            }));

            return response.setComplete(lang.msgFound('field.receipt'), cleanedData);
        } catch (error: any) {
            console.error('Error in getReceiptAll:', error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getReceiptById(order_id: number, manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'OrdersService.getReceiptById';

        try {
            const repository = manager ? manager.getRepository(Orders) : this.ordersRepository;
    
            const IdStr = String(order_id); // แปลงเป็น string

            // Query order ข้อมูลทั้งหมดในรูปแบบ raw data
            const rawData = await repository.createQueryBuilder('order')
                .leftJoin('orders_receipt', 'receipt', 'receipt.order_id = order.order_id')
                .leftJoin('m_stock_items', 'stock', 'stock.item_id = order.item_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = order.loc_id')
                .select([
                    'order.order_id AS order_id',
                    'order.type AS type',
                    'order.status AS status',
                    'order.mc_code AS mc_code',
                    'order.cond AS cond',
                    'order.plan_qty AS plan_qty',

                    'stock.item_id AS item_id',
                    'stock.stock_item AS stock_item',
                    'stock.item_name AS item_name',

                    'loc.loc_id AS loc_id',
                    'loc.loc AS loc',
                    'loc.box_loc AS box_loc',

                    'receipt.receipt_id AS receipt_id',
                    'receipt.cat_qty AS cat_qty',
                    'receipt.recond_qty AS recond_qty',
                    'receipt.contract_num AS contract_num',
                    'receipt.unit_cost_handled AS unit_cost_handled',
                    'receipt.po_num AS po_num',
                    'receipt.object_id AS object_id',
                ])
                .where('order.order_id = :order_id', { order_id: IdStr })
                .andWhere('order.type = :type', { type: 'RECEIPT' })
                .getRawOne();

            // หากไม่พบข้อมูล
            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('order.order_id'));
            }

            // ส่งข้อมูลกลับในรูปแบบ response
            return response.setComplete(lang.msgFound('order.order_id'), rawData);
        } catch (error: any) {
            console.error(`Error during ${operation}:`, error.message);
            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }
    
            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    async getMcCodeDropdown(manager?: EntityManager): Promise<ApiResponse<any>> {
        const response = new ApiResponse<any>();
        const operation = 'OrdersService.getMcCodeDropdown';

        try {
            const repository = manager
                ? manager.getRepository(Orders)
                : this.ordersRepository;

            const rawData = await repository
                .createQueryBuilder('o')
                .select('o.mc_code', 'mc_code')
                .where('o.mc_code IS NOT NULL')
                .andWhere('o.mc_code <> \'\'')
                .distinct(true)
                .orderBy('o.mc_code', 'ASC')
                .getRawMany();

            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(
                    lang.msgNotFound('item.mc_code')
                );
            }

            const data = rawData.map(r => ({
                value: r.mc_code,
                text: r.mc_code
            }));

            return response.setComplete(
                lang.msgFound('item.mc_code'),
                data
            );
        } catch (error: any) {
            console.error(`Error in ${operation}`, error);
            throw new Error(
                lang.msgErrorFunction(operation, error.message)
            );
        }
    }


}
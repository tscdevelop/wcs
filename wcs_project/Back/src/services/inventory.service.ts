import { EntityManager ,QueryFailedError, Repository} from "typeorm";
import { OrdersReceipt } from "../entities/order_receipt.entity";
import { OrdersTransfer } from "../entities/order_transfer.entity";
import { ApiResponse } from "../models/api-response.model";
import * as lang from '../utils/LangHelper';
import { AppDataSource } from "../config/app-data-source";
import { DeepPartial } from "typeorm";

import { Orders } from "../entities/orders.entity";
import { Inventory } from "../entities/inventory.entity";
import { StockItems } from "../entities/m_stock_items.entity";
import { InventoryTrx } from "../entities/inventory_transaction.entity";
import { TypeInfm } from "../common/global.enum";
import { Locations } from "../entities/m_location.entity";
import { OrdersUsage } from "../entities/order_usage.entity";
import { OrdersReturn } from "../entities/order_return.entity";
import { UsageInventory } from "../entities/order_usage_inv.entity";
import { ReturnInventory } from "../entities/order_return_inv.entity";

export class InventoryService {
    private inventoryRepo: Repository<Inventory>;
    private locationRepo: Repository<Locations>;

    constructor(){
        this.inventoryRepo = AppDataSource.getRepository(Inventory);
        this.locationRepo = AppDataSource.getRepository(Locations);
    }

//---------------------------------------
// 1) RECEIPT → เพิ่ม stock พร้อมราคาใหม่
//---------------------------------------    
async receipt(manager: EntityManager, order: Orders) {
    const invRepo = manager.getRepository(Inventory);
    const receiptRepo = manager.getRepository(OrdersReceipt);
    const trxRepo = manager.getRepository(InventoryTrx);
    const itemRepo = manager.getRepository(StockItems);
    const locRepo = manager.getRepository(Locations);

    // 1) load receipt
    const r = await receiptRepo.findOne({
        where: { order_id: order.order_id }
    });

    if (!r) {
        throw new Error(`OrdersReceipt not found for order ${order.order_id}`);
    }

    if (!order.actual_qty || order.actual_qty <= 0) {
        throw new Error(`Invalid actual_qty for order ${order.order_id}`);
    }

    const unitCost = Number(Number(r.unit_cost_handled).toFixed(2));

    // 2) load master data (for log only)
    const item = await itemRepo.findOne({
        where: { item_id: order.item_id },
        select: ['stock_item']
    });

    const loc = await locRepo.findOne({
        where: { loc_id: order.loc_id },
        select: ['loc', 'box_loc']
    });

    // 3️⃣ CREATE NEW INVENTORY (always)
    const newInv = invRepo.create({
        item_id: order.item_id,
        loc_id: order.loc_id,
        receipt_id: r.receipt_id,          // 🔥 key point
        unit_cost_inv: unitCost,
        inv_qty: order.actual_qty,
        total_cost_inv: Number(
            (unitCost * order.actual_qty).toFixed(2)
        ),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
    });

    const savedInv = await invRepo.save(newInv);

    // 4️⃣ INSERT INVENTORY TRANSACTION (LOG)
    const trx = Object.assign(new InventoryTrx(), {
        inv_id: savedInv.inv_id,
        order_id: order.order_id,
        order_type: TypeInfm.RECEIPT,

        item_id: order.item_id,
        stock_item: item?.stock_item ?? null,

        loc_id: order.loc_id,
        loc: loc?.loc ?? null,
        box_loc: loc?.box_loc ?? null,

        qty: order.actual_qty,
        unit_cost: unitCost,
        total_cost: Number(
            (unitCost * order.actual_qty).toFixed(2)
        ),
    });

    await trxRepo.save(trx);

    return savedInv;
}


//---------------------------------------
// 2) USAGE → ตัด stock แบบ FIFO (ไม่มีราคาใน order)
//---------------------------------------

async usage(
    manager: EntityManager,
    order: Orders,
    inv_id: number
    ) {
    const invRepo = manager.getRepository(Inventory);
    const trxRepo = manager.getRepository(InventoryTrx);
    const usageRepo = manager.getRepository(OrdersUsage);
    const usageInvRepo = manager.getRepository(UsageInventory);
    const stockItemRepo = manager.getRepository(StockItems);
    const locRepo = manager.getRepository(Locations);

    if (!order.actual_qty || order.actual_qty <= 0) {
        throw new Error("actual_qty must be > 0");
    }

    if (!inv_id) {
        throw new Error("inv_id is required");
    }

    // ----------------------------
    // 1) load usage
    // ----------------------------
    const usage = await usageRepo.findOne({
        where: { order_id: order.order_id },
    });

    if (!usage) {
        throw new Error(`OrdersUsage not found for order ${order.order_id}`);
    }

    // ----------------------------
    // 2) lock inventory by inv_id (from frontend)
    // ----------------------------
    const inv = await invRepo.findOne({
        where: { inv_id },
        lock: { mode: "pessimistic_write" },
    });

    if (!inv) {
        throw new Error(`Inventory not found (inv_id=${inv_id})`);
    }

    if (inv.inv_qty < order.actual_qty) {
        throw new Error(
        `Not enough stock in inventory ${inv.inv_id} (available=${inv.inv_qty}, required=${order.actual_qty})`
        );
    }

    // ----------------------------
    // 3) load master data (for log)
    // ----------------------------
    const stockItem = await stockItemRepo.findOne({
        where: { item_id: order.item_id },
        select: ["stock_item"],
    });

    const loc = await locRepo.findOne({
        where: { loc_id: inv.loc_id },
    });

    // ----------------------------
    // 4) update inventory
    // ----------------------------
    inv.inv_qty -= order.actual_qty;
    inv.total_cost_inv = Number(
        (inv.inv_qty * inv.unit_cost_inv).toFixed(2)
    );
    inv.updated_at = new Date();

    await invRepo.save(inv);

    // ----------------------------
    // 5) save usage_inventory
    // ----------------------------
    await usageInvRepo.save({
        usage_id: usage.usage_id,
        inv_id: inv.inv_id,
        qty: order.actual_qty,
    });

    // ----------------------------
    // 6) insert inventory transaction (USAGE)
    // ----------------------------
    const trx = Object.assign(new InventoryTrx(), {
        inv_id: inv.inv_id,
        order_id: order.order_id,
        order_type: TypeInfm.USAGE,

        item_id: inv.item_id,
        stock_item: stockItem?.stock_item ?? null,

        loc_id: inv.loc_id,
        loc: loc?.loc ?? null,
        box_loc: loc?.box_loc ?? null,

        qty: -order.actual_qty,
        unit_cost: inv.unit_cost_inv,
        total_cost: Number(
        (-order.actual_qty * inv.unit_cost_inv).toFixed(2)
        ),
    });

    await trxRepo.save(trx);

    return true;
}



//---------------------------------------
// 3) RETURN → เพิ่ม stock (เหมือน receipt แต่ผูกกับ usage)
//---------------------------------------
async return(
    manager: EntityManager,
    order: Orders,
    inv_id: number
    ) {
    const invRepo = manager.getRepository(Inventory);
    const trxRepo = manager.getRepository(InventoryTrx);
    const returnRepo = manager.getRepository(OrdersReturn);
    const usageRepo = manager.getRepository(OrdersUsage);
    const usageInvRepo = manager.getRepository(UsageInventory);
    const returnInvRepo = manager.getRepository(ReturnInventory);
    const itemRepo = manager.getRepository(StockItems);
    const locRepo = manager.getRepository(Locations);

    if (!order.actual_qty || order.actual_qty <= 0) {
        throw new Error(`Invalid actual_qty for return order ${order.order_id}`);
    }

    if (!inv_id) {
        throw new Error(`inv_id is required`);
    }

    // ------------------------------------------------
    // 1) load orders_return
    // ------------------------------------------------
    const orderReturn = await returnRepo.findOne({
        where: { order_id: order.order_id },
    });

    if (!orderReturn || !orderReturn.usage_id) {
        throw new Error(`orders_return not found or usage_id missing`);
    }

    // ------------------------------------------------
    // 2) load usage (หลัก)
    // ------------------------------------------------
    const usage = await usageRepo.findOne({
        where: { usage_id: orderReturn.usage_id },
    });

    if (!usage) {
        throw new Error(`orders_usage ${orderReturn.usage_id} not found`);
    }

    // ------------------------------------------------
    // 3) หา usage_inventory จาก usage_id + inv_id
    // ------------------------------------------------
    const usageInv = await usageInvRepo.findOne({
        where: {
        usage_id: usage.usage_id,
        inv_id: inv_id,
        },
    });

    if (!usageInv) {
        throw new Error(
        `usage_inventory not found (usage_id=${usage.usage_id}, inv_id=${inv_id})`
        );
    }

    // ------------------------------------------------
    // 4) calculate already returned qty (per usage_inv)
    // ------------------------------------------------
    const returnedSum = await returnInvRepo
        .createQueryBuilder('ri')
        .select('COALESCE(SUM(ri.return_qty),0)', 'sum')
        .where('ri.usage_inv_id = :usageInvId', {
        usageInvId: usageInv.usage_inv_id,
        })
        .getRawOne();

    const returnedQty = Number(returnedSum.sum);
    if (usageInv.usage_qty == null) {
    throw new Error(
        `usage_inventory ${usageInv.usage_inv_id} has no usage_qty`
    );
    }

    const availableQty = usageInv.usage_qty - returnedQty;

    if (order.actual_qty > availableQty) {
        throw new Error(
        `Return qty exceeds available (${availableQty})`
        );
    }

    // ------------------------------------------------
    // 5) lock inventory
    // ------------------------------------------------
    const inv = await invRepo.findOne({
        where: { inv_id },
        lock: { mode: 'pessimistic_write' },
    });

    if (!inv) {
        throw new Error(`Inventory ${inv_id} not found`);
    }

    // ------------------------------------------------
    // 6) update inventory
    // ------------------------------------------------
    inv.inv_qty += order.actual_qty;
    inv.total_cost_inv = Number(
        (inv.inv_qty * inv.unit_cost_inv).toFixed(2)
    );
    inv.updated_at = new Date();

    await invRepo.save(inv);

    // ------------------------------------------------
    // 7) save return_inventory (detail)
    // ------------------------------------------------
    await returnInvRepo.save({
        return_id: orderReturn.return_id,
        usage_inv_id: usageInv.usage_inv_id,
        return_qty: order.actual_qty,
    });

    // ------------------------------------------------
    // 8) load display info
    // ------------------------------------------------
    const item = await itemRepo.findOne({
        where: { item_id: inv.item_id },
        select: ['stock_item'],
    });

    const loc = await locRepo.findOne({
        where: { loc_id: inv.loc_id },
    });

    // ------------------------------------------------
    // 9) insert inventory_trx (RETURN)
    // ------------------------------------------------
    const trx = Object.assign(new InventoryTrx(), {
        inv_id: inv.inv_id,
        order_id: order.order_id,
        order_type: TypeInfm.RETURN,

        item_id: inv.item_id,
        stock_item: item?.stock_item ?? null,

        loc_id: inv.loc_id,
        loc: loc?.loc ?? null,
        box_loc: loc?.box_loc ?? null,

        qty: order.actual_qty,
        unit_cost: inv.unit_cost_inv,
        total_cost: Number(
        (order.actual_qty * inv.unit_cost_inv).toFixed(2)
        ),
    });

    await trxRepo.save(trx);

    return inv;
}




//---------------------------------------
// 4) TRANSFER → ตัดจาก loc A (FIFO) + เพิ่มใน loc B ตามราคาเดิม
//---------------------------------------
async transfer(manager: EntityManager, order: Orders) {
    const invRepo = manager.getRepository(Inventory);
    const trxRepo = manager.getRepository(InventoryTrx);
    const transferRepo = manager.getRepository(OrdersTransfer);
    const stockItemRepo = manager.getRepository(StockItems);
    const locRepo = manager.getRepository(Locations);

    if (!order.actual_qty || order.actual_qty <= 0) {
        throw new Error("actual_qty must be > 0");
    }

    const t = await transferRepo.findOne({
        where: { order_id: order.order_id }
    });

    if (!t) {
        throw new Error(`OrdersTransfer not found for order ${order.order_id}`);
    }

    const fromLoc = t.from_loc_id;
    const toLoc = order.loc_id;
    const qtyToMoveTotal = order.actual_qty;

    // ----------------------------
    // lookup สำหรับ log
    // ----------------------------
    const stockItem = await stockItemRepo.findOne({
        where: { item_id: order.item_id },
        select: ['stock_item']
    });

    const fromLocInfo = await locRepo.findOne({ where: { loc_id: fromLoc } });
    const toLocInfo = await locRepo.findOne({ where: { loc_id: toLoc } });

    // ----------------------------
    // 1) ดึง inventory ต้นทาง FIFO + lock
    // ----------------------------
    const sourceList = await invRepo
        .createQueryBuilder("inv")
        .setLock("pessimistic_write")
        .where("inv.item_id = :item_id", { item_id: order.item_id })
        .andWhere("inv.loc_id = :loc_id", { loc_id: fromLoc })
        .orderBy("inv.created_at", "ASC")
        .getMany();

    if (sourceList.length === 0) {
        throw new Error(`No inventory found at from_loc_id ${fromLoc}`);
    }

    // ----------------------------
    // 2) ตรวจ stock รวม
    // ----------------------------
    const totalStock = sourceList.reduce((sum, inv) => sum + inv.inv_qty, 0);

    if (totalStock < qtyToMoveTotal) {
        throw new Error("Not enough stock to transfer");
    }

    // ----------------------------
    // 3) FIFO transfer
    // ----------------------------
    let qtyToMove = qtyToMoveTotal;

    for (const src of sourceList) {
        if (qtyToMove <= 0) break;

        const moveQty = Math.min(src.inv_qty, qtyToMove);
        qtyToMove -= moveQty;

        const unitCost = Number(src.unit_cost_inv.toFixed(2));

        // ----------------------------
        // 3.1) ตัดต้นทาง
        // ----------------------------
        src.inv_qty -= moveQty;
        src.total_cost_inv = Number(
            (src.inv_qty * unitCost).toFixed(2)
        );
        src.updated_at = new Date();
        const savedSrc = await invRepo.save(src);

        // 🔻 inventory transaction (OUT)
        await trxRepo.save(
            trxRepo.create({
                inv_id: savedSrc.inv_id,
                order_id: order.order_id,
                order_type: TypeInfm.TRANSFER,
                item_id: order.item_id,
                stock_item: stockItem?.stock_item ?? undefined,
                loc_id: fromLoc,
                loc: fromLocInfo?.loc ?? undefined,
                box_loc: fromLocInfo?.box_loc ?? undefined,
                qty: -moveQty,
                unit_cost: unitCost,
                total_cost: Number(
                    (-moveQty * unitCost).toFixed(2)
                )
            })
        );

        // ----------------------------
        // 3.2) เพิ่มปลายทาง (merge ตาม cost)
        // ----------------------------
        let dest = await invRepo.findOne({
            where: {
                item_id: order.item_id,
                loc_id: toLoc,
                unit_cost_inv: unitCost
            }
        });

        if (dest) {
            dest.inv_qty += moveQty;
            dest.total_cost_inv = Number(
                (dest.inv_qty * unitCost).toFixed(2)
            );
            dest.updated_at = new Date();
            dest = await invRepo.save(dest);
        } else {
            dest = await invRepo.save(
                invRepo.create({
                    item_id: order.item_id,
                    loc_id: toLoc,
                    unit_cost_inv: unitCost,
                    inv_qty: moveQty,
                    total_cost_inv: Number(
                        (moveQty * unitCost).toFixed(2)
                    ),
                    updated_at: new Date()
                })
            );
        }

        // 🔺 inventory transaction (IN)
        await trxRepo.save(
            trxRepo.create({
                inv_id: dest.inv_id,
                order_id: order.order_id,
                order_type: TypeInfm.TRANSFER,
                item_id: order.item_id,
                stock_item: stockItem?.stock_item ?? undefined,
                loc_id: toLoc,
                loc: toLocInfo?.loc ?? undefined,
                box_loc: toLocInfo?.box_loc ?? undefined,
                qty: moveQty,
                unit_cost: unitCost,
                total_cost: Number(
                    (moveQty * unitCost).toFixed(2)
                )
            })
        );
    }

    return true;
}



    // ดึงข้อมูลมาแสดงผลในหน้า inventory balance แบบ stock item view
    // กรุ๊ปตาม item_id, loc_id, mc_code, org_id, dept, cond, item_status
    async getAll(manager?: EntityManager): Promise<ApiResponse<any | null>> {
        const response = new ApiResponse<any | null>();
        const operation = 'InventoryService.getAll';

        try {
            const repository = manager ? manager.getRepository(Inventory): this.inventoryRepo;

            // Query ข้อมูลทั้งหมด
            const rawData = await repository
                .createQueryBuilder('inv')
                .leftJoin('m_stock_items', 'stock', 'stock.item_id = inv.item_id')
                .leftJoin('m_location', 'loc', 'loc.loc_id = inv.loc_id')
                .leftJoin('orders_receipt', 'receipt', 'receipt.receipt_id = inv.receipt_id')
                .leftJoin('orders', 'o', 'o.order_id = receipt.order_id')
                .select([
                    'inv.item_id AS item_id',
                    'stock.stock_item AS stock_item',
                    'stock.item_desc AS item_desc',

                    'inv.loc_id AS loc_id',
                    'loc.loc AS loc',
                    'loc.box_loc AS box_loc',

                    'stock.item_status AS item_status',
                    'inv.org_id AS org_id',
                    'inv.dept AS dept',

                    'o.mc_code AS mc_code',
                    'o.cond AS cond',

                    // 👇 inv_id ที่ถูกนำมารวม
                    "GROUP_CONCAT(CAST(inv.inv_id AS CHAR) SEPARATOR ',') AS inv_ids",

                    // 🔢 รวมจำนวน
                    'SUM(inv.inv_qty) AS total_inv_qty',

                    // 💰 รวมต้นทุน
                    'SUM(inv.total_cost_inv) AS total_cost_inv',

                    // ⭐ ค่าเฉลี่ยถ่วงน้ำหนัก (ถ้า null ให้เป็น 0)
                    'COALESCE(ROUND(SUM(inv.total_cost_inv) / NULLIF(SUM(inv.inv_qty), 0), 4), 0) AS avg_unit_cost'
                ])
                .groupBy('inv.item_id')
                .addGroupBy('inv.loc_id')
                .addGroupBy('o.mc_code')
                .addGroupBy('inv.org_id')
                .addGroupBy('inv.dept')
                .addGroupBy('o.cond')
                .addGroupBy('stock.item_status')
                .addGroupBy('stock.stock_item')
                .addGroupBy('stock.item_desc')
                .addGroupBy('loc.loc')
                .addGroupBy('loc.box_loc')
                .getRawMany();

            if (!rawData || rawData.length === 0) {
                return response.setIncomplete(lang.msgNotFound('inventory'));
            }

            return response.setComplete(lang.msgFound('inventory'), rawData);
        } catch (error: any) {
            console.error('Error in getAll:', error);

            if (error instanceof QueryFailedError) {
                return response.setIncomplete(lang.msgErrorFunction(operation, error.message));
            }

            throw new Error(lang.msgErrorFunction(operation, error.message));
        }
    }

    // จัดกลุ่มตาม location ID ( item_id, mc_code, org_id, dept, cond, item_status )
    async getByLoc(manager?: EntityManager): Promise<ApiResponse<any | null>> {
    const response = new ApiResponse<any | null>();
    const operation = 'InventoryService.getByLoc';

    try {
        const locRepo = manager
            ? manager.getRepository(Location)
            : this.locationRepo;

        const rows = await locRepo
            .createQueryBuilder('loc')
            .leftJoin('inventory', 'inv', 'inv.loc_id = loc.loc_id')
            .leftJoin('m_stock_items', 'stock', 'stock.item_id = inv.item_id')
            .leftJoin('orders_receipt', 'receipt', 'receipt.receipt_id = inv.receipt_id')
            .leftJoin('orders', 'o', 'o.order_id = receipt.order_id')
            .select([
                // 📍 location
                'loc.loc_id AS loc_id',
                'loc.loc AS loc',
                'loc.box_loc AS box_loc',

                // 📦 inventory group key
                'inv.item_id AS item_id',
                'o.mc_code AS mc_code',
                'inv.org_id AS org_id',
                'inv.dept AS dept',
                'o.cond AS cond',
                'stock.item_status AS item_status',

                'stock.stock_item AS stock_item',
                'stock.item_desc AS item_desc',

                // 🔢 aggregate
                "GROUP_CONCAT(inv.inv_id SEPARATOR ',') AS inv_ids",
                'SUM(inv.inv_qty) AS total_inv_qty',
                'SUM(inv.total_cost_inv) AS total_cost_inv',
                'COALESCE(ROUND(SUM(inv.total_cost_inv) / NULLIF(SUM(inv.inv_qty),0),4),0) AS avg_unit_cost'
            ])
            .groupBy('loc.loc_id')
            .addGroupBy('loc.loc')
            .addGroupBy('loc.box_loc')

            .addGroupBy('inv.item_id')
            .addGroupBy('o.mc_code')
            .addGroupBy('inv.org_id')
            .addGroupBy('inv.dept')
            .addGroupBy('o.cond')
            .addGroupBy('stock.item_status')
            .getRawMany();

        // 🔄 จัดรูปแบบ nested
        const result = Object.values(
            rows.reduce((acc: any, row: any) => {
                const locKey = row.loc_id;

                if (!acc[locKey]) {
                    acc[locKey] = {
                        loc_id: row.loc_id,
                        loc: row.loc,
                        box_loc: row.box_loc,
                        items: []
                    };
                }

                // ⚠️ location ที่ไม่มี inventory → item_id จะเป็น null
                if (row.item_id !== null) {
                    acc[locKey].items.push({
                        item_id: row.item_id,
                        mc_code: row.mc_code,
                        org_id: row.org_id,
                        dept: row.dept,
                        cond: row.cond,
                        item_status: row.item_status,

                        inv_ids: row.inv_ids
                            ? row.inv_ids.split(',').map((id: string) => Number(id))
                            : [],

                        total_inv_qty: Number(row.total_inv_qty ?? 0),
                        total_cost_inv: Number(row.total_cost_inv ?? 0),
                        avg_unit_cost: Number(row.avg_unit_cost ?? 0)
                    });
                }

                return acc;
            }, {})
        );

        // ✅ list API → ไม่มีข้อมูล = array ว่าง
        return response.setComplete(lang.msgFound('inventory'), result);

    } catch (error: any) {
        console.error('Error in getByLoc:', error);

        if (error instanceof QueryFailedError) {
            return response.setIncomplete(
                lang.msgErrorFunction(operation, error.message)
            );
        }

        throw new Error(lang.msgErrorFunction(operation, error.message));
    }
}


}


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

export class InventoryService {
    private inventoryRepo: Repository<Inventory>;

    constructor(){
        this.inventoryRepo = AppDataSource.getRepository(Inventory);
    }

    //---------------------------------------
    // 1) RECEIPT → เพิ่ม stock พร้อมราคาใหม่
    //---------------------------------------
    // async receipt(manager: EntityManager, order: Orders) {
    //     const invRepo = manager.getRepository(Inventory);
    //     const receiptRepo = manager.getRepository(OrdersReceipt);

    //     // ดึงราคา unit cost จาก table orders_receipt (สำคัญ)
    //     const r = await receiptRepo.findOne({
    //         where: { order_id: order.order_id }
    //     });

    //     if (!r) {
    //         throw new Error(`OrdersReceipt not found for order ${order.order_id}`);
    //     }

    //     const unitCost = r.unit_cost_handled; // ⭐ ราคาจริงจากการรับเข้า receipt

    //     // หาว่ามี record แบบเดียวกันไหม
    //     const existing = await invRepo.findOne({
    //         where: {
    //             item_id: order.item_id,
    //             loc_id: order.loc_id,
    //             unit_cost_inv: unitCost
    //         }
    //     });

    //     if (existing) {
    //         existing.inv_qty += order.actual_qty!;
    //         existing.total_cost_inv = existing.unit_cost_inv * existing.inv_qty;  // ⭐ เพิ่มผลรวม
    //         existing.updated_at = new Date();
    //         return await invRepo.save(existing);
    //     }

    //     // ถ้าไม่มี → สร้างใหม่
    //     const newInv = invRepo.create({
    //         item_id: order.item_id,
    //         loc_id: order.loc_id,
    //         unit_cost_inv: unitCost,
    //         inv_qty: order.actual_qty,
    //         total_cost_inv: unitCost * (order.actual_qty ?? 0),
    //         updated_at: new Date()
    //     });

    //     return await invRepo.save(newInv);
    // }

//---------------------------------------
// 1) RECEIPT → เพิ่ม stock พร้อมราคาใหม่
//---------------------------------------    
async receipt(manager: EntityManager, order: Orders) {
    const invRepo = manager.getRepository(Inventory);
    const receiptRepo = manager.getRepository(OrdersReceipt);
    const trxRepo = manager.getRepository(InventoryTrx);
    const itemRepo = manager.getRepository(StockItems);
    const locRepo = manager.getRepository(Locations);

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

    // --- load master data (for log only) ---
    const items = await itemRepo.findOne({
        where: { item_id: order.item_id },
        select: ['stock_item']
    });

    const loc = await locRepo.findOne({
        where: { loc_id: order.loc_id },
        select: ['loc', 'box_loc']
    });

    // --- 1️⃣ update inventory ---
    const existing = await invRepo.findOne({
        where: {
            item_id: order.item_id,
            loc_id: order.loc_id,
            unit_cost_inv: unitCost.toFixed(2) as any
        }
    });

    let savedInv: Inventory;

    if (existing) {
        existing.inv_qty += order.actual_qty;
        existing.total_cost_inv = Number(
            (existing.inv_qty * unitCost).toFixed(2)
        );
        existing.updated_at = new Date();

        savedInv = await invRepo.save(existing);
    } else {
        const newInv = invRepo.create({
            item_id: order.item_id,
            loc_id: order.loc_id,
            unit_cost_inv: unitCost,
            inv_qty: order.actual_qty,
            total_cost_inv: Number(
                (unitCost * order.actual_qty).toFixed(2)
            ),
            updated_at: new Date()
        });

        savedInv = await invRepo.save(newInv);
    }

    // --- 2️⃣ insert inventory transaction (LOG) ---
    const trx = trxRepo.create({
        inv_id: savedInv.inv_id,
        order_id: order.order_id,
        order_type: TypeInfm.RECEIPT,

        item_id: order.item_id,
        stock_item: items?.stock_item ?? null,

        loc_id: order.loc_id,
        loc: loc?.loc ?? null,
        box_loc: loc?.box_loc ?? null,

        qty: order.actual_qty,
        unit_cost: unitCost,
        total_cost: Number(
            (order.actual_qty * unitCost).toFixed(2)
        ),
    } as DeepPartial<InventoryTrx>);

    await trxRepo.save(trx);

    return savedInv;
}

    //---------------------------------------
    // 2) USAGE → ตัด stock แบบ FIFO เพราะไม่มีราคาใน order
    //---------------------------------------
    // async usage(manager: EntityManager, order: Orders) {
    //     const invRepo = manager.getRepository(Inventory);
    //     const stockItemRepo = manager.getRepository(StockItems); // ⭐ เพิ่ม

    //     // ----------------------------
    //     // 1) หา stock_item จาก item_id
    //     // ----------------------------
    //     const stockItem = await stockItemRepo.findOne({
    //         where: { item_id: order.item_id },
    //         select: ['stock_item'] // เอาเฉพาะที่ใช้
    //     });

    //     const stockItemCode = stockItem?.stock_item ?? order.item_id;

    //     // ----------------------------
    //     // 2) ดึง inventory FIFO
    //     // ----------------------------
    //     const invList = await invRepo.find({
    //         where: {
    //             item_id: order.item_id,
    //             loc_id: order.loc_id
    //         },
    //         order: { unit_cost_inv: 'ASC' }
    //     });

    //     let qtyToRemove = order.actual_qty ?? 0;

    //     for (const inv of invList) {
    //         if (qtyToRemove <= 0) break;

    //         if (inv.inv_qty >= qtyToRemove) {
    //             inv.inv_qty -= qtyToRemove;
    //             inv.total_cost_inv = inv.unit_cost_inv * inv.inv_qty;
    //             qtyToRemove = 0;
    //         } else {
    //             qtyToRemove -= inv.inv_qty;
    //             inv.inv_qty = 0;
    //             inv.total_cost_inv = 0;
    //         }

    //         inv.updated_at = new Date();
    //         await invRepo.save(inv);
    //     }

    //     // ----------------------------
    //     // 3) Stock ไม่พอ → throw error
    //     // ----------------------------
    //     if (qtyToRemove > 0) {
    //         throw new Error(`Not enough stock for item ${stockItemCode}`);
    //     }

    //     return true;
    // }

//---------------------------------------
// 2) USAGE → ตัด stock แบบ FIFO (ไม่มีราคาใน order)
//---------------------------------------

async usage(manager: EntityManager, order: Orders) {
    const invRepo = manager.getRepository(Inventory);
    const trxRepo = manager.getRepository(InventoryTrx);
    const stockItemRepo = manager.getRepository(StockItems);
    const locRepo = manager.getRepository(Locations);

    if (!order.actual_qty || order.actual_qty <= 0) {
        throw new Error("actual_qty must be > 0");
    }

    // ----------------------------
    // 1) stock item (for display / log)
    // ----------------------------
    const stockItem = await stockItemRepo.findOne({
        where: { item_id: order.item_id },
        select: ['stock_item']
    });

    const stockItemCode = stockItem?.stock_item ?? order.item_id;

    // ----------------------------
    // 2) location info (for trx log)
    // ----------------------------
    const loc = await locRepo.findOne({
        where: { loc_id: order.loc_id }
    });

    // ----------------------------
    // 3) FIFO inventory + lock
    // ----------------------------
    const invList = await invRepo
        .createQueryBuilder("inv")
        .setLock("pessimistic_write")
        .where("inv.item_id = :item_id", { item_id: order.item_id })
        .andWhere("inv.loc_id = :loc_id", { loc_id: order.loc_id })
        .orderBy("inv.unit_cost_inv", "ASC")
        .getMany();

    if (invList.length === 0) {
        throw new Error(`No inventory found for item ${stockItemCode}`);
    }

    // ----------------------------
    // 4) check total stock
    // ----------------------------
    const totalStock = invList.reduce((sum, inv) => sum + inv.inv_qty, 0);

    if (totalStock < order.actual_qty) {
        throw new Error(`Not enough stock for item ${stockItemCode}`);
    }

    // ----------------------------
    // 5) FIFO consume + trx log
    // ----------------------------
    let qtyToRemove = order.actual_qty;

    for (const inv of invList) {
        if (qtyToRemove <= 0) break;

        const consumeQty = Math.min(inv.inv_qty, qtyToRemove);
        qtyToRemove -= consumeQty;

        // update inventory
        inv.inv_qty -= consumeQty;
        inv.total_cost_inv = Number(
            (inv.inv_qty * inv.unit_cost_inv).toFixed(2)
        );
        inv.updated_at = new Date();

        const savedInv = await invRepo.save(inv);

        // ----------------------------
        // insert inventory transaction (USAGE)
        // ----------------------------
        const trx: DeepPartial<InventoryTrx> = {
            inv_id: savedInv.inv_id,
            order_id: order.order_id,
            order_type: TypeInfm.USAGE,

            item_id: order.item_id,
            stock_item: stockItem?.stock_item ?? undefined,

            loc_id: order.loc_id,
            loc: loc?.loc ?? undefined,
            box_loc: loc?.box_loc ?? undefined,

            qty: -consumeQty,
            unit_cost: savedInv.unit_cost_inv,
            total_cost: Number(
                (-consumeQty * savedInv.unit_cost_inv).toFixed(2)
            )
        };

        await trxRepo.save(trxRepo.create(trx));
    }

    return true;
}



    //---------------------------------------
    // 3) TRANSFER → ตัดจาก loc A (FIFO) + เพิ่มใน loc B ตามราคาเดิมของแต่ละ batch
    //---------------------------------------
    // async transfer(manager: EntityManager, order: Orders) {
    //     const invRepo = manager.getRepository(Inventory);
    //     const transferRepo = manager.getRepository(OrdersTransfer);

    //     const t = await transferRepo.findOne({
    //         where: { order_id: order.order_id }
    //     });

    //     if (!t) {
    //         throw new Error(`OrdersTransfer not found for order ${order.order_id}`);
    //     }

    //     const fromLoc = t.from_loc_id;      // ใช้ order.from_loc_id = ต้นทาง(orders_transfer)
    //     const toLoc = order.loc_id;          // ใช้ order.loc_id = ปลายทาง(orders)
    //     const qtyToMoveTotal = order.actual_qty ?? 0;

    //     if (qtyToMoveTotal <= 0) {
    //         throw new Error("actual_qty must be > 0");
    //     }

    //     const sourceList = await invRepo.find({
    //         where: {
    //             item_id: order.item_id,
    //             loc_id: fromLoc
    //         },
    //         order: { unit_cost_inv: "ASC" }
    //     });

    //     if (sourceList.length === 0) {
    //         throw new Error(`No inventory found at from_loc_id ${fromLoc}`);
    //     }

    //     let qtyToMove = qtyToMoveTotal;

    //     for (const src of sourceList) {
    //         if (qtyToMove <= 0) break;

    //         const moveQty = Math.min(src.inv_qty, qtyToMove);
    //         qtyToMove -= moveQty;
    //         src.inv_qty -= moveQty;
    //         src.total_cost_inv = src.unit_cost_inv * src.inv_qty; // ⭐ เพิ่ม
    //         src.updated_at = new Date();
    //         await invRepo.save(src);

    //         // ใส่เข้า loc ปลายทาง
    //         const dest = await invRepo.findOne({
    //             where: {
    //                 item_id: order.item_id,
    //                 loc_id: toLoc,
    //                 unit_cost_inv: src.unit_cost_inv
    //             }
    //         });

    //         if (dest) {
    //             dest.inv_qty += moveQty;
    //             dest.total_cost_inv = dest.unit_cost_inv * dest.inv_qty; // ⭐ เพิ่ม
    //             dest.updated_at = new Date();
    //             await invRepo.save(dest);
    //         } else {
    //             await invRepo.save(invRepo.create({
    //                 item_id: order.item_id,
    //                 loc_id: toLoc,
    //                 unit_cost_inv: src.unit_cost_inv,
    //                 inv_qty: moveQty,
    //                 total_cost_inv: src.unit_cost_inv * moveQty,  // ⭐ เพิ่ม
    //                 updated_at: new Date()
    //             }));
    //         }
    //     }

    //     if (qtyToMove > 0) {
    //         throw new Error(`Not enough stock to transfer`);
    //     }

    //     return true;
    // }

//---------------------------------------
// 3) TRANSFER → ตัดจาก loc A (FIFO) + เพิ่มใน loc B ตามราคาเดิม
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
        .orderBy("inv.unit_cost_inv", "ASC")
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



    // ดึงข้อมูลมาแสดงผลในหน้า inventory balance
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
                .select([
                    'inv.item_id AS item_id',
                    'stock.stock_item AS stock_item',
                    'stock.item_desc AS item_desc',
                    'inv.loc_id AS loc_id',
                    'loc.loc AS loc',
                    'loc.box_loc AS box_loc',

                    // 🔢 รวมจำนวน
                    'SUM(inv.inv_qty) AS total_inv_qty',

                    // 💰 รวมต้นทุน
                    'SUM(inv.total_cost_inv) AS total_cost_inv',

                    // ⭐ ค่าเฉลี่ยถ่วงน้ำหนัก (ถ้า null ให้เป็น 0)
                    'COALESCE(ROUND(SUM(inv.total_cost_inv) / NULLIF(SUM(inv.inv_qty), 0), 4), 0) AS avg_unit_cost'
                ])
                .groupBy('inv.item_id')
                .addGroupBy('inv.loc_id')
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

}


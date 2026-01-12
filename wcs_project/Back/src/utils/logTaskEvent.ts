import { EntityManager } from "typeorm";
import { StatusOrders, TaskReason, TaskSource, TaskSubsystem } from "../common/global.enum";
import { OrdersLog } from "../entities/orders_log.entity";
import { Orders } from "../entities/orders.entity";
import { StockItems } from "../entities/m_stock_items.entity";
import { Locations } from "../entities/m_location.entity";

export class OrdersLogService {
    public async logTaskEvent(
        manager: EntityManager,
        order: Orders,
        params?: {
            actor?: string | null;
            source?: TaskSource | string | null;
            subsystem?: TaskSubsystem | string | null;
            reason_code?: string | null;
            meta?: any;
            status?: StatusOrders | string | null;
        }
    ): Promise<void> {
        const repo = manager.getRepository(OrdersLog);

        //หา data from item_id
        const stockRepo = manager.getRepository(StockItems);
        const stock = await stockRepo.findOne({
            where: { item_id: order.item_id }
        });
        const stockItem = stock?.stock_item;
        const itemName = stock?.item_name ?? null;
        const itemDesc = stock?.item_desc ?? null;

        //find data from loc_id
        const locationRepo = manager.getRepository(Locations);
        const loc = await locationRepo.findOne({
            where: { loc_id: order.loc_id }
        });
        const location = loc?.loc ?? null;
        const boxLocation = loc?.box_loc ?? null;

        const resolvedSource: TaskSource = (params?.source as TaskSource) ?? TaskSource.SYSTEM;
        const resolvedSubsystem: TaskSubsystem = (params?.subsystem as TaskSubsystem) ?? TaskSubsystem.CORE;
        const resolvedActor: string | null = params?.actor ?? 
            (resolvedSource === TaskSource.API ? null : (resolvedSource as string));

        await repo.insert({
            order_id: String(order.order_id),
            type: order.type as any,
            item_id: order.item_id,
            stock_item: stockItem ?? '',
            item_name: itemName ?? null,
            item_desc: itemDesc ?? null,
            loc_id: order.loc_id,
            loc: location ?? null,
            box_loc: boxLocation ?? null,
            cond: order.cond,
            plan_qty: order.plan_qty ?? 0,
            actual_qty: order.actual_qty ?? 0,
            status: params?.status ? (params.status as StatusOrders) : null, // ✅ แก้ตรงนี้
            is_confirm: order.is_confirm ?? false,
            actor: resolvedActor,
            source: resolvedSource as any,
            subsystem: resolvedSubsystem as any,
            reason_code: params?.reason_code ? (params.reason_code as TaskReason) : null, // ✅ แก้ตรงนี้
            meta_json: params?.meta ?? null,
        });
    }
}

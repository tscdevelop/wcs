import { EntityManager } from "typeorm";
import { StatusOrders, TaskReason, TaskSource, TaskSubsystem } from "../common/global.enum";
import { OrdersLog } from "../entities/orders_log.entity";
import { Orders } from "../entities/orders.entity";
import { StockItems } from "../entities/m_stock_items.entity";

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

        const stockRepo = manager.getRepository(StockItems);
        const stock = await stockRepo.findOne({
            where: { stock_item: order.stock_item }
        });

        const itemName = stock?.item_name ?? null;
        const itemDesc = stock?.item_desc ?? null;

        const resolvedSource: TaskSource = (params?.source as TaskSource) ?? TaskSource.SYSTEM;
        const resolvedSubsystem: TaskSubsystem = (params?.subsystem as TaskSubsystem) ?? TaskSubsystem.CORE;
        const resolvedActor: string | null = params?.actor ?? 
            (resolvedSource === TaskSource.API ? null : (resolvedSource as string));

        await repo.insert({
            order_id: String(order.order_id),
            store_type: 'T1M',
            type: order.type as any,
            stock_item: String(order.stock_item),
            item_name: itemName,
            item_desc: itemDesc,
            from_location: order.from_location || null,
            source_loc: order.source_loc || null,
            source_box_loc: order.source_box_loc || null,
            dest_loc: order.dest_loc || null,
            dest_box_loc: order.dest_box_loc || null,
            cond: order.cond || null,
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

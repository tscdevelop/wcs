import { AppDataSource } from "../config/app-data-source";
import { Request, Response } from "express";
import {
  addClient,
  removeClient,
  broadcast,
} from "../services/sse.service";

import { CounterRuntimeService } from "../services/counter_runtime.service";
import { Counter } from "../entities/counter.entity";

const counterRepo = AppDataSource.getRepository(Counter);
const runtimeService = new CounterRuntimeService();

export const connectSSE = async (req: Request, res: Response) => {
    const { counterId } = req.params;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    addClient(counterId, res);

    const runtime = await runtimeService.get(Number(counterId));

    res.write(`data: ${JSON.stringify({
        counter_id: counterId,
        actualQty: runtime?.actual_qty ?? 0
    })}\n\n`);
    res.flush?.();

    const heartbeat = setInterval(() => {
        res.write(": ping\n\n");
        res.flush?.();
    }, 15000);

    req.on("close", () => {
        clearInterval(heartbeat);
        removeClient(counterId, res);
    });
};


export const scanItem = async (req: Request, res: Response) => {
    const counterId = Number(req.params.counterId);

    // 👉 หา order_id จาก counter
    const counter = await counterRepo.findOne({
        where: { counter_id: String(counterId) }
    });


    if (!counter?.current_order_id) {
        return res.status(400).json({ error: "No active order" });
    }

    const runtime = await runtimeService.increment(
        counterId,
        Number(counter.current_order_id)
    );

    broadcast(String(counterId), {
        counter_id: counterId,
        actualQty: runtime?.actual_qty ?? 0
    });

    res.json({ ok: true, actualQty: runtime?.actual_qty });
};


export const resetCounter = async (req: Request, res: Response) => {
    const counterId = Number(req.params.counterId);

    await runtimeService.reset(counterId);

    broadcast(String(counterId), {
        counter_id: counterId,
        actualQty: 0
    });

    res.json({
        ok: true,
        counter_id: counterId,
        actualQty: 0,
    });
};


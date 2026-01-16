import { Request, Response } from "express";
import {
addClient,
removeClient,
getCounter,
increaseQty,
broadcast,
resetQty,
} from "../services/sse.service";

export const connectSSE = (req: Request, res: Response) => {
    const { counterId } = req.params;

    console.log("🔥 SSE CONNECT", counterId);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    addClient(counterId, res);

    const counter = getCounter(counterId);

    res.write(
        `data: ${JSON.stringify({
        counter_id: counterId,
        actualQty: counter?.actualQty ?? 0,
        })}\n\n`
    );

    req.on("close", () => {
        console.log("❌ SSE DISCONNECT", counterId);
        removeClient(counterId, res);
    });
};

export const scanItem = (req: Request, res: Response) => {
    const { counterId } = req.params;

    const actualQty = increaseQty(counterId, 1);
    broadcast(counterId);

    res.json({
        ok: true,
        counter_id: counterId,
        actualQty,
    });
    };

    export const resetCounter = (req: Request, res: Response) => {
    const { counterId } = req.params;

    const actualQty = resetQty(counterId);
    broadcast(counterId);

    res.json({
        ok: true,
        counter_id: counterId,
        actualQty,
    });
};

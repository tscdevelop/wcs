import { Response } from "express";

type ClientMap = Map<string, Set<Response>>;

const clients: ClientMap = new Map();

export function addClient(counterId: string, res: Response) {
  if (!clients.has(counterId)) {
    clients.set(counterId, new Set());
  }
  clients.get(counterId)!.add(res);
}

export function removeClient(counterId: string, res: Response) {
  if (clients.has(counterId)) {
    clients.get(counterId)!.delete(res);
    if (clients.get(counterId)!.size === 0) {
      clients.delete(counterId);
    }
  }
}

export function broadcastCounter(
  counterId: string,
  payload: Record<string, any>
) {
  if (!clients.has(counterId)) return;

  const data = JSON.stringify({
    counter_id: counterId,
    ...payload,
  });

  clients.get(counterId)!.forEach((res) => {
    res.write(`data: ${data}\n\n`);
  });
}

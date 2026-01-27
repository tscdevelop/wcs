import { Response } from "express";

type CounterId = number;
type ClientMap = Map<CounterId, Set<Response>>;

const clients: ClientMap = new Map();

export function addClient(counterId: CounterId, res: Response) {
  if (!clients.has(counterId)) {
    clients.set(counterId, new Set());
  }
  clients.get(counterId)!.add(res);
}

export function removeClient(counterId: CounterId, res: Response) {
  const set = clients.get(counterId);
  if (!set) return;

  set.delete(res);

  if (set.size === 0) {
    clients.delete(counterId); // 🔥 clean map
  }
}

export function broadcast(counterId: CounterId, payload: any) {
  const set = clients.get(counterId);
  if (!set) return;

  const data = `data: ${JSON.stringify(payload)}\n\n`;
  console.log("[SSE broadcast]", counterId, payload);
  
  set.forEach(res => {
    try {
      res.write(data);
    } catch {
      set.delete(res); // 🔥 clean dead client
    }
  });

  if (set.size === 0) {
    clients.delete(counterId);
  }
}

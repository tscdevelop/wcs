import { Response } from "express";

type CounterState = {
  actualQty: number;
  clients: Set<Response>;
};

const counters = new Map<string, CounterState>();

export function getCounter(counterId: string): CounterState {
  if (!counters.has(counterId)) {
    counters.set(counterId, {
      actualQty: 0,
      clients: new Set(),
    });
  }
  return counters.get(counterId)!;
}

export function addClient(counterId: string, res: Response) {
  const counter = getCounter(counterId);
  counter.clients.add(res);
}

export function removeClient(counterId: string, res: Response) {
  const counter = counters.get(counterId);
  if (!counter) return;

  counter.clients.delete(res);

  if (counter.clients.size === 0) {
    counters.delete(counterId);
  }
}

export function increaseQty(counterId: string, qty = 1) {
  const counter = getCounter(counterId);
  counter.actualQty += qty;
  return counter.actualQty;
}

export function broadcast(counterId: string) {
  const counter = counters.get(counterId);
  if (!counter) return;

  const data = JSON.stringify({
    counter_id: counterId,
    actualQty: counter.actualQty,
  });

  counter.clients.forEach((res) => {
    res.write(`data: ${data}\n\n`);
  });
}

export function resetQty(counterId: string) {
  const counter = getCounter(counterId);
  counter.actualQty = 0;
  return counter.actualQty;
}


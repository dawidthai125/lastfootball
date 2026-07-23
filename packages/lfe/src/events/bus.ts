import type { EngineEvent, EngineEventType, EventHandler } from './types';

export interface EventBus {
  emit<TPayload = unknown>(type: EngineEventType | string, tick: number, payload?: TPayload): void;
  on<TPayload = unknown>(
    type: EngineEventType | string | '*',
    handler: EventHandler<TPayload>,
  ): () => void;
  /** Deliver queued events synchronously (events phase). */
  flush(): EngineEvent[];
  /** Peek without clearing. */
  peek(): readonly EngineEvent[];
  clear(): void;
  /** All events emitted since last clearHistory (includes flushed). */
  history(): readonly EngineEvent[];
  clearHistory(): void;
}

export function createEventBus(): EventBus {
  const queue: EngineEvent[] = [];
  const historyLog: EngineEvent[] = [];
  const handlers = new Map<string, Set<EventHandler>>();

  function notify(event: EngineEvent): void {
    const specific = handlers.get(event.type);
    if (specific) {
      for (const h of specific) h(event);
    }
    const wildcard = handlers.get('*');
    if (wildcard) {
      for (const h of wildcard) h(event);
    }
  }

  return {
    emit(type, tick, payload) {
      const event: EngineEvent = payload === undefined ? { type, tick } : { type, tick, payload };
      queue.push(event);
      historyLog.push(event);
    },
    on(type, handler) {
      const key = type;
      let set = handlers.get(key);
      if (!set) {
        set = new Set();
        handlers.set(key, set);
      }
      set.add(handler as EventHandler);
      return () => {
        set!.delete(handler as EventHandler);
        if (set!.size === 0) handlers.delete(key);
      };
    },
    flush() {
      const batch = queue.splice(0, queue.length);
      for (const event of batch) notify(event);
      return batch;
    },
    peek() {
      return queue;
    },
    clear() {
      queue.length = 0;
    },
    history() {
      return historyLog;
    },
    clearHistory() {
      historyLog.length = 0;
    },
  };
}

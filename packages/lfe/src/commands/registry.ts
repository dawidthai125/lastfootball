import type { Command, CommandHandler } from './types';

export interface CommandRegistry {
  register<C extends Command>(handler: CommandHandler<C>): void;
  unregister(type: string): boolean;
  get(type: string): CommandHandler | undefined;
  types(): readonly string[];
}

export function createCommandRegistry(): CommandRegistry {
  const handlers = new Map<string, CommandHandler>();

  return {
    register(handler) {
      handlers.set(handler.type, handler as unknown as CommandHandler);
    },
    unregister(type) {
      return handlers.delete(type);
    },
    get(type) {
      return handlers.get(type);
    },
    types() {
      return [...handlers.keys()].sort();
    },
  };
}

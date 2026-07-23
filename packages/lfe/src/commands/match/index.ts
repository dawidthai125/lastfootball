import type { CommandHandler } from '../types';
import type { CommandRegistry } from '../registry';

import { MATCH_COMMAND_HANDLERS } from './handlers';
import { TACTICAL_COMMAND_HANDLERS } from './tactical-handlers';

export function registerMatchCommands(registry: CommandRegistry): void {
  for (const handler of MATCH_COMMAND_HANDLERS) {
    registry.register(handler as CommandHandler);
  }
  for (const handler of TACTICAL_COMMAND_HANDLERS) {
    registry.register(handler as CommandHandler);
  }
}

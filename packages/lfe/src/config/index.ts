import { DEFAULT_LFE_CONFIG } from './defaults';
import type { DeepPartial, LfeConfig } from './types';

export type { DeepPartial, LfeConfig } from './types';
export { DEFAULT_LFE_CONFIG, tickDurationMs } from './defaults';

export function resolveConfig(partial?: DeepPartial<LfeConfig>): LfeConfig {
  return {
    ...DEFAULT_LFE_CONFIG,
    ...partial,
  };
}

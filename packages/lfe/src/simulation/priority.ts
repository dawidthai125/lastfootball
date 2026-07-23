/**
 * Explicit system execution order.
 * Lower number runs earlier. Order must NEVER rely on import/register order.
 */

export const SystemPriority = {
  CLOCK: 100,
  SCHEDULER: 200,
  LIFECYCLE: 300,
  /** Custom / future gameplay systems (physics, AI, …) register here or nearby. */
  GAMEPLAY: 350,
  EVENT: 400,
  REPLAY: 500,
} as const;

export type SystemPriorityName = keyof typeof SystemPriority;
export type SystemPriorityValue = (typeof SystemPriority)[SystemPriorityName] | number;

export function compareSystemPriority(a: SystemPriorityValue, b: SystemPriorityValue): number {
  return a - b;
}

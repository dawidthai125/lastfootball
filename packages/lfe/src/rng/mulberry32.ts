/**
 * Mulberry32 PRNG — small, fast, deterministic.
 * Same seed ⇒ identical sequence across runs/platforms (IEEE754 number ops).
 */

export interface RngState {
  seed: number;
  state: number;
  calls: number;
}

export interface Rng {
  readonly seed: number;
  next(): number;
  nextInt(minInclusive: number, maxExclusive: number): number;
  nextBool(probability?: number): boolean;
  getState(): RngState;
  setState(state: RngState): void;
}

function asUint32(n: number): number {
  return n >>> 0;
}

export function createRng(seed: number): Rng {
  let state = asUint32(seed);
  let calls = 0;
  const initialSeed = asUint32(seed);

  return {
    get seed() {
      return initialSeed;
    },
    next() {
      calls += 1;
      state = asUint32(state + 0x6d2b79f5);
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    nextInt(minInclusive: number, maxExclusive: number) {
      if (maxExclusive <= minInclusive) {
        throw new Error('Rng.nextInt: maxExclusive must be > minInclusive');
      }
      const span = maxExclusive - minInclusive;
      return minInclusive + Math.floor(this.next() * span);
    },
    nextBool(probability = 0.5) {
      return this.next() < probability;
    },
    getState() {
      return { seed: initialSeed, state, calls };
    },
    setState(next: RngState) {
      state = asUint32(next.state);
      calls = next.calls;
    },
  };
}

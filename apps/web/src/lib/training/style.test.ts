import { describe, expect, it } from 'vitest';

import { gainStyle, gainTempo, kickoffPressing, kickoffTempo, STYLE_THIN } from './style';

describe('gainStyle', () => {
  it('gains one habit point only for tactics at normal or high', () => {
    expect(STYLE_THIN).toEqual({ CAP: 8, PER_POINT: 2 });
    expect(gainStyle(0, 'tactics', 'normal')).toBe(1);
    expect(gainStyle(0, 'tactics', 'high')).toBe(1);
    expect(gainStyle(3, 'tactics', 'light')).toBe(3);
    expect(gainStyle(4, 'technique', 'high')).toBe(4);
    expect(gainStyle(8, 'tactics', 'high')).toBe(8);
    expect(gainStyle(2.9, 'tactics', 'normal')).toBe(3);
  });
});

describe('gainTempo', () => {
  it('gains one habit point only for technique at normal or high', () => {
    expect(gainTempo(0, 'technique', 'normal')).toBe(1);
    expect(gainTempo(0, 'technique', 'high')).toBe(1);
    expect(gainTempo(3, 'technique', 'light')).toBe(3);
    expect(gainTempo(4, 'tactics', 'high')).toBe(4);
    expect(gainTempo(8, 'technique', 'high')).toBe(8);
  });
});

describe('kickoffTempo', () => {
  it('uses the same scale as pressing', () => {
    expect(kickoffTempo(0)).toBe(50);
    expect(kickoffTempo(8)).toBe(66);
  });
});

describe('kickoffPressing', () => {
  it('lifts the default 50 by two per habit point, clamped', () => {
    expect(kickoffPressing(0)).toBe(50);
    expect(kickoffPressing(8)).toBe(66);
    expect(kickoffPressing(-4)).toBe(50);
    expect(kickoffPressing(NaN)).toBe(50);
  });
});

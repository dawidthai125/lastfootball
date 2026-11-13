import { describe, expect, it } from 'vitest';

import {
  clubStyleSentence,
  gainStyle,
  gainTempo,
  gainWidth,
  kickoffPressing,
  kickoffTempo,
  kickoffWidth,
  STYLE_THIN,
} from './style';

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

describe('gainWidth', () => {
  it('gains one habit point only for physical at normal or high', () => {
    expect(gainWidth(0, 'physical', 'normal')).toBe(1);
    expect(gainWidth(0, 'physical', 'high')).toBe(1);
    expect(gainWidth(3, 'physical', 'light')).toBe(3);
    expect(gainWidth(4, 'technique', 'high')).toBe(4);
    expect(gainWidth(4, 'tactics', 'high')).toBe(4);
    expect(gainWidth(8, 'physical', 'high')).toBe(8);
  });
});

describe('kickoffWidth', () => {
  it('uses the same scale as pressing', () => {
    expect(kickoffWidth(0)).toBe(50);
    expect(kickoffWidth(8)).toBe(66);
  });
});

describe('clubStyleSentence', () => {
  it('names the three habits and their kickoff dials', () => {
    expect(clubStyleSentence(2, 0, 4)).toBe(
      'Styl sezonu: pressing 2/8 (start 54), tempo 0/8 (start 50), szerokość 4/8 (start 58).',
    );
    expect(clubStyleSentence(Number.NaN, 9, -1)).toBe(
      'Styl sezonu: pressing 0/8 (start 50), tempo 8/8 (start 66), szerokość 0/8 (start 50).',
    );
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

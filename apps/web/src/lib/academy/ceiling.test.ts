import { describe, expect, it } from 'vitest';

import { academyCeilingView } from './ceiling';

describe('academyCeilingView', () => {
  it('hides the ceiling and does not echo 88 or elite', () => {
    const samples = [
      academyCeilingView({ revealed: false, bandLabel: '88' }),
      academyCeilingView({ revealed: false, bandLabel: 'elite' }),
      academyCeilingView({ revealed: false, bandLabel: 'Wysoki' }),
      academyCeilingView({ revealed: false, bandLabel: 88 as unknown as string }),
      academyCeilingView({ revealed: true, bandLabel: '88' }),
      academyCeilingView({ revealed: true, bandLabel: 'elite' }),
      academyCeilingView({ revealed: true, bandLabel: '' }),
      academyCeilingView({ revealed: true, bandLabel: null }),
    ];

    for (const view of samples) {
      expect(view).toEqual({ label: 'Sufit ukryty', hidden: true });
      expect(view.label).not.toContain('88');
      expect(view.label).not.toContain('elite');
      expect(JSON.stringify(view)).not.toContain('88');
      expect(JSON.stringify(view)).not.toContain('elite');
    }
  });

  it('returns only the word Wysoki when that band is revealed', () => {
    const view = academyCeilingView({ revealed: true, bandLabel: 'Wysoki' });
    expect(view).toEqual({ label: 'Wysoki', hidden: false });
    expect(Object.keys(view)).toEqual(['label', 'hidden']);
  });

  it('accepts only the four Polish band labels', () => {
    for (const label of ['Niski', 'Średni', 'Wysoki', 'Bardzo wysoki'] as const) {
      expect(academyCeilingView({ revealed: true, bandLabel: label })).toEqual({
        label,
        hidden: false,
      });
    }
  });
});

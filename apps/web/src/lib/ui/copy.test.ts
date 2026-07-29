import { describe, expect, it } from 'vitest';

import { UI_COPY } from '@/lib/ui/copy';

describe('LFE-CONTENT-PASS-01 glossary', () => {
  it('keeps Kadra ≠ Skład CTA verbs', () => {
    expect(UI_COPY.viewSquad).toBe('Zobacz kadrę');
    expect(UI_COPY.setLineup).toBe('Ustaw skład');
    expect(UI_COPY.viewSquad.toLowerCase()).not.toContain('skład');
    expect(UI_COPY.setLineup.toLowerCase()).not.toContain('kadr');
  });

  it('uses Hub (not Hubu) in chrome exits', () => {
    expect(UI_COPY.hubExit).toBe('Wróć do Hub');
    expect(UI_COPY.hubEnter).toBe('Wejdź do Hub');
    expect(UI_COPY.hubExit.includes('Hubu')).toBe(false);
  });

  it('avoids engineer jargon and Odblokuj CTA', () => {
    const blob = Object.values(UI_COPY).join(' ');
    expect(blob).not.toMatch(/\b(resolveNavAccess|DTO|Supabase|Odblokuj)\b/i);
  });
});

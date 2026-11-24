import { describe, expect, it } from 'vitest';

import { consentError } from '@/lib/auth/consent';

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

describe('consentError (D148)', () => {
  it('needs both the age and the terms', () => {
    expect(consentError(form({ age: 'on', terms: 'on' }))).toBeNull();
    expect(consentError(form({ terms: 'on' }))).toContain('16 lat');
    expect(consentError(form({ age: 'on' }))).toContain('Regulamin');
    expect(consentError(form({ age: 'off', terms: 'on' }))).toContain('16 lat');
  });
});

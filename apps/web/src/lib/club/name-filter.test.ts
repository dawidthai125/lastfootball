import { describe, expect, it } from 'vitest';

import { isNameAllowed } from '@/lib/club/name-filter';
import { validateClubIdentity } from '@/lib/club/validation';

describe('isNameAllowed (D150)', () => {
  it.each([
    'Wilki Północy',
    'Legia Rzeczna',
    'Dupnica Górna',
    'Sussex United',
    'Analityk Warszawa',
    'Stal Brzeg 1945',
    'Klub Gaya',
    'FC Kościół',
    'Cockney Rovers',
    'Orły 88',
  ])('keeps %s', (name) => expect(isNameAllowed(name)).toBe(true));

  it.each([
    'Kurwy Wschodu',
    'K u r w a FC',
    'Kurw4 FC',
    'FC Chuje',
    'Pizda Team',
    'Hitler FC',
    'H1tler',
    'SS Warszawa',
    'Admin',
    'Last Football',
    'Klub usunięty',
    'fuck fc',
    'Pierdołek pierdol',
  ])('refuses %s', (name) => expect(isNameAllowed(name)).toBe(false));

  it('stands in the club form, for the name and the short name', () => {
    const base = {
      name: 'Dobra Nazwa',
      shortName: 'DNA',
      primaryColor: '#111111',
      secondaryColor: '#eeeeee',
      crestTemplateId: 'a',
      allowedCrestIds: ['a'],
    };
    expect(validateClubIdentity(base).ok).toBe(true);
    expect(validateClubIdentity({ ...base, name: 'Kurwa FC' }).ok).toBe(false);
    expect(validateClubIdentity({ ...base, shortName: 'HUJ' }).ok).toBe(false);
  });
});

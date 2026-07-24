const NAME_RE = /^[\p{L}0-9][\p{L}0-9 .'-]{1,22}[\p{L}0-9]$/u;
const SHORT_RE = /^[A-Z0-9]{3,4}$/;
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

export type ClubIdentityInput = {
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  crestTemplateId: string;
};

export type ClubValidationResult =
  { ok: true; value: ClubIdentityInput } | { ok: false; error: string };

export function normalizeClubName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function normalizeShortName(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4);
}

export function validateClubIdentity(input: {
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  crestTemplateId: string;
  allowedCrestIds: readonly string[];
}): ClubValidationResult {
  const name = normalizeClubName(input.name);
  const shortName = normalizeShortName(input.shortName);
  const primaryColor = input.primaryColor.trim();
  const secondaryColor = input.secondaryColor.trim();
  const crestTemplateId = input.crestTemplateId.trim();

  if (name.length < 3 || name.length > 24) {
    return { ok: false, error: 'Nazwa klubu: 3–24 znaki.' };
  }
  if (!NAME_RE.test(name)) {
    return { ok: false, error: "Nazwa: litery, cyfry, spacje oraz . ' -" };
  }
  if (!SHORT_RE.test(shortName)) {
    return { ok: false, error: 'Skrót: 3–4 znaki A–Z / 0–9.' };
  }
  if (!HEX_RE.test(primaryColor) || !HEX_RE.test(secondaryColor)) {
    return { ok: false, error: 'Wybierz poprawne barwy klubu.' };
  }
  if (primaryColor.toLowerCase() === secondaryColor.toLowerCase()) {
    return { ok: false, error: 'Kolor główny i dodatkowy muszą się różnić.' };
  }
  if (!input.allowedCrestIds.includes(crestTemplateId)) {
    return { ok: false, error: 'Wybierz herb z katalogu.' };
  }

  return {
    ok: true,
    value: { name, shortName, primaryColor, secondaryColor, crestTemplateId },
  };
}

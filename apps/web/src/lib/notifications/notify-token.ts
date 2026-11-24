import { createHash, timingSafeEqual } from 'node:crypto';

const MAX_HEADER = 300;

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

/** Same time whatever the length: both sides are hashed first. */
export function sameSecret(given: string, expected: string | null | undefined): boolean {
  if (!expected) return false;
  return timingSafeEqual(digest(given), digest(expected));
}

export function bearerToken(header: string | null): string | null {
  if (!header || header.length > MAX_HEADER) return null;
  const match = /^Bearer ([\x21-\x7e]{16,256})$/i.exec(header);
  return match?.[1] ?? null;
}

/** The scheduler token from the database, or CRON_SECRET. Nothing configured means closed. */
export async function isSchedulerRequest(
  header: string | null,
  cronSecret: string | null,
  readToken: () => Promise<string | null>,
): Promise<boolean> {
  const token = bearerToken(header);
  if (!token) return false;
  if (sameSecret(token, cronSecret)) return true;
  return sameSecret(token, await readToken());
}

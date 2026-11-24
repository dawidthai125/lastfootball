/** Which address was really proven by the link, as a hash. Pure, server only (node:crypto). */

import { createHash } from 'node:crypto';

/** Part of the hash carried inside the link token: 128 bits. */
const TOKEN_PART = 32;

export function emailHash(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}

export function emailTokenPart(email: string): string {
  return emailHash(email).slice(0, TOKEN_PART);
}

/** The link was sent to this very address, not to one the account had before. */
export function tokenProvesEmail(token: string, email: string | null | undefined): boolean {
  return Boolean(email) && token.length > TOKEN_PART && token.endsWith(emailTokenPart(email!));
}

/** A missing hash (older confirmations, backfill) proves nothing. */
export function isProvenEmail(
  storedHash: string | null | undefined,
  email: string | null | undefined,
): boolean {
  return Boolean(storedHash) && Boolean(email) && storedHash === emailHash(email!);
}

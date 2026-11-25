/**
 * A path inside the game, or null. Browsers read "/\\" as "//" and drop control characters, so a
 * prefix check alone lets another site through.
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return null;
  if (/[\\\u0000-\u0020\u007f]/.test(next)) return null;
  return next;
}

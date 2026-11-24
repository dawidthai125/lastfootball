/**
 * A push endpoint is a URL from the browser that our server will call.
 * Only the known push services over plain https are accepted, so it cannot point inward.
 */

const EXACT_HOSTS = new Set(['fcm.googleapis.com', 'web.push.apple.com']);
const HOST_SUFFIXES = ['.push.services.mozilla.com', '.notify.windows.com', '.push.apple.com'];
const MAX_ENDPOINT = 1024;
const BASE64URL = /^[A-Za-z0-9_-]+={0,2}$/;

export type PushDeviceInput = {
  readonly endpoint: string;
  readonly p256dh: string;
  readonly auth: string;
};

export function isPushEndpoint(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_ENDPOINT) return false;
  if (/[\s\\]/.test(value)) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.port || url.username || url.password || url.hash) {
    return false;
  }
  const host = url.hostname.toLowerCase();
  return EXACT_HOSTS.has(host) || HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

function decodedBytes(value: unknown, max: number): Buffer | null {
  if (typeof value !== 'string' || value.length > max || !BASE64URL.test(value)) return null;
  return Buffer.from(value, 'base64url');
}

/** Null when anything in the browser's answer is not a real subscription. */
export function parsePushDevice(raw: unknown): PushDeviceInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const { endpoint, p256dh, auth } = raw as Record<string, unknown>;
  if (!isPushEndpoint(endpoint)) return null;
  const key = decodedBytes(p256dh, 128);
  const secret = decodedBytes(auth, 64);
  if (!key || key.length !== 65 || key[0] !== 4) return null;
  if (!secret || secret.length !== 16) return null;
  return { endpoint, p256dh: p256dh as string, auth: auth as string };
}

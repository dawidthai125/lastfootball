import { randomBytes } from 'node:crypto';

export const INVITE_COOKIE = 'lf_invite';
export const INVITE_COOKIE_DAYS = 30;

const CODE = /^[A-Za-z0-9_-]{10,24}$/;

export function isInviteCode(value: unknown): value is string {
  return typeof value === 'string' && CODE.test(value);
}

export function newInviteCode(): string {
  return randomBytes(9).toString('base64url');
}

export function invitePath(code: string): string {
  return `/zaproszenie/${code}`;
}

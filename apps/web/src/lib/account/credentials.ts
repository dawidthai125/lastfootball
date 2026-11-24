'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { isOwnPassword } from '@/lib/account/check-password';
import {
  EMAIL_PATTERN,
  finishEmailChange,
  startEmailChange,
  type EmailChangeResult,
} from '@/lib/account/email-change';
import { accountMailReady } from '@/lib/auth/account-mail';
import { passwordProblem } from '@/lib/auth/password-policy';
import { takeResetSlot } from '@/lib/auth/password-reset';
import { clientIpFromHeaders } from '@/lib/auth/signup-gate';
import type { AuthActionState } from '@/lib/auth/types';
import { createClient } from '@/lib/supabase/server';

const signedOut: AuthActionState = {
  error: 'Sesja wygasła. Zaloguj się ponownie.',
  info: null,
};

export async function changePassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const next = String(formData.get('next') ?? '');
  const weak = passwordProblem(next, String(formData.get('confirm') ?? ''));
  if (weak) return { error: weak, info: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return signedOut;
  if (!(await isOwnPassword(user, String(formData.get('current') ?? '')))) {
    return { error: 'Obecne hasło jest nieprawidłowe.', info: null };
  }
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) {
    return { error: 'Tego hasła nie da się ustawić. Wybierz inne niż obecne.', info: null };
  }
  await supabase.auth.signOut({ scope: 'others' });
  return { error: null, info: 'Hasło zmienione. Inne urządzenia zostały wylogowane.' };
}

export async function requestEmailChange(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return { error: 'Podaj poprawny adres email.', info: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return signedOut;
  if (email === user.email?.toLowerCase()) {
    return { error: 'To jest obecny adres konta.', info: null };
  }
  if (!(await isOwnPassword(user, String(formData.get('current') ?? '')))) {
    return { error: 'Hasło jest nieprawidłowe.', info: null };
  }
  if (!accountMailReady()) return { error: 'Zmiana adresu jest teraz niedostępna.', info: null };
  if (!(await takeResetSlot(clientIpFromHeaders(await headers()), email))) {
    return { error: 'Za dużo listów na dziś. Spróbuj jutro.', info: null };
  }
  if (!(await startEmailChange(user.id, email))) {
    return { error: 'Nie udało się wysłać listu. Spróbuj za chwilę.', info: null };
  }
  return { error: null, info: 'Wysłaliśmy link na nowy adres. Do kliknięcia obowiązuje obecny.' };
}

export type EmailChangeState = { result: EmailChangeResult | null };

export async function confirmEmailChange(
  _prev: EmailChangeState,
  formData: FormData,
): Promise<EmailChangeState> {
  const result = await finishEmailChange(String(formData.get('token') ?? ''));
  if (result === 'ok') revalidatePath('/', 'layout');
  return { result };
}

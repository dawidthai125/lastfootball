'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { headers } from 'next/headers';
import { after } from 'next/server';

import type { AuthActionState, ConfirmEmailState } from '@/lib/auth/types';
import { accountMailReady } from '@/lib/auth/account-mail';
import { consentError } from '@/lib/auth/consent';
import { confirmEmailToken, issueConfirmLink } from '@/lib/auth/email-confirm';
import { isResetToken, sendResetLetter, takeResetSlot } from '@/lib/auth/password-reset';
import { getAuthUser, getPostAuthPath, sanitizeNextPath } from '@/lib/auth/session';
import { clientIpFromHeaders, signupBlockMessage } from '@/lib/auth/signup-gate';
import { takeSignupSlot } from '@/lib/auth/signup-throttle';
import { turnstileMessage, verifyTurnstileToken } from '@/lib/auth/turnstile';
import { env } from '@/config/env';
import { forgetPushDevice } from '@/lib/notifications/devices';
import { isPushEndpoint } from '@/lib/notifications/push-endpoint';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Nieprawidłowy email lub hasło.';
  if (m.includes('already') && m.includes('register'))
    return 'Konto z tym emailem już istnieje. Zaloguj się.';
  if (m.includes('password')) return 'Hasło nie spełnia wymagań (min. 6 znaków).';
  if (m.includes('rate')) return 'Zbyt wiele prób. Spróbuj za chwilę.';
  if (m.includes('invalid') && m.includes('email')) return 'Podaj poprawny adres email.';
  return 'Nie udało się dokończyć. Spróbuj ponownie.';
}

export async function signInWithPassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Auth nie jest skonfigurowany (brak Supabase env).', info: null };
  }

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const nextRaw = String(formData.get('next') ?? '');

  if (!email || !password) {
    return { error: 'Podaj email i hasło.', info: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: mapAuthError(error?.message ?? 'login_failed'), info: null };
  }

  const fallback = await getPostAuthPath(data.user.id);
  const next = sanitizeNextPath(nextRaw || null, fallback);
  const destination =
    fallback === '/welcome' || fallback === '/onboarding/first-match' ? fallback : next;

  revalidatePath('/', 'layout');
  redirect(destination);
}

export async function signUpWithPassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Auth nie jest skonfigurowany (brak Supabase env).', info: null };
  }

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  const refused = consentError(formData);
  if (refused) return { error: refused, info: null };
  if (!email || !password) {
    return { error: 'Podaj email i hasło.', info: null };
  }
  if (password.length < 6) {
    return { error: 'Hasło musi mieć co najmniej 6 znaków.', info: null };
  }

  const headerList = await headers();
  const ip = clientIpFromHeaders(headerList);
  const captcha = await verifyTurnstileToken(
    String(formData.get('cf-turnstile-response') ?? ''),
    ip,
  );
  if (captcha !== 'ok' && captcha !== 'skipped') {
    return { error: turnstileMessage(captcha), info: null };
  }

  const supabase = await createClient();

  if (env.supabaseServiceRoleKey) {
    const block = await takeSignupSlot(ip);
    if (block) return { error: signupBlockMessage(block), info: null };

    const admin = createAdminClient();
    const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError || !createdUser.user) {
      return { error: mapAuthError(createError?.message ?? 'signup_failed'), info: null };
    }

    const { data: signed, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError || !signed.session) {
      return {
        error: 'Konto jest gotowe. Zaloguj się hasłem, które właśnie ustawiłeś.',
        info: null,
      };
    }

    await issueConfirmLink(createdUser.user.id, email);

    revalidatePath('/', 'layout');
    redirect('/welcome');
  }

  const origin = env.appUrl ?? 'http://localhost:3000';
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/welcome`,
    },
  });

  if (error) {
    return { error: mapAuthError(error.message), info: null };
  }

  if (!data.session) {
    return {
      error: null,
      info: 'Sprawdź skrzynkę email i potwierdź konto, potem zaloguj się.',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/welcome');
}

export async function sendEmailConfirmLink(
  prev: { error: string | null; info: string | null },
  formData: FormData,
): Promise<{ error: string | null; info: string | null }> {
  void prev;
  void formData;
  const user = await getAuthUser();
  if (!user?.id || !user.email) {
    return { error: 'Zaloguj się, żeby wysłać link.', info: null };
  }
  const result = await issueConfirmLink(user.id, user.email);
  if (result === 'sent') {
    return { error: null, info: 'Nowy link jest na mailu i działa 24 godziny.' };
  }
  if (result === 'confirmed') {
    return { error: null, info: 'Email jest już potwierdzony.' };
  }
  if (result === 'cooldown') {
    return { error: 'Nowy link można wysłać za kilka minut.', info: null };
  }
  if (result === 'daily') {
    return { error: 'Dziś wysłaliśmy już kilka linków. Spróbuj jutro.', info: null };
  }
  return { error: 'Nie udało się wysłać. Spróbuj za chwilę.', info: null };
}

/** The click, not the opened link: mail scanners open links on their own. */
export async function confirmEmailAction(
  _prev: ConfirmEmailState,
  formData: FormData,
): Promise<ConfirmEmailState> {
  return { result: await confirmEmailToken(String(formData.get('token') ?? '')) };
}

const RESET_SENT = 'Jeśli konto istnieje, link do nowego hasła jest na mailu.';

export async function requestPasswordReset(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Auth nie jest skonfigurowany (brak Supabase env).', info: null };
  }
  const email = String(formData.get('email') ?? '').trim();
  if (!email) return { error: 'Podaj email.', info: null };
  if (env.supabaseServiceRoleKey && accountMailReady()) {
    const ip = clientIpFromHeaders(await headers());
    if (!(await takeResetSlot(ip, email))) {
      return { error: 'Za dużo próśb o nowe hasło. Spróbuj później.', info: null };
    }
    // After the answer, so its time does not tell whether the account exists.
    after(() => sendResetLetter(email));
    return { error: null, info: RESET_SENT };
  }
  const origin = env.appUrl ?? 'https://www.lastfootball.pl';
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: mapAuthError(error.message), info: null };
  return {
    error: null,
    info: RESET_SENT,
  };
}

export async function updatePasswordFromRecovery(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Auth nie jest skonfigurowany (brak Supabase env).', info: null };
  }
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');
  if (password.length < 6) {
    return { error: 'Hasło musi mieć co najmniej 6 znaków.', info: null };
  }
  if (password !== confirm) {
    return { error: 'Hasła muszą być takie same.', info: null };
  }
  const supabase = await createClient();
  const token = String(formData.get('token') ?? '');
  if (token) {
    // Used only with the new password in hand: a mail scanner that opens the link spends nothing.
    const used = isResetToken(token)
      ? await supabase.auth.verifyOtp({ type: 'recovery', token_hash: token })
      : null;
    if (!used || used.error) {
      return { error: 'Link wygasł. Poproś o nowy reset hasła.', info: null };
    }
    const { error } = await supabase.auth.updateUser({ password });
    // The link is spent and the session is open: the form goes on without the token.
    if (error) redirect('/reset-password?ponow=1');
    revalidatePath('/', 'layout');
    redirect('/hub');
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Link wygasł. Poproś o nowy reset hasła.', info: null };
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: mapAuthError(error.message), info: null };
  revalidatePath('/', 'layout');
  redirect('/hub');
}

/** The endpoint of this browser, if any: its notifications end together with the session. */
export async function signOut(pushEndpoint?: unknown): Promise<void> {
  if (!env.isSupabaseConfigured) {
    redirect('/');
  }
  const supabase = await createClient();
  if (isPushEndpoint(pushEndpoint)) {
    const user = await getAuthUser().catch(() => null);
    if (user) await forgetPushDevice(user.id, pushEndpoint);
  }
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

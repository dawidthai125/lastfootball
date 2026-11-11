'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { headers } from 'next/headers';

import type { AuthActionState } from '@/lib/auth/types';
import { issueConfirmLink } from '@/lib/auth/email-confirm';
import { getAuthUser, getPostAuthPath, sanitizeNextPath } from '@/lib/auth/session';
import { clientIpFromHeaders, signupBlockMessage } from '@/lib/auth/signup-gate';
import { takeSignupSlot } from '@/lib/auth/signup-throttle';
import { turnstileMessage, verifyTurnstileToken } from '@/lib/auth/turnstile';
import { env } from '@/config/env';
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
  const terms = formData.get('terms') === 'on';

  if (!terms) {
    return { error: 'Zaakceptuj Regulamin i Politykę prywatności.', info: null };
  }
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

export async function signOut(): Promise<void> {
  if (!env.isSupabaseConfigured) {
    redirect('/');
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

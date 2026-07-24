'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import type { AuthActionState } from '@/lib/auth/types';
import { getPostAuthPath, sanitizeNextPath } from '@/lib/auth/session';
import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';

function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Nieprawidłowy email lub hasło.';
  if (m.includes('user already registered'))
    return 'Konto z tym emailem już istnieje. Zaloguj się.';
  if (m.includes('password')) return 'Hasło nie spełnia wymagań (min. 6 znaków).';
  if (m.includes('email')) return 'Podaj poprawny adres email.';
  if (m.includes('rate')) return 'Zbyt wiele prób. Spróbuj za chwilę.';
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
  const destination = fallback === '/welcome' ? '/welcome' : next;

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

  const supabase = await createClient();
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

export async function signOut(): Promise<void> {
  if (!env.isSupabaseConfigured) {
    redirect('/');
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

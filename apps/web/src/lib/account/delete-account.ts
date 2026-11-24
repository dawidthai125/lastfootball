'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { env } from '@/config/env';
import { isOwnPassword } from '@/lib/account/check-password';
import { tryAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export type DeleteAccountState = { readonly error: string | null };

const FAILED = 'Nie udało się usunąć konta. Spróbuj ponownie.';

/** Deletes the signed-in account for good. Asks for the password and the typed word. */
export async function deleteAccount(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return { error: FAILED };
  if (
    String(formData.get('confirm') ?? '')
      .trim()
      .toUpperCase() !== 'USUŃ'
  ) {
    return { error: 'Wpisz słowo USUŃ, żeby potwierdzić.' };
  }
  const password = String(formData.get('password') ?? '');
  if (!password) return { error: 'Podaj hasło.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: 'Sesja wygasła. Zaloguj się ponownie.' };
  const admin = tryAdminClient();
  if (!admin) return { error: FAILED };

  if (!(await isOwnPassword(user, password))) return { error: 'Nieprawidłowe hasło.' };

  const club = await admin.rpc('delete_manager_club' as never, { p_user_id: user.id } as never);
  if (club.error) {
    console.error('deleteAccount: club failed', { code: club.error.code });
    return { error: FAILED };
  }
  // The rest of the account rows go with the user. A failure here can be repeated.
  const gone = await admin.auth.admin.deleteUser(user.id);
  if (gone.error) {
    console.error('deleteAccount: user failed', { status: gone.error.status });
    return { error: 'Klub jest usunięty, ale konto jeszcze nie. Spróbuj ponownie za chwilę.' };
  }

  await supabase.auth.signOut({ scope: 'local' });
  revalidatePath('/', 'layout');
  redirect('/konto-usuniete');
}

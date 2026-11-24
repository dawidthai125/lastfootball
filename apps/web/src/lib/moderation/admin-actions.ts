'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { noticeLetter, sendAccountLetter } from '@/lib/auth/account-mail';
import { isNameAllowed } from '@/lib/club/name-filter';
import { normalizeClubName, normalizeShortName } from '@/lib/club/validation';
import { requireOperator } from '@/lib/moderation/admin';
import type { ModerationState } from '@/lib/moderation/types';
import { tryAdminClient } from '@/lib/supabase/admin';

const NOPE: ModerationState = { error: 'Brak uprawnień.', info: null };
/** A hundred years: the account stays blocked until somebody opens it. */
const FOREVER = '876000h';

type Admin = NonNullable<ReturnType<typeof tryAdminClient>>;

async function open(): Promise<{ admin: Admin; operator: string } | null> {
  const operator = await requireOperator();
  const admin = tryAdminClient();
  return operator && admin ? { admin, operator } : null;
}

async function note(admin: Admin, operator: string, action: string, clubId: string, text: string) {
  await admin
    .from('admin_log' as never)
    .insert({ admin_id: operator, action, club_id: clubId, note: text.slice(0, 400) } as never);
}

async function ownerOf(admin: Admin, clubId: string) {
  const { data } = await admin
    .from('clubs')
    .select('owner_id, name')
    .eq('id', clubId)
    .maybeSingle();
  return data?.owner_id ? { ownerId: data.owner_id, name: data.name } : null;
}

/** The owner always learns what happened and why (terms, point 6). */
async function tell(admin: Admin, ownerId: string, title: string, body: string): Promise<boolean> {
  const { data } = await admin.auth.admin.getUserById(ownerId);
  const to = data?.user?.email;
  if (!to) return false;
  const origin = env.appUrl ?? 'https://www.lastfootball.pl';
  return sendAccountLetter(to, noticeLetter(origin, title, body), `mod-${ownerId}-${Date.now()}`);
}

const reasonOf = (formData: FormData) =>
  String(formData.get('reason') ?? '')
    .trim()
    .slice(0, 300);

const done = (text: string, told: boolean): ModerationState => {
  revalidatePath('/admin');
  return { error: null, info: told ? text : `${text} List do gracza nie wyszedł.` };
};

export async function closeReport(
  _prev: ModerationState,
  formData: FormData,
): Promise<ModerationState> {
  const access = await open();
  if (!access) return NOPE;
  const id = String(formData.get('reportId') ?? '');
  const { error } = await access.admin
    .from('club_reports' as never)
    .update({ closed_at: new Date().toISOString() } as never)
    .eq('id', id)
    .is('closed_at', null);
  if (error) return { error: 'Nie udało się zamknąć zgłoszenia.', info: null };
  revalidatePath('/admin');
  return { error: null, info: 'Zgłoszenie zamknięte.' };
}

export async function renameClub(
  _prev: ModerationState,
  formData: FormData,
): Promise<ModerationState> {
  const access = await open();
  if (!access) return NOPE;
  const { admin, operator } = access;
  const clubId = String(formData.get('clubId') ?? '');
  const name = normalizeClubName(String(formData.get('name') ?? ''));
  const short = normalizeShortName(String(formData.get('shortName') ?? ''));
  const reason = reasonOf(formData);
  if (name.length < 3 || name.length > 24 || short.length < 3 || !isNameAllowed(name)) {
    return { error: 'Nazwa 3–24 znaki, skrót 3–4 znaki.', info: null };
  }
  if (reason.length < 3) return { error: 'Podaj powód. Gracz go dostanie.', info: null };
  const owner = await ownerOf(admin, clubId);
  if (!owner) return { error: 'Nie ma takiego klubu.', info: null };
  const { data, error } = await admin.rpc(
    'admin_rename_club' as never,
    { p_club_id: clubId, p_name: name, p_short: short } as never,
  );
  if (error) {
    return {
      error: error.code === '23505' ? 'Ta nazwa jest zajęta.' : 'Nie udało się zmienić nazwy.',
      info: null,
    };
  }
  if ((data as unknown) !== true) return { error: 'Nie ma takiego klubu.', info: null };
  await note(admin, operator, 'nazwa', clubId, `${owner.name} → ${name}: ${reason}`);
  const told = await tell(
    admin,
    owner.ownerId,
    'Zmieniliśmy nazwę klubu',
    `Nowa nazwa: ${name}. Powód: ${reason}`,
  );
  return done('Nazwa zmieniona.', told);
}

export async function blockAccount(
  _prev: ModerationState,
  formData: FormData,
): Promise<ModerationState> {
  const access = await open();
  if (!access) return NOPE;
  const { admin, operator } = access;
  const clubId = String(formData.get('clubId') ?? '');
  const reason = reasonOf(formData);
  if (reason.length < 3) return { error: 'Podaj powód. Gracz go dostanie.', info: null };
  if (
    String(formData.get('confirm') ?? '')
      .trim()
      .toUpperCase() !== 'BLOKUJ'
  ) {
    return { error: 'Wpisz BLOKUJ, żeby potwierdzić.', info: null };
  }
  const owner = await ownerOf(admin, clubId);
  if (!owner) return { error: 'Nie ma takiego klubu.', info: null };
  if (owner.ownerId === operator) return { error: 'To Twoje konto.', info: null };
  const banned = await admin.auth.admin.updateUserById(owner.ownerId, { ban_duration: FOREVER });
  if (banned.error) return { error: 'Nie udało się zablokować konta.', info: null };
  await admin
    .from('blocked_accounts' as never)
    .upsert({ user_id: owner.ownerId, reason } as never, { onConflict: 'user_id' });
  const ended = await admin.rpc(
    'admin_end_sessions' as never,
    { p_user_id: owner.ownerId } as never,
  );
  await note(admin, operator, 'blokada', clubId, `${owner.name}: ${reason}`);
  const told = await tell(
    admin,
    owner.ownerId,
    'Konto zostało zablokowane',
    `Powód: ${reason} Możesz się odwołać na kontakt@lastfootball.pl.`,
  );
  return done(
    ended.error ? 'Konto zablokowane, ale sesja wygaśnie do godziny.' : 'Konto zablokowane.',
    told,
  );
}

export async function unblockAccount(
  _prev: ModerationState,
  formData: FormData,
): Promise<ModerationState> {
  const access = await open();
  if (!access) return NOPE;
  const { admin, operator } = access;
  const clubId = String(formData.get('clubId') ?? '');
  const owner = await ownerOf(admin, clubId);
  if (!owner) return { error: 'Nie ma takiego klubu.', info: null };
  const opened = await admin.auth.admin.updateUserById(owner.ownerId, { ban_duration: 'none' });
  if (opened.error) return { error: 'Nie udało się odblokować konta.', info: null };
  await admin
    .from('blocked_accounts' as never)
    .delete()
    .eq('user_id', owner.ownerId);
  await note(admin, operator, 'odblokowanie', clubId, owner.name);
  const told = await tell(
    admin,
    owner.ownerId,
    'Konto jest odblokowane',
    'Możesz znowu zalogować się do gry.',
  );
  return done('Konto odblokowane.', told);
}

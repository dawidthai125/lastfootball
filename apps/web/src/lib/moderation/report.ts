'use server';

import { after } from 'next/server';

import { env } from '@/config/env';
import { noticeLetter, sendAccountLetter } from '@/lib/auth/account-mail';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { isReportReason, REPORT_REASONS, type ModerationState } from '@/lib/moderation/types';
import { tryAdminClient } from '@/lib/supabase/admin';

const PER_DAY = 5;
/** Letters to the operator share the daily quota of the game. */
const LETTERS_PER_DAY = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

export async function reportClub(
  _prev: ModerationState,
  formData: FormData,
): Promise<ModerationState> {
  const club = await getManagerClub().catch(() => null);
  const admin = tryAdminClient();
  if (!club || !admin) return { error: 'Nie udało się wysłać zgłoszenia.', info: null };
  const reportedId = String(formData.get('clubId') ?? '');
  const reason = formData.get('reason');
  const details = String(formData.get('details') ?? '')
    .trim()
    .slice(0, 300);
  if (!isReportReason(reason)) return { error: 'Wybierz powód.', info: null };
  if (reportedId === club.id) return { error: 'To Twój klub.', info: null };

  const since = new Date(Date.now() - DAY_MS).toISOString();
  const [target, mine, all] = await Promise.all([
    admin.from('clubs').select('id, name').eq('id', reportedId).maybeSingle(),
    admin
      .from('club_reports' as never)
      .select('id', { count: 'exact', head: true })
      .eq('reporter_club_id', club.id)
      .gte('created_at', since),
    admin
      .from('club_reports' as never)
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since),
  ]);
  if (target.error || !target.data) return { error: 'Nie ma takiego klubu.', info: null };
  if (mine.error || (mine.count ?? 0) >= PER_DAY) {
    return { error: 'Na dziś wystarczy zgłoszeń. Spróbuj jutro.', info: null };
  }
  const saved = await admin
    .from('club_reports' as never)
    .insert({
      reporter_club_id: club.id,
      reported_club_id: reportedId,
      reason,
      details,
    } as never)
    .select('id')
    .maybeSingle();
  if (saved.error) {
    return saved.error.code === '23505'
      ? { error: null, info: 'Ten klub już zgłosiłeś. Sprawdzimy to.' }
      : { error: 'Nie udało się wysłać zgłoszenia.', info: null };
  }
  const to = env.contactForwardTo;
  const id = (saved.data as unknown as { id: string } | null)?.id;
  const name = target.data.name;
  if (to && id && !all.error && (all.count ?? 0) < LETTERS_PER_DAY) {
    const origin = env.appUrl ?? 'https://www.lastfootball.pl';
    after(() =>
      sendAccountLetter(
        to,
        noticeLetter(
          `${origin}/admin`,
          'Nowe zgłoszenie',
          `Klub: ${name}. Powód: ${REPORT_REASONS[reason]}.`,
        ),
        `report-${id}`,
      ),
    );
  }
  return { error: null, info: 'Dziękujemy. Sprawdzimy to.' };
}

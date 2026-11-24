/** Server only. Who runs the game, and what the panel shows (D150). */

import { getAuthUser } from '@/lib/auth/session';
import { isReportReason, REPORT_REASONS } from '@/lib/moderation/types';
import { tryAdminClient } from '@/lib/supabase/admin';

/** The id of the signed-in operator, or null. Every page and action of the panel starts here. */
export async function requireOperator(): Promise<string | null> {
  const user = await getAuthUser().catch(() => null);
  const admin = tryAdminClient();
  if (!user || !admin) return null;
  const { data, error } = await admin
    .from('app_admins' as never)
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  return !error && data ? user.id : null;
}

export type PanelClub = {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly season: number;
  readonly createdAt: string;
  readonly blockedFor: string | null;
};

export type PanelReport = {
  readonly id: string;
  readonly clubId: string;
  readonly clubName: string;
  readonly by: string;
  readonly reason: string;
  readonly details: string;
  readonly createdAt: string;
};

export type Panel = {
  readonly clubs: readonly PanelClub[];
  readonly reports: readonly PanelReport[];
  readonly log: readonly { readonly at: string; readonly text: string }[];
};

/** Newest 300 clubs. Addresses of players are not shown. */
export async function loadPanel(): Promise<Panel | null> {
  const admin = tryAdminClient();
  if (!admin) return null;
  const [clubs, reports, blocked, log] = await Promise.all([
    admin
      .from('clubs')
      .select('id, owner_id, name, short_name, season_number, created_at')
      .order('created_at', { ascending: false })
      .limit(300),
    admin
      .from('club_reports' as never)
      .select('id, reporter_club_id, reported_club_id, reason, details, created_at')
      .is('closed_at', null)
      .order('created_at', { ascending: true })
      .limit(100),
    admin.from('blocked_accounts' as never).select('user_id, reason'),
    admin
      .from('admin_log' as never)
      .select('action, note, created_at')
      .order('id', { ascending: false })
      .limit(20),
  ]);
  if (clubs.error || reports.error || blocked.error || log.error) return null;
  const reasons = new Map(
    (blocked.data as unknown as { user_id: string; reason: string }[]).map((row) => [
      row.user_id,
      row.reason,
    ]),
  );
  const open = reports.data as unknown as {
    id: string;
    reporter_club_id: string;
    reported_club_id: string;
    reason: string;
    details: string;
    created_at: string;
  }[];
  const names = new Map(clubs.data.map((club) => [club.id, club.name]));
  const missing = open
    .flatMap((row) => [row.reporter_club_id, row.reported_club_id])
    .filter((id) => !names.has(id));
  if (missing.length > 0) {
    const more = await admin.from('clubs').select('id, name').in('id', missing);
    for (const club of more.data ?? []) names.set(club.id, club.name);
  }
  return {
    clubs: clubs.data.map((club) => ({
      id: club.id,
      name: club.name,
      shortName: club.short_name,
      season: club.season_number,
      createdAt: club.created_at,
      blockedFor: club.owner_id ? (reasons.get(club.owner_id) ?? null) : null,
    })),
    reports: open.map((row) => ({
      id: row.id,
      clubId: row.reported_club_id,
      clubName: names.get(row.reported_club_id) ?? 'Klub',
      by: names.get(row.reporter_club_id) ?? 'Klub',
      reason: isReportReason(row.reason) ? REPORT_REASONS[row.reason] : row.reason,
      details: row.details,
      createdAt: row.created_at,
    })),
    log: (log.data as unknown as { action: string; note: string; created_at: string }[]).map(
      (row) => ({ at: row.created_at, text: `${row.action}: ${row.note}` }),
    ),
  };
}

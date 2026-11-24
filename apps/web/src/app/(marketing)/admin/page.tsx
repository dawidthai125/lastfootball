import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ClubTools, CloseReportForm } from '@/components/admin/AdminForms';
import { loadPanel, requireOperator } from '@/lib/moderation/admin';

import '@/components/legal/legal.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Panel',
  robots: { index: false, follow: false },
};

const day = (value: string) => value.slice(0, 10);

/** For the operator only. Anybody else gets the ordinary "no such page". */
export default async function AdminPage() {
  if (!(await requireOperator())) notFound();
  const panel = await loadPanel();

  return (
    <article className="lf-legal">
      <h1>Panel</h1>
      {!panel ? (
        <p>Nie udało się wczytać danych. Odśwież stronę.</p>
      ) : (
        <>
          <section>
            <h2>Zgłoszenia ({panel.reports.length})</h2>
            {panel.reports.length === 0 ? <p>Brak otwartych zgłoszeń.</p> : null}
            <ul>
              {panel.reports.map((r) => (
                <li key={r.id}>
                  {day(r.createdAt)} · {r.clubName} · {r.reason}
                  {r.details ? ` · ${r.details}` : ''} · od: {r.by}
                  {r.club?.blockedFor ? ` · ZABLOKOWANE: ${r.club.blockedFor}` : ''}
                  {r.club ? (
                    <ClubTools
                      clubId={r.club.id}
                      name={r.club.name}
                      shortName={r.club.shortName}
                      blocked={r.club.blockedFor !== null}
                    />
                  ) : null}
                  <CloseReportForm reportId={r.id} />
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2>Kluby ({panel.clubs.length})</h2>
            <ul>
              {panel.clubs.map((c) => (
                <li key={c.id}>
                  {c.name} ({c.shortName}) · sezon {c.season} · od {day(c.createdAt)}
                  {c.blockedFor ? ` · ZABLOKOWANE: ${c.blockedFor}` : ''}
                  <ClubTools
                    clubId={c.id}
                    name={c.name}
                    shortName={c.shortName}
                    blocked={c.blockedFor !== null}
                  />
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2>Ostatnie działania</h2>
            {panel.log.length === 0 ? <p>Brak.</p> : null}
            <ul>
              {panel.log.map((row) => (
                <li key={`${row.at}${row.text}`}>
                  {day(row.at)} · {row.text}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </article>
  );
}

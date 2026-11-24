import Link from 'next/link';

/** A match that went on: its line-up is closed, and it comes before any other (D150). */
export function OpenMatchNotice({
  fixtureId,
  other = false,
}: {
  readonly fixtureId: string;
  readonly other?: boolean;
}) {
  return (
    <div style={{ display: 'grid', gap: 'var(--lf-space-3)' }}>
      <p style={{ margin: 0, color: 'var(--lf-color-text-primary)' }}>
        {other
          ? 'Masz niedokończony inny mecz. Dokończ go najpierw.'
          : 'Ten mecz już trwa. Skład i ustawienie wyjściowe są zamknięte.'}
      </p>
      <Link href={`/match/${fixtureId}/live`} style={{ color: 'var(--lf-color-text-gold)' }}>
        Wróć do meczu
      </Link>
    </div>
  );
}

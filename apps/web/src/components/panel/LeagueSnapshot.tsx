import { dashboardMock } from '@/data/mock';
import { SectionLink, SectionShell } from '@/components/panel/SectionShell';
import { ClubCrest } from '@/components/assets';

export function LeagueSnapshot() {
  const rows = dashboardMock.standingsPreview;

  return (
    <SectionShell
      title="Tabela ligi — top 5"
      flush
      action={<SectionLink href="/league">pełna →</SectionLink>}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 'var(--lf-type-table)',
          textAlign: 'left',
        }}
      >
        <thead>
          <tr style={{ background: 'var(--lf-color-bg-inset)' }}>
            {['#', 'Klub', '+/−', 'Pkt'].map((h) => (
              <th
                key={h}
                className="font-[family-name:var(--font-ui)] font-semibold uppercase"
                style={{
                  padding: 'var(--lf-space-2)',
                  fontSize: 'var(--lf-type-label)',
                  letterSpacing: 'var(--lf-type-tracking-label)',
                  color: 'var(--lf-color-text-faint)',
                  textAlign: h === '#' || h === 'Klub' ? 'left' : 'right',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.pos}
              style={{
                borderBottomWidth: 'var(--lf-border-width-hair)',
                borderBottomStyle: 'solid',
                borderBottomColor: 'var(--lf-color-border-subtle)',
                background: r.self ? 'var(--lf-color-gold-soft)' : 'transparent',
              }}
            >
              <td
                className="tabular-nums"
                style={{ padding: 'var(--lf-space-2)', color: 'var(--lf-color-text-faint)' }}
              >
                {r.pos}
              </td>
              <td
                style={{
                  padding: 'var(--lf-space-2)',
                  fontWeight: r.self ? 600 : 400,
                  color: r.self ? 'var(--lf-color-text-gold)' : 'var(--lf-color-text-secondary)',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--lf-space-2)',
                  }}
                >
                  <ClubCrest clubName={r.club} size="sm" />
                  {r.club}
                </span>
              </td>
              <td
                className="tabular-nums"
                style={{
                  padding: 'var(--lf-space-2)',
                  textAlign: 'right',
                  color: 'var(--lf-color-text-muted)',
                }}
              >
                {r.gd > 0 ? `+${r.gd}` : r.gd}
              </td>
              <td
                className="tabular-nums font-semibold"
                style={{
                  padding: 'var(--lf-space-2)',
                  textAlign: 'right',
                  color: 'var(--lf-color-text-primary)',
                }}
              >
                {r.pts}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionShell>
  );
}

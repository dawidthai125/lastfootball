import { dashboardMock } from '@/data/mock';
import { SectionShell } from '@/components/panel/SectionShell';

export function RecentResults() {
  const rows = dashboardMock.recentResults;

  return (
    <SectionShell title="Ostatnie wyniki" flush>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 'var(--lf-type-table)',
        }}
      >
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.opp}
              style={{
                borderBottomWidth: 'var(--lf-border-width-hair)',
                borderBottomStyle: 'solid',
                borderBottomColor: 'var(--lf-color-border-subtle)',
              }}
            >
              <td style={{ padding: 'var(--lf-space-2)', width: '2.5rem' }}>
                <span
                  className="font-[family-name:var(--font-ui)] font-semibold uppercase"
                  style={{
                    display: 'inline-block',
                    fontSize: 'var(--lf-type-label)',
                    padding: '0 var(--lf-space-1)',
                    borderWidth: 'var(--lf-border-width-hair)',
                    borderStyle: 'solid',
                    borderRadius: 'var(--lf-radius-xs)',
                    borderColor:
                      r.result === 'W'
                        ? 'var(--lf-color-status-ok)'
                        : r.result === 'P'
                          ? 'var(--lf-color-status-danger)'
                          : 'var(--lf-color-border-subtle)',
                    background:
                      r.result === 'W'
                        ? 'var(--lf-color-status-ok-soft)'
                        : r.result === 'P'
                          ? 'var(--lf-color-status-danger-soft)'
                          : 'var(--lf-color-bg-inset)',
                    color:
                      r.result === 'W'
                        ? 'var(--lf-color-status-ok)'
                        : r.result === 'P'
                          ? 'var(--lf-color-status-danger)'
                          : 'var(--lf-color-text-muted)',
                  }}
                >
                  {r.result}
                </span>
              </td>
              <td style={{ padding: 'var(--lf-space-2)', color: 'var(--lf-color-text-secondary)' }}>
                {r.opp}
              </td>
              <td
                className="tabular-nums"
                style={{
                  padding: 'var(--lf-space-2)',
                  textAlign: 'right',
                  color: 'var(--lf-color-text-primary)',
                }}
              >
                {r.score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionShell>
  );
}

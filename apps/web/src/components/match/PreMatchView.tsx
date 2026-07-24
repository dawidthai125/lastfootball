import Link from 'next/link';

import { AtmosphereLayer } from '@/components/assets';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CrestMonogram, FormPills } from '@/components/match/CrestMonogram';
import { SectionShell } from '@/components/panel/SectionShell';
import type { PreMatchBundle } from '@/data/fixtures';
import { FIRST_MATCH_PATHS } from '@/lib/first-match/constants';

/**
 * Pre Match — layout aligned to LFE-UI-01 mockup-16.
 * Lineup / tactics are read-only; decision panel stays placeholder.
 */
export function PreMatchView({
  bundle,
  firstMatch = false,
}: {
  bundle: PreMatchBundle;
  firstMatch?: boolean;
}) {
  const { fixture } = bundle;
  const home = fixture.home ? bundle.ourTeam : bundle.theirTeam;
  const away = fixture.home ? bundle.theirTeam : bundle.ourTeam;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-4)' }}>
      <Breadcrumbs
        items={
          firstMatch
            ? [
                { label: 'Pierwszy mecz', href: FIRST_MATCH_PATHS.intro },
                { label: `vs ${fixture.opponent}` },
              ]
            : [
                { label: 'Rozgrywki', href: '/league' },
                { label: 'Terminarz', href: '/matches' },
                { label: `vs ${fixture.opponent}` },
              ]
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(14rem, 18rem) minmax(0, 1fr) minmax(14rem, 18rem)',
          gap: 'var(--lf-space-3)',
          alignItems: 'start',
        }}
      >
        {/* Left — lineup preview (no edit) */}
        <SectionShell
          title="Wybór składu"
          action={<span style={{ color: 'var(--lf-color-text-faint)' }}>{bundle.formation}</span>}
        >
          <div
            style={{
              display: 'flex',
              gap: 'var(--lf-space-1)',
              marginBottom: 'var(--lf-space-3)',
              flexWrap: 'wrap',
            }}
          >
            {[
              { id: 'xi', label: 'Wyjściowa 11', active: true },
              { id: 'bench', label: 'Rezerwowi', active: false },
              { id: 'tactics', label: 'Taktyka', active: false },
            ].map((tab) => (
              <span
                key={tab.id}
                className="font-[family-name:var(--font-ui)] font-semibold uppercase"
                style={{
                  fontSize: 'var(--lf-type-label)',
                  letterSpacing: 'var(--lf-type-tracking-label)',
                  padding: 'var(--lf-space-1) var(--lf-space-2)',
                  borderWidth: 'var(--lf-border-width-hair)',
                  borderStyle: 'solid',
                  borderRadius: 'var(--lf-radius-sm)',
                  borderColor: tab.active
                    ? 'var(--lf-color-border-gold)'
                    : 'var(--lf-color-border-subtle)',
                  background: tab.active ? 'var(--lf-color-gold-soft)' : 'var(--lf-color-bg-inset)',
                  color: tab.active ? 'var(--lf-color-gold-base)' : 'var(--lf-color-text-faint)',
                }}
              >
                {tab.label}
              </span>
            ))}
          </div>

          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {bundle.ourLineup.map((r) => (
              <li
                key={`${r.number}-${r.name}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'var(--lf-space-5) var(--lf-space-6) minmax(0, 1fr) auto auto',
                  gap: 'var(--lf-space-2)',
                  alignItems: 'center',
                  borderBottomWidth: 'var(--lf-border-width-hair)',
                  borderBottomStyle: 'solid',
                  borderBottomColor: 'var(--lf-color-border-subtle)',
                  padding: 'var(--lf-space-2) 0',
                  fontSize: 'var(--lf-type-table)',
                }}
              >
                <span className="tabular-nums" style={{ color: 'var(--lf-color-text-faint)' }}>
                  {r.number}
                </span>
                <span
                  className="font-[family-name:var(--font-ui)] font-semibold"
                  style={{ color: 'var(--lf-color-text-gold)' }}
                >
                  {r.pos}
                </span>
                <span style={{ color: 'var(--lf-color-text-primary)', minWidth: 0 }}>
                  {r.id ? (
                    <Link href={`/players/${r.id}`} style={{ color: 'inherit' }}>
                      {r.name}
                    </Link>
                  ) : (
                    r.name
                  )}
                  {r.captain ? (
                    <span
                      style={{
                        marginLeft: 'var(--lf-space-1)',
                        color: 'var(--lf-color-gold-base)',
                        fontSize: 'var(--lf-type-label)',
                      }}
                    >
                      C
                    </span>
                  ) : null}
                </span>
                <ConditionBars value={r.condition} />
                <span className="tabular-nums" style={{ color: 'var(--lf-color-text-muted)' }}>
                  {r.rating}
                </span>
              </li>
            ))}
          </ul>

          <div
            style={{
              marginTop: 'var(--lf-space-3)',
              borderTopWidth: 'var(--lf-border-width-hair)',
              borderTopStyle: 'solid',
              borderTopColor: 'var(--lf-color-border-subtle)',
              paddingTop: 'var(--lf-space-3)',
            }}
          >
            <div
              className="font-[family-name:var(--font-ui)] font-semibold uppercase"
              style={{
                fontSize: 'var(--lf-type-label)',
                letterSpacing: 'var(--lf-type-tracking-label)',
                color: 'var(--lf-color-text-faint)',
              }}
            >
              Kondycja zespołu
            </div>
            <div
              style={{
                marginTop: 'var(--lf-space-1)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 'var(--lf-type-caption)',
                color: 'var(--lf-color-text-secondary)',
              }}
            >
              <span>{bundle.teamCondition.label}</span>
              <span className="tabular-nums">{bundle.teamCondition.value}</span>
            </div>
            <div
              style={{
                marginTop: 'var(--lf-space-2)',
                height: 'var(--lf-space-1)',
                background: 'var(--lf-color-bg-inset)',
                borderRadius: 'var(--lf-radius-xs)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${bundle.teamCondition.value}%`,
                  height: '100%',
                  background: 'var(--lf-color-status-ok)',
                }}
              />
            </div>
            <p
              style={{
                margin: 0,
                marginTop: 'var(--lf-space-2)',
                fontSize: 'var(--lf-type-label)',
                color: 'var(--lf-color-text-faint)',
              }}
            >
              Edycja składu — poza zakresem IMPL-05
            </p>
          </div>
        </SectionShell>

        {/* Center — hero + stakes + CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-3)' }}>
          <AtmosphereLayer
            aria-label="Hero meczu"
            style={{
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-subtle)',
              background: 'var(--lf-color-bg-panel)',
              borderRadius: 'var(--lf-radius-sm)',
              padding: 'var(--lf-space-5)',
              textAlign: 'center',
            }}
          >
            <p
              className="font-[family-name:var(--font-ui)] font-semibold uppercase"
              style={{
                margin: 0,
                fontSize: 'var(--lf-type-label)',
                letterSpacing: 'var(--lf-type-tracking-label)',
                color: 'var(--lf-color-text-gold)',
              }}
            >
              {fixture.competitionLabel}
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--lf-space-5)',
                marginTop: 'var(--lf-space-4)',
              }}
            >
              <div>
                <CrestMonogram initials={home.shortName} label={home.name} />
                <div style={{ marginTop: 'var(--lf-space-2)' }}>
                  <FormPills form={home.form} />
                </div>
              </div>
              <div style={{ minWidth: 'calc(var(--lf-space-8) * 2)' }}>
                <div
                  className="font-[family-name:var(--font-ui)] font-bold"
                  style={{
                    fontSize: 'var(--lf-type-hero)',
                    color: 'var(--lf-color-text-gold)',
                    lineHeight: 1,
                  }}
                >
                  VS
                </div>
                <div
                  className="tabular-nums"
                  style={{
                    marginTop: 'var(--lf-space-2)',
                    fontSize: 'var(--lf-type-h2)',
                    color: 'var(--lf-color-text-primary)',
                  }}
                >
                  {bundle.countdown}
                </div>
                <div
                  style={{
                    marginTop: 'var(--lf-space-1)',
                    fontSize: 'var(--lf-type-caption)',
                    color: 'var(--lf-color-status-warn)',
                  }}
                >
                  {fixture.dateLabel ?? fixture.whenLabel}
                  {fixture.kickoff ? ` · ${fixture.kickoff}` : ''}
                </div>
              </div>
              <div>
                <CrestMonogram initials={away.shortName} label={away.name} />
                <div style={{ marginTop: 'var(--lf-space-2)' }}>
                  <FormPills form={away.form} />
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 'var(--lf-space-3)',
                marginTop: 'var(--lf-space-5)',
              }}
            >
              {bundle.stakes.map((s) => (
                <div
                  key={s.id}
                  style={{
                    borderWidth: 'var(--lf-border-width-hair)',
                    borderStyle: 'solid',
                    borderColor: 'var(--lf-color-border-subtle)',
                    background: 'var(--lf-color-bg-inset)',
                    borderRadius: 'var(--lf-radius-sm)',
                    padding: 'var(--lf-space-3)',
                  }}
                >
                  <div
                    className="font-[family-name:var(--font-ui)] font-semibold uppercase"
                    style={{
                      fontSize: 'var(--lf-type-label)',
                      letterSpacing: 'var(--lf-type-tracking-label)',
                      color: 'var(--lf-color-text-faint)',
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      marginTop: 'var(--lf-space-1)',
                      fontSize: 'var(--lf-type-caption)',
                      color: 'var(--lf-color-text-primary)',
                    }}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 'var(--lf-space-3)',
                marginTop: 'var(--lf-space-3)',
              }}
            >
              <MetaCell label="Stadion" value={fixture.stadium} />
              <MetaCell
                label="Termin"
                value={`${fixture.dateLabel ?? fixture.whenLabel}${fixture.kickoff ? ` · ${fixture.kickoff}` : ''}`}
              />
              <MetaCell label="Pogoda" value={`${bundle.temperature} · ${bundle.weatherDetail}`} />
            </div>

            <p
              style={{
                margin: 0,
                marginTop: 'var(--lf-space-2)',
                fontSize: 'var(--lf-type-label)',
                color: 'var(--lf-color-text-faint)',
              }}
            >
              {bundle.weatherNote}
            </p>

            <div
              style={{
                marginTop: 'var(--lf-space-5)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--lf-space-2)',
                justifyContent: 'center',
              }}
            >
              {firstMatch ? (
                <Link
                  href={FIRST_MATCH_PATHS.intro}
                  style={{
                    borderWidth: 'var(--lf-border-width-hair)',
                    borderStyle: 'solid',
                    borderColor: 'var(--lf-color-border-strong)',
                    background: 'var(--lf-color-bg-panel-alt)',
                    color: 'var(--lf-color-text-secondary)',
                    fontSize: 'var(--lf-type-body)',
                    padding: 'var(--lf-space-2) var(--lf-space-4)',
                    borderRadius: 'var(--lf-radius-sm)',
                  }}
                >
                  Wstecz
                </Link>
              ) : (
                <Link
                  href="/matches"
                  style={{
                    borderWidth: 'var(--lf-border-width-hair)',
                    borderStyle: 'solid',
                    borderColor: 'var(--lf-color-border-strong)',
                    background: 'var(--lf-color-bg-panel-alt)',
                    color: 'var(--lf-color-text-secondary)',
                    fontSize: 'var(--lf-type-body)',
                    padding: 'var(--lf-space-2) var(--lf-space-4)',
                    borderRadius: 'var(--lf-radius-sm)',
                  }}
                >
                  Wróć do terminarza
                </Link>
              )}
              <Link
                href={`/match/${fixture.id}/live`}
                style={{
                  borderWidth: 'var(--lf-border-width-hair)',
                  borderStyle: 'solid',
                  borderColor: 'var(--lf-color-border-gold)',
                  background: 'var(--lf-color-gold-soft)',
                  color: 'var(--lf-color-gold-base)',
                  fontSize: 'var(--lf-type-body)',
                  fontWeight: 600,
                  padding: 'var(--lf-space-2) var(--lf-space-5)',
                  borderRadius: 'var(--lf-radius-sm)',
                }}
              >
                {firstMatch ? 'Rozpocznij pierwszy mecz' : 'Rozpocznij mecz'}
              </Link>
            </div>
          </AtmosphereLayer>

          <SectionShell title="Ostatnie spotkania (H2H)">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--lf-space-3)' }}>
              {bundle.h2h.map((h) => (
                <div key={`${h.score}-${h.when}`} style={{ fontSize: 'var(--lf-type-caption)' }}>
                  <span
                    className="font-[family-name:var(--font-ui)] font-semibold tabular-nums"
                    style={{ color: 'var(--lf-color-text-primary)' }}
                  >
                    {h.score}
                  </span>
                  <span
                    style={{ marginLeft: 'var(--lf-space-2)', color: 'var(--lf-color-text-muted)' }}
                  >
                    {h.when}
                  </span>
                </div>
              ))}
            </div>
          </SectionShell>

          <SectionShell title="Panel decyzji">
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--lf-space-2)',
              }}
            >
              {bundle.decisions.map((d) => (
                <li
                  key={d.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 'var(--lf-space-3)',
                    borderWidth: 'var(--lf-border-width-hair)',
                    borderStyle: 'solid',
                    borderColor: 'var(--lf-color-border-subtle)',
                    background: 'var(--lf-color-bg-inset)',
                    padding: 'var(--lf-space-2) var(--lf-space-3)',
                    borderRadius: 'var(--lf-radius-sm)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: 'var(--lf-color-text-primary)',
                        fontSize: 'var(--lf-type-table)',
                      }}
                    >
                      {d.label}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--lf-type-caption)',
                        color: 'var(--lf-color-text-muted)',
                      }}
                    >
                      {d.hint}
                    </div>
                  </div>
                  <span
                    style={{
                      alignSelf: 'center',
                      fontSize: 'var(--lf-type-label)',
                      color: 'var(--lf-color-text-faint)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Placeholder
                  </span>
                </li>
              ))}
            </ul>
          </SectionShell>
        </div>

        {/* Right — tactics read-only */}
        <SectionShell title="Taktyka" action={<span>{bundle.formation}</span>}>
          <p
            style={{
              margin: 0,
              marginBottom: 'var(--lf-space-3)',
              fontSize: 'var(--lf-type-caption)',
              color: 'var(--lf-color-text-muted)',
            }}
          >
            Styl gry:{' '}
            <strong style={{ color: 'var(--lf-color-text-secondary)' }}>{bundle.styleLabel}</strong>
          </p>

          <div style={{ display: 'grid', gap: 'var(--lf-space-3)' }}>
            {bundle.tactics.map((t) => (
              <div key={t.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 'var(--lf-type-caption)',
                    color: 'var(--lf-color-text-muted)',
                  }}
                >
                  <span>{t.label}</span>
                  <span className="tabular-nums">{t.value}</span>
                </div>
                <div
                  style={{
                    marginTop: 'var(--lf-space-1)',
                    height: 'var(--lf-space-1)',
                    background: 'var(--lf-color-bg-inset)',
                    borderRadius: 'var(--lf-radius-xs)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${t.value}%`,
                      height: '100%',
                      background: 'var(--lf-color-gold-dim)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            aria-label="Podgląd ustawienia (bez Canvas)"
            style={{
              marginTop: 'var(--lf-space-4)',
              position: 'relative',
              aspectRatio: '2 / 3',
              background: 'var(--lf-color-pitch)',
              borderRadius: 'var(--lf-radius-sm)',
              borderWidth: 'var(--lf-border-width-hair)',
              borderStyle: 'solid',
              borderColor: 'var(--lf-color-border-subtle)',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 'var(--lf-space-2)',
                borderWidth: 'var(--lf-border-width-hair)',
                borderStyle: 'solid',
                borderColor: 'var(--lf-color-border-gold)',
                opacity: 'var(--lf-opacity-muted)',
              }}
            />
            {bundle.pitchSlots.map((s) => (
              <span
                key={s.number}
                className="font-[family-name:var(--font-ui)] font-semibold tabular-nums"
                style={{
                  position: 'absolute',
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 'var(--lf-space-5)',
                  height: 'var(--lf-space-5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--lf-radius-md)',
                  background: 'var(--lf-color-bg-panel)',
                  borderWidth: 'var(--lf-border-width-hair)',
                  borderStyle: 'solid',
                  borderColor: 'var(--lf-color-border-gold)',
                  color: 'var(--lf-color-text-gold)',
                  fontSize: 'var(--lf-type-label)',
                }}
              >
                {s.number}
              </span>
            ))}
          </div>

          <p
            style={{
              margin: 0,
              marginTop: 'var(--lf-space-2)',
              fontSize: 'var(--lf-type-label)',
              color: 'var(--lf-color-text-faint)',
            }}
          >
            Edycja taktyki — poza zakresem IMPL-05
          </p>
        </SectionShell>
      </div>

      <div
        role="status"
        style={{
          borderWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-subtle)',
          background: 'var(--lf-color-bg-panel-alt)',
          borderRadius: 'var(--lf-radius-sm)',
          padding: 'var(--lf-space-2) var(--lf-space-3)',
          fontSize: 'var(--lf-type-caption)',
          color: 'var(--lf-color-text-muted)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 'var(--lf-space-2)',
        }}
      >
        <span>{bundle.ticker}</span>
        <span style={{ color: 'var(--lf-color-text-faint)' }}>Analiza przeciwnika — wkrótce</span>
      </div>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderWidth: 'var(--lf-border-width-hair)',
        borderStyle: 'solid',
        borderColor: 'var(--lf-color-border-subtle)',
        background: 'var(--lf-color-bg-inset)',
        borderRadius: 'var(--lf-radius-sm)',
        padding: 'var(--lf-space-3)',
      }}
    >
      <div
        className="font-[family-name:var(--font-ui)] font-semibold uppercase"
        style={{
          fontSize: 'var(--lf-type-label)',
          letterSpacing: 'var(--lf-type-tracking-label)',
          color: 'var(--lf-color-text-faint)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 'var(--lf-space-1)',
          fontSize: 'var(--lf-type-caption)',
          color: 'var(--lf-color-text-secondary)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ConditionBars({ value }: { value: number }) {
  return (
    <span
      style={{ display: 'inline-flex', gap: 'var(--lf-border-width-hair)' }}
      aria-label={`Kondycja ${value}/4`}
    >
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          style={{
            width: 'var(--lf-space-1)',
            height: 'var(--lf-space-3)',
            background: n <= value ? 'var(--lf-color-status-ok)' : 'var(--lf-color-bg-inset)',
            borderRadius: 'var(--lf-radius-xs)',
          }}
        />
      ))}
    </span>
  );
}

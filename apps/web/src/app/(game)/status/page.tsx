import { getEngineStatus } from '@lastfootball/lfe';

import { Badge } from '@/components/ui/Badge';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatBlock } from '@/components/ui/StatBlock';
import { Table } from '@/components/ui/Table';
import { env } from '@/config/env';
import { getSupabaseStatus } from '@/lib/supabase/status';

export const dynamic = 'force-dynamic';

export default function EngineStatusPage() {
  const engine = getEngineStatus();
  const supabase = getSupabaseStatus();
  const readyCount = engine.modules.filter((m) => m.ready).length;

  return (
    <div>
      <SectionHeader
        title="Status silnika"
        subtitle="Podgląd foundation LFE — bez aktywnej symulacji meczu"
        action={<Badge tone="warn">{engine.status}</Badge>}
      />

      <div className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <StatBlock label="Nazwa" value={engine.name} />
        <StatBlock label="Wersja" value={engine.version} tone="gold" />
        <StatBlock label="Moduły" value={`${readyCount}/${engine.modules.length}`} tone="ok" />
        <StatBlock label="NODE_ENV" value={env.nodeEnv} />
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        <Panel title="Runtime">
          <dl className="grid grid-cols-2 gap-1.5 text-[12px]">
            <div>
              <dt className="text-[10px] text-[var(--lf-faint)] uppercase">VERCEL_ENV</dt>
              <dd className="font-mono">{env.vercelEnv ?? 'n/a'}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-[var(--lf-faint)] uppercase">Checked at</dt>
              <dd className="font-mono text-[11px]">{engine.checkedAt}</dd>
            </div>
          </dl>
        </Panel>

        <Panel title="Supabase">
          {supabase.configured ? (
            <p className="text-[12px]">
              Skonfigurowany · host{' '}
              <span className="font-mono text-[var(--lf-gold)]">{supabase.urlHost}</span>
            </p>
          ) : (
            <p className="text-[12px] text-[var(--lf-warn)]">
              Brak konfiguracji — ustaw NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY
            </p>
          )}
        </Panel>

        <Panel title="Moduły LFE" flush className="lg:col-span-2">
          <Table
            rowKey={(m) => m.id}
            rows={engine.modules}
            columns={[
              {
                key: 'label',
                header: 'Moduł',
                render: (m) => <span className="font-medium">{m.label}</span>,
              },
              {
                key: 'notes',
                header: 'Notatki',
                render: (m) => <span className="text-[var(--lf-muted)]">{m.notes}</span>,
              },
              {
                key: 'ready',
                header: 'Stan',
                align: 'right',
                render: (m) => (
                  <Badge tone={m.ready ? 'ok' : 'default'}>{m.ready ? 'ready' : 'stub'}</Badge>
                ),
              },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}

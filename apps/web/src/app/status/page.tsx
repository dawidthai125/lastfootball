import Link from 'next/link';
import { getEngineStatus } from '@lastfootball/lfe';

import { env } from '@/config/env';
import { getSupabaseStatus } from '@/lib/supabase/status';

export const dynamic = 'force-dynamic';

export default function EngineStatusPage() {
  const engine = getEngineStatus();
  const supabase = getSupabaseStatus();
  const readyCount = engine.modules.filter((m) => m.ready).length;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <div className="mb-10 space-y-3">
        <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
          ← Home
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Engine status</h1>
        <p className="text-[var(--muted)]">
          Read-only foundation check for Last Football Engine. No match simulation is active.
        </p>
      </div>

      <section className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--muted)]">Name</dt>
            <dd className="font-medium">{engine.name}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Version</dt>
            <dd className="font-mono">{engine.version}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Status</dt>
            <dd>
              <span className="rounded-full border border-[var(--warn)]/40 bg-[var(--warn)]/10 px-2 py-0.5 text-[var(--warn)]">
                {engine.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Modules ready</dt>
            <dd className="font-mono">
              {readyCount}/{engine.modules.length}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[var(--muted)]">Checked at</dt>
            <dd className="font-mono text-xs">{engine.checkedAt}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-[var(--muted)] uppercase">
          Runtime
        </h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--muted)]">NODE_ENV</dt>
            <dd className="font-mono">{env.nodeEnv}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">VERCEL_ENV</dt>
            <dd className="font-mono">{env.vercelEnv ?? 'n/a'}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-[var(--muted)] uppercase">
          Supabase
        </h2>
        <p className="text-sm">
          {supabase.configured ? (
            <>
              Configured · host{' '}
              <span className="font-mono text-[var(--accent)]">{supabase.urlHost}</span>
            </>
          ) : (
            <span className="text-[var(--warn)]">
              Not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
            </span>
          )}
        </p>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-[var(--muted)] uppercase">
          LFE modules
        </h2>
        <ul className="divide-y divide-[var(--border)]">
          {engine.modules.map((mod) => (
            <li key={mod.id} className="flex items-start justify-between gap-4 py-3 text-sm">
              <div>
                <p className="font-medium">{mod.label}</p>
                <p className="text-[var(--muted)]">{mod.notes}</p>
              </div>
              <span
                className={
                  mod.ready ? 'shrink-0 text-[var(--accent)]' : 'shrink-0 text-[var(--muted)]'
                }
              >
                {mod.ready ? 'ready' : 'stub'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

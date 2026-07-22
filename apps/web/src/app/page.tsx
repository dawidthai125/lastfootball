import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm tracking-[0.2em] text-[var(--muted)] uppercase">Last Football</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Foundation ready</h1>
        <p className="max-w-xl text-[var(--muted)]">
          Monorepo scaffold: Next.js app, LFE package stubs, Supabase clients, CI, and Vercel
          config. Game logic is intentionally not implemented yet.
        </p>
      </div>

      <Link
        href="/status"
        className="inline-flex w-fit items-center rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium transition hover:border-[var(--accent)]"
      >
        Engine status →
      </Link>
    </main>
  );
}

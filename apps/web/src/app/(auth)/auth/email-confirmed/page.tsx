import type { Metadata } from 'next';

import { ConfirmEmailForm } from '@/components/auth/ConfirmEmailForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Email',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default async function EmailConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="lf-landing__gate lf-landing__gate--auth">
      <p className="lf-landing__eyebrow">Konto</p>
      <ConfirmEmailForm token={typeof token === 'string' ? token : ''} />
    </div>
  );
}

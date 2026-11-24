import type { Metadata } from 'next';

import { ConfirmEmailChangeForm } from '@/components/auth/ConfirmEmailChangeForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nowy adres',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default async function EmailChangePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="lf-landing__gate lf-landing__gate--auth">
      <p className="lf-landing__eyebrow">Konto</p>
      <ConfirmEmailChangeForm token={typeof token === 'string' ? token : ''} />
    </div>
  );
}

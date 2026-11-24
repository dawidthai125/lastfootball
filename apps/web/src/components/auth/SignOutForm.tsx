'use client';

import type { ReactNode } from 'react';

import { signOut } from '@/lib/auth/actions';
import { forgetBrowserPush } from '@/lib/notifications/browser';

/** Signs out and takes this device's notifications along, so the next person does not get them. */
export function SignOutForm({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <form
      className={className}
      action={async () => {
        await signOut(await forgetBrowserPush());
      }}
    >
      {children}
    </form>
  );
}

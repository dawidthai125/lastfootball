'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { LeftNavigation } from '@/components/layout/LeftNavigation';
import { MobileNav } from '@/components/layout/MobileNav';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { ShellProvider, useShell } from '@/components/layout/ShellProvider';
import { TopBar } from '@/components/layout/TopBar';
import { OverlayProvider } from '@/components/overlay/OverlayProvider';
import { OverlayRoot } from '@/components/overlay/OverlayRoot';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

function ShellFrame({ children }: { children: ReactNode }) {
  const { navCollapsed, showRail } = useShell();
  const pathname = usePathname();
  const isLiveMatch = /^\/match\/[^/]+\/live\/?$/.test(pathname);
  const railVisible = showRail && !isLiveMatch;

  const bodyClass = [
    'lf-app-shell__body',
    navCollapsed ? 'lf-app-shell__body--collapsed' : '',
    railVisible ? 'lf-app-shell__body--with-rail' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="lf-app-shell">
      <TopBar />
      <MobileNav />
      <div className={bodyClass}>
        <LeftNavigation />
        <main className="lf-app-shell__main">{children}</main>
        {railVisible ? (
          <div className="lf-app-shell__rail">
            <RightSidebar />
          </div>
        ) : null}
      </div>
      <OverlayRoot />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <OverlayProvider>
        <ShellProvider showRail>
          <ShellFrame>{children}</ShellFrame>
        </ShellProvider>
      </OverlayProvider>
    </ThemeProvider>
  );
}

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
  const isHub = pathname === '/hub' || pathname === '/hub/';
  const isMatchPath = pathname === '/match' || pathname.startsWith('/match/');
  // LFE-UI-IMPL-02: hide rail + nav during Match Path (Hi-Fi immersive).
  const railVisible = showRail && !isHub && !isMatchPath;
  const hideMatchChrome = isMatchPath;

  const bodyClass = [
    'lf-app-shell__body',
    navCollapsed ? 'lf-app-shell__body--collapsed' : '',
    railVisible ? 'lf-app-shell__body--with-rail' : '',
    hideMatchChrome ? 'lf-app-shell__body--match-path' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const isLiveMatch = /^\/match\/[^/]+\/live\/?$/.test(pathname);
  const mainClass = ['lf-app-shell__main', isLiveMatch ? 'lf-app-shell__main--live' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="lf-app-shell"
      data-lf-impl={hideMatchChrome ? 'LFE-UI-IMPL-02' : 'LFE-UI-IMPL-01'}
      data-match-path={hideMatchChrome ? 'immersive' : undefined}
    >
      {hideMatchChrome ? null : <TopBar />}
      {hideMatchChrome ? null : <MobileNav />}
      <div className={bodyClass}>
        {hideMatchChrome ? null : <LeftNavigation />}
        <main className={mainClass}>{children}</main>
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

import type { Metadata } from 'next';
import { Barlow_Semi_Condensed, IBM_Plex_Sans } from 'next/font/google';

import { AppShell } from '@/components/layout/AppShell';

import './globals.css';

/** Display / UI chrome — tokens: lf.font.display */
const fontDisplay = Barlow_Semi_Condensed({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
});

/** Body / data — tokens: lf.font.body */
const fontBody = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'LastFootball',
    template: '%s · LastFootball',
  },
  description: 'Przeglądarkowy menedżer piłkarski LastFootball',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${fontDisplay.variable} ${fontBody.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

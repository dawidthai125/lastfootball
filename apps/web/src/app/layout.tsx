import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Barlow_Semi_Condensed, IBM_Plex_Sans } from 'next/font/google';

import { ThemeProvider } from '@/components/theme/ThemeProvider';

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
  description: 'Załóż klub. Prowadź go przez ligę. Każdy mecz jest Twój.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl" className={`${fontDisplay.variable} ${fontBody.variable}`}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Archivo, Source_Sans_3 } from 'next/font/google';

import { ThemeProvider } from '@/components/theme/ThemeProvider';

import './globals.css';

/** Heading / UI chrome — SKIN-01 Archivo (LFE-UI-IMPL-04 / PTI-03). */
const fontDisplay = Archivo({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
});

/** Body / data — SKIN-01 Source Sans 3. */
const fontBody = Source_Sans_3({
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

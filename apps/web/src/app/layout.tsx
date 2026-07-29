import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Archivo, Source_Sans_3 } from 'next/font/google';

import { env } from '@/config/env';
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
  metadataBase: new URL(env.appUrl ?? 'https://lastfootball.vercel.app'),
  title: {
    default: 'LastFootball',
    template: '%s · LastFootball',
  },
  description: 'Załóż klub. Prowadź go przez ligę. Każdy mecz jest Twój.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    title: 'LastFootball',
    description: 'Załóż klub. Prowadź go przez ligę. Każdy mecz jest Twój.',
    images: [{ url: '/social-preview.png', width: 1200, height: 630, alt: 'LastFootball' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LastFootball',
    description: 'Załóż klub. Prowadź go przez ligę. Każdy mecz jest Twój.',
    images: ['/social-preview.png'],
  },
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

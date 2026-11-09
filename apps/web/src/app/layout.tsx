import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@fontsource/archivo/latin-500.css';
import '@fontsource/archivo/latin-600.css';
import '@fontsource/archivo/latin-700.css';
import '@fontsource/archivo/latin-ext-500.css';
import '@fontsource/archivo/latin-ext-600.css';
import '@fontsource/archivo/latin-ext-700.css';
import '@fontsource/source-sans-3/latin-400.css';
import '@fontsource/source-sans-3/latin-500.css';
import '@fontsource/source-sans-3/latin-600.css';
import '@fontsource/source-sans-3/latin-ext-400.css';
import '@fontsource/source-sans-3/latin-ext-500.css';
import '@fontsource/source-sans-3/latin-ext-600.css';

import { env } from '@/config/env';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

import './globals.css';

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
    <html lang="pl">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

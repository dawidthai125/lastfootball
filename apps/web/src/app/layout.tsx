import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Last Football Engine',
  description: 'Foundation scaffold for Last Football Engine (LFE)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}

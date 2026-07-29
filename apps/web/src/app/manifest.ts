import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LastFootball',
    short_name: 'LastFootball',
    description: 'Załóż klub. Prowadź go przez ligę. Każdy mecz jest Twój.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B1118',
    theme_color: '#0B1118',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

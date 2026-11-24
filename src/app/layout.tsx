import type { Metadata, Viewport } from 'next';
import '../index.css';
import '../styles/car-mode.css';
import '../styles/mobile-player.css';
import { QueryProvider } from '../components/QueryProvider';
import { MusicProvider } from '../context/MusicContext';
import { AppShell } from '../components/AppShell';

export const viewport: Viewport = {
  themeColor: '#0a0a0c',
  width: 'device-width',
  initialScale: 1
};

export const metadata: Metadata = {
  metadataBase: new URL('https://sangeetham-ai.onrender.com'),
  title: 'Sangeetham - AI Music Player',
  description: 'Sangeetham - AI Music Player with real-time synced lyrics, equalizer, and beat visualizer',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sangeetham'
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: '/icon-512.png'
  },
  openGraph: {
    type: 'website',
    siteName: 'Sangeetham AI Music Player',
    title: 'Sangeetham - AI Music Player',
    description: 'Listen to your favorite songs in 320kbps HD with real-time synced lyrics, equalizer, and beat visualizer.',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Sangeetham AI Music Player',
        type: 'image/png'
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'Sangeetham - AI Music Player',
    description: 'Listen to your favorite songs in 320kbps HD with real-time synced lyrics, equalizer, and beat visualizer.',
    images: ['/icon-512.png']
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <QueryProvider>
          <MusicProvider>
            <AppShell>{children}</AppShell>
          </MusicProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import '../index.css';
import '../styles/car-mode.css';
import '../styles/mobile-player.css';
import { MusicProvider } from '../context/MusicContext';
import { AppShell } from '../components/AppShell';

export const viewport: Viewport = {
  themeColor: '#0a0a0c',
  width: 'device-width',
  initialScale: 1
};

export const metadata: Metadata = {
  title: 'Sangeetham - AI Music Player',
  description: 'Sangeetham - AI Music Player with real-time synced lyrics, equalizer, and beat visualizer',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sangeetham'
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png'
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
        <MusicProvider>
          <AppShell>{children}</AppShell>
        </MusicProvider>
      </body>
    </html>
  );
}

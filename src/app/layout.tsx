import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../index.css';
import { MusicProvider } from '../context/MusicContext';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';
import { PlayerBar } from '../components/PlayerBar';
import { AIChatModal } from '../components/AIChatModal';
import { ShareModal } from '../components/ShareModal';
import { Toast } from '../components/Toast';
import { FullscreenVisualizer } from '../components/FullscreenVisualizer';
import { PWAProvider } from '../components/PWAProvider';
import { Footer } from '../components/Footer';

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
          <div className="app-root">
            {/* Top Navigation */}
            <Navbar />

            {/* Dynamic Routed Page Content */}
            <main className="main-viewport">
              {children}
              <Footer />
            </main>

            {/* Floating Global AI Music Assistant */}
            <AIChatModal />

            {/* Universal Share Modal & Toast Feedback */}
            <ShareModal />
            <Toast />
            <PWAProvider />

            {/* Immersive Audio-Reactive Particle Fullscreen Visualizer */}
            <FullscreenVisualizer />

            {/* Bottom Navigation with Link routing */}
            <BottomNav />

            {/* Persistent Audio Player Bar */}
            <PlayerBar />
          </div>
        </MusicProvider>
      </body>
    </html>
  );
}

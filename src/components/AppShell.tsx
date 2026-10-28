'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { PlayerBar } from './PlayerBar';
import { AIChatModal } from './AIChatModal';
import { ShareModal } from './ShareModal';
import { Toast } from './Toast';
import { FullscreenVisualizer } from './FullscreenVisualizer';
import { PWAProvider } from './PWAProvider';
import { Footer } from './Footer';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const isCarMode = pathname === '/car' || pathname === '/car-mode' || pathname?.startsWith('/car/') || pathname?.startsWith('/car-mode/');

  if (isCarMode) {
    return (
      <div className="car-mode-app-shell">
        {children}
        <Toast />
        <PWAProvider />
      </div>
    );
  }

  return (
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
  );
};

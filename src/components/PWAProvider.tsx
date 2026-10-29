'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    __deferredPwaPrompt?: any;
  }
}

export const PWAProvider: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }

    // 2. Global handler for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.__deferredPwaPrompt = e;
      window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
    };

    const handleAppInstalled = () => {
      window.__deferredPwaPrompt = null;
      window.dispatchEvent(new CustomEvent('pwa-app-installed'));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return null;
};

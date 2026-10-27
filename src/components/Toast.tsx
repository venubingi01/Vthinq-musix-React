'use client';

import React from 'react';
import { useMusic } from '../context/MusicContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useMusic();

  if (!toastMessage) return null;

  return (
    <div className="global-toast-container" role="status" aria-live="polite">
      <div className="global-toast-pill">
        <CheckCircle2 size={18} className="text-pink toast-icon" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};

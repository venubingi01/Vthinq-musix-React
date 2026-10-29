'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useMusic } from '../context/MusicContext';
import { Sparkles } from 'lucide-react';

export const AIFloatingButton: React.FC = () => {
  const { isAiChatOpen, setIsAiChatOpen } = useMusic();
  const pathname = usePathname();
  const isCar = pathname?.startsWith('/car');

  // Hide when chat modal is already open
  if (isAiChatOpen) {
    return null;
  }

  return (
    <button
      type="button"
      className={`ai-floating-trigger ${isCar ? 'car-ai-floating-trigger' : ''}`}
      onClick={() => setIsAiChatOpen(true)}
      title="Ask AI Music Assistant"
      aria-label="Ask AI Music Assistant"
    >
      <Sparkles size={16} className="ai-floating-sparkle-icon" />
      <span className="ai-floating-text">Ask AI</span>
    </button>
  );
};

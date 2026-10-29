'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMusic } from '../../context/MusicContext';
import {
  Music2,
  LogOut,
  Sparkles
} from 'lucide-react';

interface CarHeaderProps {
  onExit?: () => void;
}

export const CarHeader: React.FC<CarHeaderProps> = ({ onExit }) => {
  const { setIsAiChatOpen } = useMusic();
  const [timeStr, setTimeStr] = useState<string>('10:24 AM');

  // Real digital clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="car-header">
      {/* Brand & Car Mode Label */}
      <div className="car-header-left">
        <Link href="/" className="car-brand-link" style={{ textDecoration: 'none' }}>
          <div className="car-brand-pill">
            <div className="car-logo-icon-wrap">
              <Music2 size={22} className="car-logo-icon" />
            </div>
            <div className="car-brand-text-col">
              <span className="car-brand-name">Sangeetham</span>
              <span className="car-brand-subbadge">CAR MODE</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Right Infotainment Status Bar */}
      <div className="car-header-right">

        {/* Time display */}
        <span className="car-clock-display" aria-label={`Current time: ${timeStr}`}>
          {timeStr}
        </span>

        {/* Exit Car Mode Link */}
        <Link
          href="/player"
          className="car-exit-btn"
          onClick={onExit}
          title="Exit Car Mode and return to normal player"
          aria-label="Exit Car Mode"
        >
          <LogOut size={16} />
          <span>Exit</span>
        </Link>
      </div>
    </header>
  );
};

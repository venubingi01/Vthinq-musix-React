'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Music2,
  Wifi,
  WifiOff,
  LogOut,
  Bluetooth,
  Signal,
  BatteryCharging,
  Car
} from 'lucide-react';

interface CarHeaderProps {
  onExit?: () => void;
}

export const CarHeader: React.FC<CarHeaderProps> = ({ onExit }) => {
  const [timeStr, setTimeStr] = useState<string>('10:24 AM');
  const [isOnline, setIsOnline] = useState<boolean>(true);

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

  // Real system online / offline connectivity
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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

      {/* Right Infotainment Status Bar (Matching reference board) */}
      <div className="car-header-right">
        {/* Time display */}
        <span className="car-clock-display" aria-label={`Current time: ${timeStr}`}>
          {timeStr}
        </span>

        {/* Connectivity status group */}
        <div className="car-system-icons-group">
          {/* Bluetooth Icon */}
          <div className="car-sys-icon active" title="Bluetooth Audio Connected">
            <Bluetooth size={18} />
          </div>

          {/* Cellular / Wi-Fi Signal */}
          <div className={`car-sys-icon ${isOnline ? 'active' : 'offline'}`} title={isOnline ? 'Cellular 4G/5G Online' : 'Offline'}>
            {isOnline ? <Signal size={18} /> : <WifiOff size={18} />}
          </div>

          {/* Battery Status */}
          <div className="car-sys-icon active" title="Vehicle Power Good">
            <BatteryCharging size={18} />
          </div>

          {/* Vehicle Indicator */}
          <div className="car-sys-icon car-vehicle-icon active" title="Vehicle Cockpit System">
            <Car size={19} />
          </div>
        </div>

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

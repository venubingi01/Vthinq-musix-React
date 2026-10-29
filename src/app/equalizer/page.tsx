'use client';

import React, { useState, useEffect } from 'react';
import { EqualizerView } from '../../components/EqualizerView';
import { MobilePlayerView } from '../../components/mobile/MobilePlayerView';

export default function EqualizerPage() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      const isNarrow = window.innerWidth <= 768;
      const isLandscapeMobile = window.innerHeight <= 520 && window.innerWidth <= 1024;
      setIsMobile(isNarrow || isLandscapeMobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  if (isMobile) {
    return <MobilePlayerView initialTab="equalizer" />;
  }

  return <EqualizerView />;
}

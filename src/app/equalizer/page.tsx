'use client';

import React, { useState, useEffect } from 'react';
import { EqualizerView } from '../../components/EqualizerView';
import { MobilePlayerView } from '../../components/mobile/MobilePlayerView';

export default function EqualizerPage() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return <MobilePlayerView initialTab="equalizer" />;
  }

  return <EqualizerView />;
}

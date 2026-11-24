'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlayerView } from '../../components/PlayerView';

export default function LyricsPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('songId') || params.get('song')) {
        router.replace(`/player?${params.toString()}`);
      }
    }
  }, [router]);

  return <PlayerView initialMobileTab="lyrics" />;
}

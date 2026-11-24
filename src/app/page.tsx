'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HomeView } from '../components/HomeView';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('songId') || params.get('song')) {
        router.replace(`/player?${params.toString()}`);
      }
    }
  }, [router]);

  return <HomeView />;
}

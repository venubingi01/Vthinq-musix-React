'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlbumView } from '../../components/AlbumView';

function AlbumContent() {
  const searchParams = useSearchParams();
  const queryId =
    searchParams.get('id') ||
    searchParams.get('albumId') ||
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null) ||
    '17435036';
  return <AlbumView albumId={queryId} />;
}

export default function AlbumDefaultPage() {
  return (
    <Suspense fallback={<div className="album-loading-state">Loading Album...</div>}>
      <AlbumContent />
    </Suspense>
  );
}

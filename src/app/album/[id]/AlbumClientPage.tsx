'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlbumView } from '../../../components/AlbumView';

function AlbumClientInner({ initialAlbumId }: { initialAlbumId: string }) {
  const searchParams = useSearchParams();
  const queryId =
    searchParams.get('id') ||
    searchParams.get('albumId') ||
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null);
  return <AlbumView albumId={queryId || initialAlbumId} />;
}

export function AlbumClientPage({ initialAlbumId }: { initialAlbumId: string }) {
  return (
    <Suspense fallback={<div className="album-loading-state">Loading Album...</div>}>
      <AlbumClientInner initialAlbumId={initialAlbumId} />
    </Suspense>
  );
}

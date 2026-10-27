'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlbumView } from '../../components/AlbumView';

function AlbumContent() {
  const searchParams = useSearchParams();
  const albumId = searchParams.get('id') || 'alb_ala_vaikunthapurramuloo';
  return <AlbumView albumId={albumId} />;
}

export default function AlbumDefaultPage() {
  return (
    <Suspense fallback={<div className="album-loading-state">Loading Album...</div>}>
      <AlbumContent />
    </Suspense>
  );
}

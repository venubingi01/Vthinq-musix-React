'use client';

import React from 'react';
import { AlbumView } from '../../../components/AlbumView';

export function AlbumClientPage({ initialAlbumId }: { initialAlbumId: string }) {
  return <AlbumView albumId={initialAlbumId} />;
}

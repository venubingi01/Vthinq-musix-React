'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { AlbumView } from '../../../components/AlbumView';

export default function DynamicAlbumPage() {
  const params = useParams();
  const albumId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || 'alb_ala_vaikunthapurramuloo';

  return <AlbumView albumId={albumId} />;
}

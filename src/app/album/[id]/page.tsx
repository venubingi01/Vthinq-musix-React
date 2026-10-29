import React from 'react';
import { AlbumClientPage } from './AlbumClientPage';

export function generateStaticParams() {
  return [
    { id: 'alb_ala_vaikunthapurramuloo' },
    { id: 'alb_brahmastra' },
    { id: 'alb_jawan' },
    { id: 'alb_devotional_classics' },
    { id: 'default' }
  ];
}

export default async function DynamicAlbumPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <AlbumClientPage initialAlbumId={resolvedParams?.id || 'alb_ala_vaikunthapurramuloo'} />;
}

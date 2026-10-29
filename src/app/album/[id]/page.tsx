import React from 'react';
import { AlbumClientPage } from './AlbumClientPage';

export function generateStaticParams() {
  return [
    { id: '17435036' },
    { id: '38845390' },
    { id: '48037104' },
    { id: '9189182' },
    { id: 'alb_ala_vaikunthapurramuloo' },
    { id: 'alb_brahmastra' },
    { id: 'alb_jawan' },
    { id: 'alb_devotional_classics' },
    { id: 'alb_merupu_kalalu' },
    { id: 'alb_sita_ramam' },
    { id: 'alb_geetha_govindam' },
    { id: 'alb_telugu_hits' },
    { id: 'default' }
  ];
}

export default async function DynamicAlbumPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <AlbumClientPage initialAlbumId={resolvedParams?.id || '17435036'} />;
}

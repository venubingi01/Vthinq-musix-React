'use client';

import React from 'react';
import { Song } from '../types/music';
import { useMusic } from '../context/MusicContext';

export interface QualityBadgeProps {
  song?: Song | null;
  quality?: string;
  url?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showToastOnClick?: boolean;
}

export type QualityBadgeType = 'HD' | 'HQ' | 'SD';

export function getQualityBadgeType(
  song?: Song | null,
  qualityStr?: string,
  urlStr?: string
): QualityBadgeType {
  const q = String(qualityStr || song?.quality || '').toLowerCase();
  const u = String(urlStr || song?.url || '').toLowerCase();

  // 1. Check explicit quality string first
  if (q.includes('160')) {
    return 'HQ';
  }
  if (q.includes('96') || q.includes('48') || q.includes('12')) {
    return 'SD';
  }
  if (q.includes('320') || q.includes('360')) {
    return 'HD';
  }

  // 2. Check URL patterns if explicit quality is not set
  if (u.includes('_160') || u.includes('160k')) {
    return 'HQ';
  }
  if (u.includes('_96') || u.includes('_48') || u.includes('_12') || u.includes('96k')) {
    return 'SD';
  }
  if (u.includes('_320') || u.includes('320k') || u.includes('360k')) {
    return 'HD';
  }

  return 'SD';
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({
  song,
  quality,
  url,
  size = 'md',
  className = '',
  showToastOnClick = true
}) => {
  const { showToast } = useMusic();
  const badgeType = getQualityBadgeType(song, quality, url);

  const handleClick = (e: React.MouseEvent) => {
    if (!showToastOnClick) return;
    e.stopPropagation();

    if (badgeType === 'HD') {
      showToast('Streaming in 320kbps Ultra HD Studio Quality 🔥');
    } else if (badgeType === 'HQ') {
      showToast('Streaming in 160kbps High Quality Audio 🎧');
    } else {
      showToast('Streaming in Standard Data Saver Quality (SD) 📱');
    }
  };

  const getBadgeClass = () => {
    switch (badgeType) {
      case 'HD':
        return 'quality-badge-hd';
      case 'HQ':
        return 'quality-badge-hq';
      case 'SD':
      default:
        return 'quality-badge-sd';
    }
  };

  return (
    <span
      className={`quality-badge quality-badge-${size} ${getBadgeClass()} ${className}`}
      onClick={handleClick}
      title={
        badgeType === 'HD'
          ? '320kbps Ultra HD Studio Master Quality'
          : badgeType === 'HQ'
          ? '160kbps High Quality Stereo'
          : 'Standard Definition Audio'
      }
      role={showToastOnClick ? 'button' : undefined}
      tabIndex={showToastOnClick ? 0 : undefined}
    >
      <span className="quality-badge-text">{badgeType}</span>
    </span>
  );
};

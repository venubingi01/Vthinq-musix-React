'use client';

import React, { useEffect, useRef } from 'react';
import { useMusic } from '../context/MusicContext';
import { X, PlayCircle } from 'lucide-react';
import type { Song } from '../types/music';

interface FullscreenVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  videoId: string | null;
}

export const FullscreenVideoModal: React.FC<FullscreenVideoModalProps> = ({
  isOpen,
  onClose,
  song,
  videoId
}) => {
  const { isPlaying, togglePlay } = useMusic();
  const wasPlayingRef = useRef<boolean>(false);

  // Pause main background music when watching fullscreen video with sound
  useEffect(() => {
    if (isOpen) {
      if (isPlaying) {
        wasPlayingRef.current = true;
        togglePlay();
      } else {
        wasPlayingRef.current = false;
      }
    } else {
      if (wasPlayingRef.current && !isPlaying) {
        togglePlay();
      }
    }
  }, [isOpen]);

  if (!isOpen || !song || !videoId) return null;

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&rel=0&playsinline=1`;

  return (
    <div className="fs-video-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="fs-video-modal" onClick={(e) => e.stopPropagation()}>
        {/* Top bar */}
        <div className="fs-video-topbar">
          <div className="fs-video-title-wrap">
            <span className="fs-video-badge">
              <PlayCircle size={15} /> MUSIC VIDEO
            </span>
            <h3 className="fs-video-title">
              {song.name} — <span className="fs-video-artist">{song.artist}</span>
            </h3>
          </div>
          <button className="fs-video-close-btn" onClick={onClose} title="Exit Fullscreen (Esc)">
            <X size={20} />
          </button>
        </div>

        {/* Video Player Frame */}
        <div className="fs-video-frame-container">
          <iframe
            src={embedUrl}
            title={`${song.name} Music Video`}
            className="fs-video-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

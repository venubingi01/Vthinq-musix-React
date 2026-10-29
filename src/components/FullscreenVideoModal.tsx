'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMusic } from '../context/MusicContext';
import { X, PlayCircle, RotateCw, Maximize2, Minimize2 } from 'lucide-react';
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
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [isRotated, setIsRotated] = useState<boolean>(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      setIsRotated(false);
      try {
        if (typeof screen !== 'undefined' && screen.orientation && 'unlock' in screen.orientation) {
          (screen.orientation as any).unlock().catch(() => {});
        }
      } catch {}
    }
  }, [isOpen]);

  // Handle Controls auto-hide timer
  const handleUserActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4000);
  }, []);

  useEffect(() => {
    if (isOpen) {
      handleUserActivity();
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isOpen, handleUserActivity]);

  // Handle ESC key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isRotated) {
          setIsRotated(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRotated, onClose]);

  // Track native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsNativeFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle Mobile Rotate Mode (rotates video 90deg to widescreen landscape)
  const handleToggleRotate = async () => {
    const nextRotated = !isRotated;
    setIsRotated(nextRotated);
    handleUserActivity();

    try {
      if (typeof screen !== 'undefined' && screen.orientation && 'lock' in screen.orientation) {
        if (nextRotated) {
          await (screen.orientation as any).lock('landscape').catch(() => {});
        } else {
          await (screen.orientation as any).unlock().catch(() => {});
        }
      }
    } catch {
      // CSS rotation handles orientation reliably
    }
  };

  // Toggle Native OS Fullscreen
  const handleToggleNativeFullscreen = () => {
    handleUserActivity();
    if (!document.fullscreenElement) {
      if (modalRef.current && modalRef.current.requestFullscreen) {
        modalRef.current.requestFullscreen().catch(() => {});
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  if (!isOpen || !song || !videoId) return null;

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&rel=0&playsinline=1&modestbranding=1`;

  return (
    <div
      className="fs-video-backdrop"
      onClick={onClose}
      onMouseMove={handleUserActivity}
      onTouchStart={handleUserActivity}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={`fs-video-modal ${isRotated ? 'is-rotated-landscape' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header HUD overlay */}
        <div className={`fs-video-topbar ${showControls ? 'visible' : 'hidden'}`}>
          <div className="fs-video-title-wrap">
            <span className="fs-video-badge">
              <PlayCircle size={15} /> MUSIC VIDEO
            </span>
            <h3 className="fs-video-title" title={`${song.name} — ${song.artist}`}>
              {song.name} — <span className="fs-video-artist">{song.artist}</span>
            </h3>
          </div>

          <div className="fs-video-actions">
            {/* Mobile Rotate Mode Button */}
            <button
              className={`fs-video-hud-btn rotate-toggle-btn ${isRotated ? 'active' : ''}`}
              onClick={handleToggleRotate}
              title={isRotated ? 'Switch to Portrait' : 'Rotate to Fullscreen Landscape'}
              aria-label="Rotate Video"
            >
              <RotateCw size={17} className={isRotated ? 'rotated-icon' : ''} />
              <span className="btn-label">{isRotated ? 'Portrait' : 'Rotate Mode'}</span>
            </button>

            {/* Native OS Fullscreen Button */}
            <button
              className="fs-video-hud-btn icon-only"
              onClick={handleToggleNativeFullscreen}
              title={isNativeFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              aria-label="Fullscreen"
            >
              {isNativeFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            {/* Close Button */}
            <button
              className="fs-video-close-btn"
              onClick={onClose}
              title="Close Video (Esc)"
              aria-label="Close Video"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Floating Quick Rotate FAB on Mobile */}
        <button
          className={`fs-video-floating-rotate-btn ${showControls ? 'visible' : 'dimmed'}`}
          onClick={handleToggleRotate}
          title={isRotated ? 'Switch to Portrait' : 'Rotate to Fullscreen Landscape'}
          aria-label="Toggle Rotate Mode"
        >
          <RotateCw size={18} />
          <span>{isRotated ? 'Portrait' : 'Rotate'}</span>
        </button>

        {/* Video Player Frame taking 100% full view */}
        <div className="fs-video-frame-container">
          <iframe
            src={embedUrl}
            title={`${song.name} Music Video`}
            className="fs-video-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { useMusic } from '../../context/MusicContext';
import {
  X,
  Minimize2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Loader2,
  Music2
} from 'lucide-react';
import { decodeHTMLEntities } from '../../services/sangeethamApi';
import { CarVisualizer, CarVisualizerStyle } from './CarVisualizer';

interface CarFullscreenVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
  style: CarVisualizerStyle;
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const CarFullscreenVisualizer: React.FC<CarFullscreenVisualizerProps> = ({
  isOpen,
  onClose,
  style
}) => {
  const {
    currentSong,
    currentTime,
    duration,
    seek,
    isPlaying,
    isLoading,
    togglePlay,
    nextSong,
    prevSong
  } = useMusic();

  if (!isOpen) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const songTitle = currentSong ? decodeHTMLEntities(currentSong.name) : 'No track';
  const artistName = currentSong ? decodeHTMLEntities(currentSong.artist) : '';

  return (
    <div className="car-fs-screen7-overlay" role="dialog" aria-modal="true" aria-label="Fullscreen Visualizer">
      {/* Top right close button */}
      <button className="car-fs-close-top-btn" onClick={onClose} aria-label="Exit fullscreen visualizer">
        <X size={24} />
      </button>

      {/* Fullscreen Visualizer Canvas */}
      <CarVisualizer
        currentStyle={style}
        isVisible={true}
        isFullscreen={true}
        className="car-fs-canvas-container"
      />

      {/* Floating Bottom HUD Player Bar matching Screen 7 */}
      <div className="car-fs-bottom-bar">
        {/* Left: Thumbnail & Info */}
        <div className="car-fs-track-info">
          {currentSong?.image ? (
            <img src={currentSong.image} alt={songTitle} className="car-fs-mini-cover" />
          ) : (
            <div className="car-fs-mini-placeholder">
              <Music2 size={20} className="text-electric-blue" />
            </div>
          )}
          <div className="car-fs-meta">
            <span className="car-fs-title">{songTitle}</span>
            <span className="car-fs-artist">{artistName}</span>
          </div>
        </div>

        {/* Center: Seek Bar & Controls */}
        <div className="car-fs-center-controls">
          <div className="car-fs-scrubber-wrap">
            <span className="car-fs-time">{formatDuration(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="car-fs-slider"
              aria-label="Seek position"
              style={{
                background: `linear-gradient(to right, #00f5ff ${progressPercent}%, rgba(255, 255, 255, 0.16) ${progressPercent}%)`
              }}
            />
            <span className="car-fs-time">{formatDuration(duration)}</span>
          </div>

          <div className="car-fs-buttons-row">
            <button className="car-fs-btn" onClick={prevSong} aria-label="Previous">
              <SkipBack size={26} />
            </button>

            <button className="car-fs-play-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isLoading ? (
                <Loader2 size={28} className="spin" />
              ) : isPlaying ? (
                <Pause size={28} />
              ) : (
                <Play size={28} className="offset" />
              )}
            </button>

            <button className="car-fs-btn" onClick={nextSong} aria-label="Next">
              <SkipForward size={26} />
            </button>
          </div>
        </div>

        {/* Right: Minimize icon */}
        <div className="car-fs-right-actions">
          <button className="car-fs-min-btn" onClick={onClose} title="Minimize Visualizer" aria-label="Minimize">
            <Minimize2 size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

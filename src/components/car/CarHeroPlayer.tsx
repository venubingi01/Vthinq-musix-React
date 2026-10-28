'use client';

import React, { useState } from 'react';
import { useMusic } from '../../context/MusicContext';
import {
  Heart,
  Music2,
  Disc,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Loader2,
  BarChart3,
  Quote,
  Maximize2
} from 'lucide-react';
import { decodeHTMLEntities } from '../../services/sangeethamApi';
import { CarVisualizer, CarVisualizerStyle } from './CarVisualizer';
import { CarLyricsView } from './CarLyricsView';
import { CarVoiceButton } from './CarVoiceButton';
import type { VoiceStatus } from '../../services/voiceCommandService';

interface CarHeroPlayerProps {
  visualizerStyle: CarVisualizerStyle;
  isVisualizerOn: boolean;
  voiceStatus: VoiceStatus;
  onVoiceTap: () => void;
  onOpenVisualizerStyles: () => void;
  onOpenFullscreenVisualizer: () => void;
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const CarHeroPlayer: React.FC<CarHeroPlayerProps> = ({
  visualizerStyle,
  isVisualizerOn,
  voiceStatus,
  onVoiceTap,
  onOpenVisualizerStyles,
  onOpenFullscreenVisualizer
}) => {
  const {
    currentSong,
    currentTime,
    duration,
    seek,
    toggleFavorite,
    isFavorite,
    isPlaying,
    isLoading,
    togglePlay,
    nextSong,
    prevSong
  } = useMusic();

  // Mode toggle between live Visualizer and Synced Lyrics right on hero view
  const [heroDisplayMode, setHeroDisplayMode] = useState<'visualizer' | 'lyrics'>('visualizer');
  const [isDebouncing, setIsDebouncing] = useState(false);

  const handleAction = (action: () => void) => {
    if (isDebouncing) return;
    setIsDebouncing(true);
    action();
    setTimeout(() => setIsDebouncing(false), 200);
  };

  if (!currentSong) {
    return (
      <div className="car-hero-screen1-card empty">
        <Music2 size={64} className="text-muted" />
        <p className="car-empty-title">No track currently playing</p>
      </div>
    );
  }

  const isFav = isFavorite(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const songTitle = decodeHTMLEntities(currentSong.name);
  const artistName = decodeHTMLEntities(currentSong.artist);
  const albumName = decodeHTMLEntities(currentSong.album || '');

  return (
    <div className="car-hero-screen1-card">
      {/* Upper Main Stage (Screen 1): Left Album Artwork & Info + Right Multi-Color Visualizer or Synced Lyrics */}
      <div className="car-hero-stage-row">
        {/* Left Column: Artwork + Metadata + Heart */}
        <div className="car-hero-track-col">
          <div className="car-hero-art-wrapper">
            {currentSong.image ? (
              <img
                src={currentSong.image}
                alt={songTitle}
                className={`car-hero-art-img ${isPlaying ? 'playing' : ''}`}
                loading="eager"
              />
            ) : (
              <div className="car-hero-art-placeholder">
                <Disc size={64} className="text-electric-blue" />
              </div>
            )}
          </div>

          <div className="car-hero-meta-group">
            <div className="car-hero-title-fav-row">
              <h1 className="car-hero-song-title" title={songTitle}>
                {songTitle}
              </h1>
              <button
                className={`car-hero-fav-btn ${isFav ? 'active' : ''}`}
                onClick={() => toggleFavorite(currentSong)}
                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart size={26} className={isFav ? 'fill-red' : ''} />
              </button>
            </div>

            <p className="car-hero-artist-name">{artistName}</p>
            {albumName && <p className="car-hero-album-name">{albumName}</p>}
          </div>
        </div>

        {/* Right Column: Multi-Color Neon Visualizer OR Synced Lyrics */}
        <div className="car-hero-display-col">
          {/* Header Switcher: [ 📊 Visualizer | 📝 Lyrics ] */}
          <div className="car-hero-switch-bar">
            <div className="car-hero-switch-group">
              <button
                className={`car-hero-switch-tab ${heroDisplayMode === 'visualizer' ? 'active' : ''}`}
                onClick={() => setHeroDisplayMode('visualizer')}
              >
                <BarChart3 size={16} />
                <span>Visualizer</span>
              </button>
              <button
                className={`car-hero-switch-tab ${heroDisplayMode === 'lyrics' ? 'active' : ''}`}
                onClick={() => setHeroDisplayMode('lyrics')}
              >
                <Quote size={16} />
                <span>Lyrics</span>
              </button>
            </div>

            {heroDisplayMode === 'visualizer' && (
              <button
                className="car-hero-fs-icon-btn"
                onClick={onOpenFullscreenVisualizer}
                title="Fullscreen Visualizer"
                aria-label="Fullscreen Visualizer"
              >
                <Maximize2 size={16} />
              </button>
            )}
          </div>

          {/* Body: Live Audio Visualizer or Karaoke Lyrics */}
          <div className="car-hero-display-body">
            {heroDisplayMode === 'visualizer' ? (
              <CarVisualizer
                currentStyle={visualizerStyle}
                isVisible={isVisualizerOn}
                className="car-screen1-visualizer"
              />
            ) : (
              <CarLyricsView className="car-screen1-lyrics" />
            )}
          </div>
        </div>
      </div>

      {/* Progress Scrubber (Screen 1: 1:12 -------●------- 4:28) */}
      <div className="car-hero-scrubber-row">
        <span className="car-hero-time current">{formatDuration(currentTime)}</span>

        <div className="car-hero-seek-track">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="car-hero-slider"
            aria-label="Seek track position"
            style={{
              background: `linear-gradient(to right, #00d2ff ${progressPercent}%, rgba(255, 255, 255, 0.16) ${progressPercent}%)`
            }}
          />
        </div>

        <span className="car-hero-time duration">{formatDuration(duration)}</span>
      </div>

      {/* Bottom Controls Bar (Screen 1: Visualizer Button | Prev HeroPlay Next | Tap to Speak) */}
      <div className="car-hero-controls-bar">
        {/* Left: Visualizer Styles / Settings button matching Screen 1 */}
        <div className="car-hero-ctrls-left">
          <button
            className="car-hero-pill-btn"
            onClick={onOpenVisualizerStyles}
            title="Visualizer Styles"
            aria-label="Visualizer Styles"
          >
            <BarChart3 size={20} className="text-electric-blue" />
            <span>Visualizer</span>
          </button>
        </div>

        {/* Center: Hero Previous, Play/Pause, Next */}
        <div className="car-hero-ctrls-center">
          <button
            className="car-hero-round-btn prev"
            onClick={() => handleAction(prevSong)}
            title="Previous Track"
            aria-label="Previous Track"
          >
            <SkipBack size={32} />
          </button>

          <button
            className={`car-hero-play-main ${isPlaying ? 'playing' : 'paused'}`}
            onClick={() => handleAction(togglePlay)}
            disabled={isLoading}
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 size={38} className="car-play-spinner" />
            ) : isPlaying ? (
              <Pause size={38} className="car-play-icon" />
            ) : (
              <Play size={38} className="car-play-icon offset" />
            )}
          </button>

          <button
            className="car-hero-round-btn next"
            onClick={() => handleAction(nextSong)}
            title="Next Track"
            aria-label="Next Track"
          >
            <SkipForward size={32} />
          </button>
        </div>

        {/* Right: Circular Glowing "Tap to Speak" Voice Button */}
        <div className="car-hero-ctrls-right">
          <CarVoiceButton status={voiceStatus} onClick={onVoiceTap} />
        </div>
      </div>
    </div>
  );
};

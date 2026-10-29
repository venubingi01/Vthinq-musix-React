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
  Shuffle,
  Repeat,
  Loader2,
  Sliders,
  ListMusic,
  Quote,
  Maximize2,
  Mic,
  Sparkles,
  Video
} from 'lucide-react';
import { decodeHTMLEntities } from '../../services/sangeethamApi';
import type { CarVisualizerStyle } from './CarVisualizer';
import type { VoiceStatus } from '../../services/voiceCommandService';

interface CarHeroPlayerProps {
  visualizerStyle?: CarVisualizerStyle;
  isVisualizerOn?: boolean;
  voiceStatus: VoiceStatus;
  onVoiceTap: () => void;
  onOpenVisualizerStyles?: () => void;
  onOpenFullscreenVisualizer?: () => void;
  onOpenLyrics?: () => void;
  onOpenVideo?: () => void;
  onOpenEqualizer?: () => void;
  onOpenQueue?: () => void;
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const CarHeroPlayer: React.FC<CarHeroPlayerProps> = ({
  visualizerStyle = 'bars',
  isVisualizerOn = true,
  voiceStatus,
  onVoiceTap,
  onOpenVisualizerStyles,
  onOpenFullscreenVisualizer,
  onOpenLyrics,
  onOpenVideo,
  onOpenEqualizer,
  onOpenQueue
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
    setIsAiChatOpen,
    togglePlay,
    nextSong,
    prevSong,
    isShuffle,
    toggleShuffle,
    isLoop,
    toggleLoop
  } = useMusic();

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
  const albumName = decodeHTMLEntities(currentSong.album || 'Telugu Hits');

  return (
    <div className="car-main-player-dashboard-card">
      {/* Upper Main Player Row (Screen 6: Left Artwork, Middle Info + Badge, Right Action Stack) */}
      <div className="car-main-player-top-row">
        {/* Left: Album Artwork with subtle glow & aalap badge */}
        <div className="car-main-player-art-wrap">
          {currentSong.image ? (
            <img
              key={currentSong.id}
              src={currentSong.image}
              alt={songTitle}
              className={`car-main-player-art-img ${isPlaying ? 'playing' : ''}`}
              loading="eager"
            />
          ) : (
            <div className="car-main-player-art-placeholder">
              <Disc size={64} />
            </div>
          )}
        </div>

        {/* Middle: Title, Artist, Playing from Badge */}
        <div className="car-main-player-meta-wrap">
          <h1 className="car-main-player-title" title={songTitle}>
            {songTitle}
          </h1>
          <p className="car-main-player-artist">{artistName}</p>
          <div className="car-main-player-playing-badge">
            <span className="car-badge-sub">Playing from</span>
            <span className="car-badge-album">
              <Repeat size={13} className="car-badge-repeat-icon" />
              {albumName}
            </span>
          </div>
        </div>

        {/* Right: Stacked Action Buttons matching Screen 6 [ 🎵 Lyrics | 🎚️ Equalizer | 📋 Queue ] */}
        <div className="car-main-player-actions-stack">
          <button
            className="car-action-stack-btn"
            onClick={onOpenLyrics}
            title="Open Synced Lyrics"
            aria-label="Open Synced Lyrics"
          >
            <Quote size={20} className="car-action-btn-icon" />
            <span>Lyrics</span>
          </button>

          <button
            className="car-action-stack-btn car-action-stack-video-btn"
            onClick={onOpenVideo}
            title="Watch Music Video"
            aria-label="Watch Music Video"
          >
            <Video size={20} className="car-action-btn-icon text-cyan" />
            <span>Video</span>
          </button>

          <button
            className="car-action-stack-btn"
            onClick={onOpenEqualizer}
            title="Open Sound Equalizer"
            aria-label="Open Sound Equalizer"
          >
            <Sliders size={20} className="car-action-btn-icon" />
            <span>Equalizer</span>
          </button>

          <button
            className="car-action-stack-btn"
            onClick={onOpenQueue}
            title="Open Playing Next Queue"
            aria-label="Open Playing Next Queue"
          >
            <ListMusic size={20} className="car-action-btn-icon" />
            <span>Queue</span>
          </button>

          <button
            className={`car-action-stack-btn car-action-stack-voice-btn ${voiceStatus === 'listening' ? 'listening' : ''}`}
            onClick={onVoiceTap}
            title={voiceStatus === 'listening' ? 'Listening... Tap to stop' : 'Voice Search & Commands'}
            aria-label="Voice Search"
          >
            <Mic size={20} className="car-action-btn-icon" />
            <span>{voiceStatus === 'listening' ? 'Listening...' : 'Voice Search'}</span>
          </button>

          <button
            className="car-action-stack-btn car-action-stack-ai-btn"
            onClick={() => setIsAiChatOpen(true)}
            title="Ask Sangeetham AI Music Companion"
            aria-label="Ask AI Companion"
          >
            <Sparkles size={20} className="car-action-btn-icon text-pink" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* Scrubber Seek Bar (Screen 6: 1:24 ────────●──────── 5:32) */}
      <div className="car-main-player-scrubber-row">
        <span className="car-scrubber-time current">{formatDuration(currentTime)}</span>
        <div className="car-scrubber-track-box">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="car-scrubber-slider"
            aria-label="Seek track position"
            style={{
              background: `linear-gradient(to right, #ff2d75 ${progressPercent}%, rgba(255, 255, 255, 0.16) ${progressPercent}%)`
            }}
          />
        </div>
        <span className="car-scrubber-time duration">{formatDuration(duration)}</span>
      </div>

      {/* Large Automotive Controls Row (Screen 6: Shuffle, Prev, Huge Circular Play/Pause, Next, Repeat) */}
      <div className="car-main-player-controls-row">
        <button
          className={`car-round-ctrl-btn shuffle ${isShuffle ? 'active' : ''}`}
          onClick={toggleShuffle}
          title="Shuffle Queue"
          aria-label="Shuffle Queue"
        >
          <Shuffle size={24} />
        </button>

        <button
          className="car-round-ctrl-btn prev"
          onClick={() => handleAction(prevSong)}
          title="Previous Track"
          aria-label="Previous Track"
        >
          <SkipBack size={32} />
        </button>

        <button
          className="car-hero-giant-play-btn"
          onClick={() => handleAction(togglePlay)}
          disabled={isLoading}
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <Loader2 size={36} className="spin-loader" />
          ) : isPlaying ? (
            <Pause size={38} fill="currentColor" />
          ) : (
            <Play size={38} fill="currentColor" className="play-triangle-offset" />
          )}
        </button>

        <button
          className="car-round-ctrl-btn next"
          onClick={() => handleAction(nextSong)}
          title="Next Track"
          aria-label="Next Track"
        >
          <SkipForward size={32} />
        </button>

        <button
          className={`car-round-ctrl-btn repeat ${isLoop ? 'active' : ''}`}
          onClick={toggleLoop}
          title="Repeat Track"
          aria-label="Repeat Track"
        >
          <Repeat size={24} />
        </button>
      </div>
    </div>
  );
};

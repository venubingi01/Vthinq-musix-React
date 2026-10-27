'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMusic } from '../context/MusicContext';
import { Visualizer } from './Visualizer';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Heart,
  Quote,
  Loader2,
  Share2,
  Sparkles
} from 'lucide-react';

// Format seconds to mm:ss
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const PlayerBar: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoop,
    isShuffle,
    togglePlay,
    seek,
    nextSong,
    prevSong,
    setVolume,
    toggleMute,
    toggleLoop,
    toggleShuffle,
    toggleFavorite,
    isFavorite,
    openShareModal,
    openFullscreenVisualizer
  } = useMusic();

  const pathname = usePathname();

  if (!currentSong) return null;

  const isFav = isFavorite(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="player-bar-container">
      {/* Top progress seek line */}
      <div className="progress-seek-wrapper">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="progress-seek-slider"
          aria-label="Seek track position"
          style={{
            background: `linear-gradient(to right, #ee0979 ${progressPercent}%, rgba(255, 255, 255, 0.15) ${progressPercent}%)`
          }}
        />
      </div>

      <div className="player-bar-content">
        {/* Track Info - Link to /player */}
        <Link href="/player" className="player-track-info" style={{ textDecoration: 'none' }}>
          <div className="track-cover-wrapper">
            <img
              src={currentSong.image}
              alt={currentSong.name}
              className={`track-cover ${isPlaying ? 'cover-spin-subtle' : ''}`}
              loading="lazy"
            />
            {isPlaying && <div className="playing-pulse-dot" />}
          </div>
          <div className="track-text">
            <span className="track-title" title={currentSong.name}>
              {currentSong.name}
            </span>
            <span className="track-artist" title={currentSong.artist}>
              {currentSong.artist}
            </span>
          </div>
          <button
            className={`fav-btn-inline ${isFav ? 'is-fav' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(currentSong);
            }}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Favorite button"
          >
            <Heart size={18} fill={isFav ? '#ff3b30' : 'none'} color={isFav ? '#ff3b30' : 'currentColor'} />
          </button>
        </Link>

        {/* Center Playback Controls */}
        <div className="player-controls-center">
          <div className="controls-button-group">
            <button
              className={`ctrl-btn icon-small ${isShuffle ? 'active-toggle' : ''}`}
              onClick={toggleShuffle}
              title="Shuffle"
              aria-label="Shuffle"
            >
              <Shuffle size={17} />
            </button>

            <button className="ctrl-btn" onClick={prevSong} title="Previous Song" aria-label="Previous">
              <SkipBack size={21} />
            </button>

            <button
              className="ctrl-btn play-pause-btn"
              onClick={togglePlay}
              disabled={isLoading && !isPlaying}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 size={24} className="spin-loader" />
              ) : isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" className="play-triangle" />
              )}
            </button>

            <button className="ctrl-btn" onClick={nextSong} title="Next Song" aria-label="Next">
              <SkipForward size={21} />
            </button>

            <button
              className={`ctrl-btn icon-small ${isLoop ? 'active-toggle' : ''}`}
              onClick={toggleLoop}
              title="Repeat"
              aria-label="Repeat"
            >
              <Repeat size={17} />
            </button>
          </div>

          {/* Time display under buttons */}
          <div className="player-time-row">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right side Extras: Visualizer, Player View Link & Volume */}
        <div className="player-extras-right">
          <div
            className="desktop-visualizer"
            onClick={openFullscreenVisualizer}
            title="Click for Fullscreen Visualizer"
            style={{ cursor: 'pointer' }}
          >
            <Visualizer height={32} />
          </div>

          {/* Dedicated Fullscreen Particle Visualizer Button */}
          <button
            className="ctrl-btn visualizer-btn"
            onClick={openFullscreenVisualizer}
            title="Fullscreen Particle Visualizer"
            aria-label="Fullscreen Particle Visualizer"
          >
            <Sparkles size={18} className="sparkle-icon" />
          </button>

          {/* Now Playing & Video view Link */}
          <Link
            href="/player"
            className={`ctrl-btn desktop-only-btn ${pathname === '/player' ? 'active-toggle' : ''}`}
            title="Now Playing & Video Canvas"
            aria-label="Now Playing"
            style={{ textDecoration: 'none' }}
          >
            <Quote size={19} />
          </Link>

          {/* Quick Share Song */}
          <button
            className="ctrl-btn"
            onClick={() => {
              if (!currentSong) return;
              const origin = typeof window !== 'undefined' ? window.location.origin : '';
              openShareModal({
                title: currentSong.name,
                subtitle: `${currentSong.artist} • ${currentSong.album}`,
                url: `${origin}/player?songId=${currentSong.id}&song=${encodeURIComponent(currentSong.name)}`,
                image: currentSong.image,
                type: 'song'
              });
            }}
            title="Share Song"
            aria-label="Share Song"
          >
            <Share2 size={18} />
          </button>

          {/* Volume slider */}
          <div className="volume-control-group">
            <button className="ctrl-btn volume-btn" onClick={toggleMute} title="Mute/Unmute" aria-label="Volume">
              {isMuted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="volume-slider"
              aria-label="Volume slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

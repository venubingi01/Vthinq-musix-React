'use client';

import React from 'react';
import { useMusic } from '../../context/MusicContext';
import { Heart, Music2, Disc } from 'lucide-react';
import { decodeHTMLEntities } from '../../services/sangeethamApi';

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const CarNowPlaying: React.FC = () => {
  const {
    currentSong,
    currentTime,
    duration,
    seek,
    toggleFavorite,
    isFavorite,
    isPlaying
  } = useMusic();

  if (!currentSong) {
    return (
      <div className="car-now-playing-empty">
        <Music2 size={64} className="text-muted" />
        <p className="car-empty-title">No track currently selected</p>
        <p className="car-empty-sub">Tap Search or Queue to pick a song</p>
      </div>
    );
  }

  const isFav = isFavorite(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const songTitle = decodeHTMLEntities(currentSong.name || 'Unknown Title');
  const artistName = decodeHTMLEntities(currentSong.artist || 'Unknown Artist');
  const albumName = decodeHTMLEntities(currentSong.album || '');

  return (
    <div className="car-now-playing-card">
      {/* Top track & artwork row */}
      <div className="car-np-main-row">
        {/* Album Artwork with Glow & Favorite overlay */}
        <div className="car-artwork-container">
          {currentSong.image ? (
            <img
              src={currentSong.image}
              alt={songTitle}
              className={`car-album-art ${isPlaying ? 'playing' : ''}`}
              loading="eager"
            />
          ) : (
            <div className="car-album-placeholder">
              <Disc size={64} className="text-electric-blue" />
            </div>
          )}

          {/* Quick Favorite toggle button */}
          <button
            className={`car-fav-btn ${isFav ? 'favorited' : ''}`}
            onClick={() => toggleFavorite(currentSong)}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={26} className={isFav ? 'fill-electric-blue' : ''} />
          </button>
        </div>

        {/* Track Title, Artist, and Album Information */}
        <div className="car-metadata-container">
          <h1 className="car-song-title" title={songTitle}>
            {songTitle}
          </h1>

          <p className="car-song-artist" title={artistName}>
            {artistName}
          </p>

          {albumName && (
            <p className="car-song-album" title={albumName}>
              <Disc size={16} className="inline-icon" />
              <span>{albumName}</span>
            </p>
          )}

          {currentSong.quality && (
            <span className="car-quality-pill">{currentSong.quality}</span>
          )}
        </div>
      </div>

      {/* Large Touch Scrubber Progress Bar */}
      <div className="car-progress-wrapper">
        <div className="car-slider-container">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="car-seek-slider"
            aria-label="Seek track position"
            style={{
              background: `linear-gradient(to right, #00d2ff ${progressPercent}%, rgba(255, 255, 255, 0.14) ${progressPercent}%)`
            }}
          />
        </div>

        {/* Timestamps */}
        <div className="car-timestamps-row">
          <span className="car-time current">{formatDuration(currentTime)}</span>
          <span className="car-time duration">{formatDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { useMusic } from '../../context/MusicContext';
import { Heart, Play, Pause, Shuffle, Music, Flame, Sparkles } from 'lucide-react';
import { decodeHTMLEntities } from '../../services/sangeethamApi';
import type { Song } from '../../types/music';

interface CarFavoritesViewProps {
  onSongSelected?: () => void;
  onExploreTap?: () => void;
}

function formatDuration(sec?: number): string {
  if (!sec || isNaN(sec)) return '3:45';
  const mins = Math.floor(sec / 60);
  const rem = Math.floor(sec % 60);
  return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
}

export const CarFavoritesView: React.FC<CarFavoritesViewProps> = ({
  onSongSelected,
  onExploreTap
}) => {
  const {
    favorites,
    currentSong,
    playSong,
    isPlaying,
    togglePlay,
    toggleFavorite,
    isFavorite
  } = useMusic();

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, favorites);
      if (onSongSelected) onSongSelected();
    }
  };

  const handlePlayAll = () => {
    if (favorites.length > 0) {
      playSong(favorites[0], favorites);
      if (onSongSelected) onSongSelected();
    }
  };

  const handleShufflePlay = () => {
    if (favorites.length > 0) {
      const shuffled = [...favorites].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
      if (onSongSelected) onSongSelected();
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="car-fav-empty-container">
        <div className="car-fav-empty-orb">
          <div className="car-fav-empty-pulse-ring" />
          <Heart size={68} className="car-fav-empty-icon" />
        </div>
        <h2 className="car-fav-empty-title">No Road Favorites Yet</h2>
        <p className="car-fav-empty-subtitle">
          Tap the heart icon on any song or album while cruising to build your automotive collection.
        </p>
        <button
          className="car-fav-explore-btn"
          onClick={onExploreTap || onSongSelected}
          aria-label="Discover music"
        >
          <Sparkles size={20} className="text-electric-blue" />
          <span>Explore Road Tracks</span>
        </button>
      </div>
    );
  }

  return (
    <div className="car-fav-screen-container">
      {/* Top Banner Header matching automotive reference board */}
      <div className="car-fav-top-bar">
        <div className="car-fav-title-group">
          <div className="car-fav-badge-icon">
            <Heart size={26} className="fill-neon-pink text-neon-pink" />
          </div>
          <div className="car-fav-titles">
            <h1 className="car-fav-main-heading">Favorite Road Tracks</h1>
            <span className="car-fav-stats">
              <Flame size={14} className="text-electric-blue" />
              <span>{favorites.length} Saved Tracks • Curated for the Road</span>
            </span>
          </div>
        </div>

        {/* Quick Driver Action Buttons */}
        <div className="car-fav-actions-group">
          <button
            className="car-fav-play-all-btn"
            onClick={handlePlayAll}
            title="Play All Favorites"
            aria-label="Play all favorite songs"
          >
            <Play size={20} className="fill-black" />
            <span>Play All</span>
          </button>

          <button
            className="car-fav-shuffle-btn"
            onClick={handleShufflePlay}
            title="Shuffle Favorites"
            aria-label="Shuffle play favorites"
          >
            <Shuffle size={18} />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {/* Favorites List Grid with large automotive touch targets */}
      <div className="car-fav-cards-list">
        {favorites.map((song, index) => {
          const isCurrent = currentSong?.id === song.id;
          const isCurrentPlaying = isCurrent && isPlaying;
          const name = decodeHTMLEntities(song.name);
          const artist = decodeHTMLEntities(song.artist);
          const album = decodeHTMLEntities(song.album || '');

          return (
            <div
              key={song.id}
              className={`car-fav-card-row ${isCurrent ? 'active' : ''}`}
              onClick={() => handlePlay(song)}
              role="button"
              tabIndex={0}
              aria-label={`Play favorite ${name} by ${artist}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePlay(song);
                }
              }}
            >
              {/* Ranking or Live Equalizer Animation */}
              <div className="car-fav-rank-col">
                {isCurrentPlaying ? (
                  <div className="car-fav-equalizer-bars" aria-label="Playing now">
                    <span className="bar bar-1" />
                    <span className="bar bar-2" />
                    <span className="bar bar-3" />
                  </div>
                ) : (
                  <span className="car-fav-rank-num">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </span>
                )}
              </div>

              {/* Artwork Tile with Play Overlay */}
              <div className="car-fav-art-wrap">
                {song.image ? (
                  <img src={song.image} alt={name} className="car-fav-art-img" loading="lazy" />
                ) : (
                  <div className="car-fav-art-placeholder">
                    <Music size={26} className="text-electric-blue" />
                  </div>
                )}
                <div className={`car-fav-art-overlay ${isCurrentPlaying ? 'show' : ''}`}>
                  {isCurrentPlaying ? (
                    <Pause size={20} className="fill-white" />
                  ) : (
                    <Play size={20} className="fill-white offset-play" />
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="car-fav-info-col">
                <div className="car-fav-title-line">
                  <span className="car-fav-track-name" title={name}>
                    {name}
                  </span>
                  {isCurrent && (
                    <span className="car-fav-live-tag">
                      {isCurrentPlaying ? 'NOW PLAYING' : 'PAUSED'}
                    </span>
                  )}
                </div>
                <span className="car-fav-artist-line" title={`${artist} • ${album}`}>
                  {artist} {album ? `• ${album}` : ''}
                </span>
              </div>

              {/* Duration Tag */}
              <span className="car-fav-duration-tag">
                {formatDuration(song.duration)}
              </span>

              {/* Action Buttons: Play/Pause circle & Heart toggle */}
              <div className="car-fav-btns-col" onClick={(e) => e.stopPropagation()}>
                <button
                  className={`car-fav-circle-play-btn ${isCurrentPlaying ? 'playing' : ''}`}
                  onClick={() => handlePlay(song)}
                  title={isCurrentPlaying ? 'Pause song' : 'Play song'}
                  aria-label={isCurrentPlaying ? 'Pause song' : 'Play song'}
                >
                  {isCurrentPlaying ? (
                    <Pause size={20} className="fill-white" />
                  ) : (
                    <Play size={20} className="fill-white offset-play" />
                  )}
                </button>

                <button
                  className="car-fav-remove-heart-btn"
                  onClick={() => toggleFavorite(song)}
                  title="Remove from favorites"
                  aria-label={`Remove ${name} from favorites`}
                >
                  <Heart
                    size={22}
                    className="fill-neon-pink text-neon-pink"
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

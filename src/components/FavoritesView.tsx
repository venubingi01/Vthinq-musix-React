'use client';

import React from 'react';
import Link from 'next/link';
import { useMusic } from '../context/MusicContext';
import { Heart, Play, Trash2, Music } from 'lucide-react';

export const FavoritesView: React.FC = () => {
  const { favorites, playSong, currentSong, toggleFavorite } = useMusic();

  const handlePlayAll = () => {
    if (favorites.length > 0) {
      playSong(favorites[0], favorites);
    }
  };

  return (
    <div className="favorites-view-container">
      <div className="favorites-header">
        <div className="favorites-title-group">
          <div className="fav-icon-box">
            <Heart size={28} fill="#ff3b30" color="#ff3b30" />
          </div>
          <div>
            <h1 className="fav-main-title">My Liked Songs</h1>
            <p className="fav-subtitle">
              {favorites.length} {favorites.length === 1 ? 'track' : 'tracks'} saved to library
            </p>
          </div>
        </div>

        {favorites.length > 0 && (
          <button className="play-all-btn" onClick={handlePlayAll}>
            <Play size={18} fill="currentColor" />
            <span>Play All</span>
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="empty-favorites-box">
          <Music size={52} className="text-muted" />
          <h2>No favorites yet</h2>
          <p>Tap the heart icon on any song while listening to add it to your library.</p>
          <Link href="/" className="explore-btn" style={{ textDecoration: 'none' }}>
            Explore Music
          </Link>
        </div>
      ) : (
        <div className="favorites-list">
          {favorites.map((song, index) => {
            return (
              <div
                key={song.id}
                className={`favorite-item-row ${currentSong?.id === song.id ? 'active-row' : ''}`}
                onClick={() => playSong(song, favorites)}
              >
                <div className="fav-index-col">
                  <span>{index + 1}</span>
                </div>

                <div className="fav-thumb-col">
                  <img src={song.image} alt={song.name} className="fav-thumb" loading="lazy" />
                  <div className="fav-play-hover">
                    <Play size={16} fill="#fff" />
                  </div>
                </div>

                <div className="fav-info-col">
                  <h3 className="fav-track-name">{song.name}</h3>
                  <p className="fav-track-artist">{song.artist}</p>
                </div>

                <div className="fav-album-col">
                  <span>{song.album}</span>
                </div>

                <div className="fav-action-col" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="fav-remove-btn"
                    onClick={() => toggleFavorite(song)}
                    title="Remove from favorites"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

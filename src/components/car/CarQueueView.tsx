'use client';

import React from 'react';
import { useMusic } from '../../context/MusicContext';
import { Play, Music, ListMusic, Shuffle, Repeat, BarChart2 } from 'lucide-react';
import { decodeHTMLEntities } from '../../services/sangeethamApi';

interface CarQueueViewProps {
  onSongSelected?: () => void;
}

export const CarQueueView: React.FC<CarQueueViewProps> = ({ onSongSelected }) => {
  const {
    playlist,
    currentSong,
    playSong,
    isPlaying,
    isShuffle,
    toggleShuffle,
    isLoop,
    toggleLoop
  } = useMusic();

  if (playlist.length === 0) {
    return (
      <div className="car-queue-empty">
        <ListMusic size={60} className="text-muted" />
        <p className="car-empty-title">Queue is empty</p>
        <p className="car-empty-sub">Search for songs or play a mix to fill the queue</p>
      </div>
    );
  }

  const handleSelect = (song: any) => {
    playSong(song);
    if (onSongSelected) onSongSelected();
  };

  return (
    <div className="car-queue-screen8-view">
      {/* Top Header matching Screen 8: Playing Next | [Shuffle] [Repeat] */}
      <div className="car-queue-header-screen8">
        <h2 className="car-queue-title-screen8">Playing Next</h2>

        <div className="car-queue-actions-screen8">
          <button
            className={`car-queue-action-pill ${isShuffle ? 'active' : ''}`}
            onClick={toggleShuffle}
            title={isShuffle ? 'Shuffle Enabled' : 'Enable Shuffle'}
            aria-label="Toggle Shuffle"
          >
            <Shuffle size={18} />
            <span>Shuffle</span>
          </button>

          <button
            className={`car-queue-action-pill ${isLoop ? 'active' : ''}`}
            onClick={toggleLoop}
            title={isLoop ? 'Repeat Enabled' : 'Enable Repeat'}
            aria-label="Toggle Repeat"
          >
            <Repeat size={18} />
            <span>Repeat</span>
          </button>
        </div>
      </div>

      {/* Ranked List matching Screen 8 (1. Kesariya, 2. Channa Mereya, ...) */}
      <div className="car-queue-ranked-list">
        {playlist.map((song, idx) => {
          const isCurrent = currentSong?.id === song.id;
          const name = decodeHTMLEntities(song.name);
          const artist = decodeHTMLEntities(song.artist);
          const album = decodeHTMLEntities(song.album || '');

          return (
            <div
              key={`${song.id}-${idx}`}
              className={`car-queue-row-screen8 ${isCurrent ? 'active' : ''}`}
              onClick={() => handleSelect(song)}
              role="button"
              tabIndex={0}
              aria-label={`Play ${name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelect(song);
                }
              }}
            >
              {/* Rank Index */}
              <span className="car-q8-rank">{idx + 1}</span>

              {/* Thumbnail */}
              <div className="car-q8-cover-wrap">
                {song.image ? (
                  <img src={song.image} alt={name} className="car-q8-cover" loading="lazy" />
                ) : (
                  <div className="car-q8-placeholder">
                    <Music size={22} className="text-electric-blue" />
                  </div>
                )}
                <div className="car-q8-play-overlay">
                  <Play size={18} className="fill-white" />
                </div>
              </div>

              {/* Title & Artist/Album */}
              <div className="car-q8-info">
                <span className="car-q8-title">{name}</span>
                <span className="car-q8-subtitle">
                  {artist} {album ? `• ${album}` : ''}
                </span>
              </div>

              {/* Active Audio Bars Indicator */}
              {isCurrent && (
                <div className="car-q8-playing-indicator">
                  <span className="q8-bar b1" />
                  <span className="q8-bar b2" />
                  <span className="q8-bar b3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

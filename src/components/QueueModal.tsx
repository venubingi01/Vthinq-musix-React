'use client';

import React from 'react';
import { useMusic } from '../context/MusicContext';
import { X, Play, Music, ListMusic } from 'lucide-react';

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueueModal: React.FC<QueueModalProps> = ({ isOpen, onClose }) => {
  const { playlist, currentSong, isPlaying, playSong } = useMusic();

  if (!isOpen) return null;

  return (
    <div className="queue-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="queue-modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="queue-modal-header">
          <div className="queue-title-wrap">
            <ListMusic size={22} className="text-pink" />
            <div>
              <h3 className="queue-title">Playing Queue</h3>
              <p className="queue-subtitle">{playlist.length} tracks in queue</p>
            </div>
          </div>
          <button className="queue-close-btn" onClick={onClose} title="Close Queue">
            <X size={20} />
          </button>
        </div>

        <div className="queue-list-scroll">
          {playlist.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;

            return (
              <div
                key={`${song.id}-${index}`}
                className={`queue-item-row ${isCurrent ? 'active-queue-row' : ''}`}
                onClick={() => playSong(song, playlist)}
              >
                <div className="queue-index">{index + 1}</div>
                <div className="queue-thumb-wrap">
                  <img src={song.image} alt={song.name} className="queue-thumb" />
                  <div className="queue-play-hover">
                    <Play size={14} fill="#fff" />
                  </div>
                </div>
                <div className="queue-info">
                  <span className="queue-name">{song.name}</span>
                  <span className="queue-artist">{song.artist}</span>
                </div>
                {isCurrent && (
                  <div className="queue-playing-indicator">
                    <Music size={16} className="text-pink" />
                    <span>{isPlaying ? 'Playing' : 'Paused'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import {
  X,
  Plus,
  ListPlus,
  Check,
  Music2,
  FolderPlus
} from 'lucide-react';

export const AddToPlaylistModal: React.FC = () => {
  const {
    addToPlaylistSong,
    closeAddToPlaylistModal,
    userPlaylists,
    addSongToPlaylist,
    createPlaylist
  } = useMusic();

  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  if (!addToPlaylistSong) return null;

  const handleSelectPlaylist = (playlistId: string) => {
    addSongToPlaylist(playlistId, addToPlaylistSong);
    closeAddToPlaylistModal();
  };

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlaylistName.trim();
    if (!name) return;
    const created = createPlaylist(name, addToPlaylistSong);
    setNewPlaylistName('');
    setIsCreating(false);
    closeAddToPlaylistModal();
  };

  return (
    <div className="share-modal-backdrop" onClick={closeAddToPlaylistModal}>
      <div
        className="share-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-playlist-title"
        style={{ maxWidth: '440px' }}
      >
        {/* Header */}
        <div className="share-modal-header">
          <div className="share-header-left">
            <ListPlus size={22} className="text-pink" />
            <h2 id="add-to-playlist-title">Add to Playlist</h2>
          </div>
          <button
            className="share-modal-close-btn"
            onClick={closeAddToPlaylistModal}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selected Song Preview */}
        <div className="share-preview-card">
          <img
            src={addToPlaylistSong.image}
            alt={addToPlaylistSong.name}
            className="share-preview-thumb"
            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <div className="share-preview-meta" style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                display: 'block',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {addToPlaylistSong.name}
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {addToPlaylistSong.artist}
            </span>
          </div>
        </div>

        {/* Create New Playlist Section */}
        {isCreating ? (
          <form onSubmit={handleCreateAndAdd} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              autoFocus
              className="search-input-field"
              placeholder="Enter playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.9rem',
                flex: 1
              }}
            />
            <button
              type="submit"
              className="album-play-btn"
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              Create
            </button>
            <button
              type="button"
              className="album-shuffle-btn"
              onClick={() => setIsCreating(false)}
              style={{ padding: '8px 12px' }}
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="album-back-btn"
            onClick={() => setIsCreating(true)}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '10px 16px',
              background: 'rgba(238, 9, 121, 0.12)',
              borderColor: 'rgba(238, 9, 121, 0.35)',
              color: '#ff3b75'
            }}
          >
            <FolderPlus size={18} />
            <span>+ Create New Playlist</span>
          </button>
        )}

        {/* Existing Playlists Scrollable List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Your Playlists ({userPlaylists.length})
          </span>

          {userPlaylists.map((pl) => {
            const isAlreadyIn = pl.songs.some((s) => s.id === addToPlaylistSong.id);

            return (
              <div
                key={pl.id}
                onClick={() => handleSelectPlaylist(pl.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: isAlreadyIn ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
                  e.currentTarget.style.borderColor = 'rgba(238, 9, 121, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isAlreadyIn ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.07)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #ff2d75, #4f46e5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    {pl.cover ? (
                      <img src={pl.cover} alt={pl.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Music2 size={18} color="#fff" />
                    )}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: '#fff' }}>
                      {pl.name}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {pl.songs.length} {pl.songs.length === 1 ? 'song' : 'songs'}
                    </span>
                  </div>
                </div>

                {isAlreadyIn ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                    <Check size={16} /> Added
                  </span>
                ) : (
                  <Plus size={18} className="text-muted" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMusic } from '../context/MusicContext';
import {
  Heart,
  Play,
  Trash2,
  Music,
  ListPlus,
  FolderPlus,
  Music2,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import type { UserPlaylist } from '../types/music';

export const FavoritesView: React.FC = () => {
  const {
    favorites,
    playSong,
    currentSong,
    toggleFavorite,
    userPlaylists,
    createPlaylist,
    deletePlaylist,
    removeSongFromPlaylist,
    openAddToPlaylistModal
  } = useMusic();

  const [activeTab, setActiveTab] = useState<'favorites' | 'playlists'>('favorites');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');

  const selectedPlaylist = userPlaylists.find((p) => p.id === selectedPlaylistId) || null;

  const handlePlayFavorites = () => {
    if (favorites.length > 0) {
      playSong(favorites[0], favorites);
    }
  };

  const handlePlayUserPlaylist = (pl: UserPlaylist) => {
    if (pl.songs.length > 0) {
      playSong(pl.songs[0], pl.songs);
    }
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlaylistName.trim();
    if (!name) return;
    const pl = createPlaylist(name);
    setNewPlaylistName('');
    setIsCreating(false);
    setSelectedPlaylistId(pl.id);
  };

  return (
    <div className="favorites-view-container">
      {/* Top Segmented Tab Switcher */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          className={`search-category-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('favorites');
            setSelectedPlaylistId(null);
          }}
          style={{ padding: '10px 20px', fontSize: '0.92rem' }}
        >
          <Heart size={18} fill={activeTab === 'favorites' ? '#ff3b30' : 'none'} color={activeTab === 'favorites' ? '#ff3b30' : 'currentColor'} />
          <span>Liked Songs</span>
          <span className="category-badge">{favorites.length}</span>
        </button>

        <button
          className={`search-category-btn ${activeTab === 'playlists' ? 'active' : ''}`}
          onClick={() => setActiveTab('playlists')}
          style={{ padding: '10px 20px', fontSize: '0.92rem' }}
        >
          <ListPlus size={18} />
          <span>My Playlists</span>
          <span className="category-badge">{userPlaylists.length}</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: LIKED SONGS
          ========================================================================= */}
      {activeTab === 'favorites' && (
        <>
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
              <button className="play-all-btn" onClick={handlePlayFavorites}>
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
                        className="share-btn-inline"
                        onClick={() => openAddToPlaylistModal(song)}
                        title="Add to Playlist"
                        style={{ marginRight: '6px' }}
                      >
                        <ListPlus size={16} />
                      </button>

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
        </>
      )}

      {/* =========================================================================
          TAB 2: MY PLAYLISTS
          ========================================================================= */}
      {activeTab === 'playlists' && (
        <div>
          {selectedPlaylist ? (
            /* Selected Playlist Detail View */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button
                  onClick={() => setSelectedPlaylistId(null)}
                  className="album-back-btn"
                  style={{ border: '1px solid var(--glass-border)' }}
                >
                  <ArrowLeft size={16} />
                  <span>All Playlists</span>
                </button>

                <button
                  onClick={() => {
                    deletePlaylist(selectedPlaylist.id);
                    setSelectedPlaylistId(null);
                  }}
                  className="album-back-btn"
                  style={{ color: '#ff3b30', borderColor: 'rgba(255, 59, 48, 0.3)' }}
                  title="Delete Playlist"
                >
                  <Trash2 size={16} />
                  <span>Delete Playlist</span>
                </button>
              </div>

              <div className="favorites-header" style={{ marginBottom: '24px' }}>
                <div className="favorites-title-group">
                  <div
                    className="fav-icon-box"
                    style={{
                      background: 'linear-gradient(135deg, #ff2d75, #7928ca)',
                      borderRadius: '14px',
                      overflow: 'hidden'
                    }}
                  >
                    {selectedPlaylist.cover ? (
                      <img src={selectedPlaylist.cover} alt={selectedPlaylist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Music2 size={28} color="#fff" />
                    )}
                  </div>
                  <div>
                    <h1 className="fav-main-title">{selectedPlaylist.name}</h1>
                    <p className="fav-subtitle">
                      {selectedPlaylist.songs.length} {selectedPlaylist.songs.length === 1 ? 'track' : 'tracks'} • Created by You
                    </p>
                  </div>
                </div>

                {selectedPlaylist.songs.length > 0 && (
                  <button className="play-all-btn" onClick={() => handlePlayUserPlaylist(selectedPlaylist)}>
                    <Play size={18} fill="currentColor" />
                    <span>Play All</span>
                  </button>
                )}
              </div>

              {selectedPlaylist.songs.length === 0 ? (
                <div className="empty-favorites-box">
                  <ListPlus size={52} className="text-muted" />
                  <h2>Playlist is empty</h2>
                  <p>Add tracks to this playlist by tapping the + icon on any song or album track.</p>
                  <Link href="/search" className="explore-btn" style={{ textDecoration: 'none' }}>
                    Browse Songs
                  </Link>
                </div>
              ) : (
                <div className="favorites-list">
                  {selectedPlaylist.songs.map((song, index) => (
                    <div
                      key={`${song.id}-${index}`}
                      className={`favorite-item-row ${currentSong?.id === song.id ? 'active-row' : ''}`}
                      onClick={() => playSong(song, selectedPlaylist.songs)}
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
                          onClick={() => removeSongFromPlaylist(selectedPlaylist.id, song.id)}
                          title="Remove from playlist"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* All Playlists Grid View */
            <div>
              <div className="favorites-header" style={{ marginBottom: '24px' }}>
                <div className="favorites-title-group">
                  <div
                    className="fav-icon-box"
                    style={{ background: 'linear-gradient(135deg, #ee0979, #ff6a00)' }}
                  >
                    <ListPlus size={28} color="#fff" />
                  </div>
                  <div>
                    <h1 className="fav-main-title">Custom Playlists</h1>
                    <p className="fav-subtitle">
                      {userPlaylists.length} personal {userPlaylists.length === 1 ? 'playlist' : 'playlists'}
                    </p>
                  </div>
                </div>

                {!isCreating && (
                  <button
                    className="play-all-btn"
                    onClick={() => setIsCreating(true)}
                    style={{ background: 'linear-gradient(135deg, #ff2d75, #7928ca)' }}
                  >
                    <FolderPlus size={18} />
                    <span>Create Playlist</span>
                  </button>
                )}
              </div>

              {/* Inline Create Playlist Form */}
              {isCreating && (
                <form
                  onSubmit={handleCreatePlaylist}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <input
                    type="text"
                    autoFocus
                    placeholder="Enter playlist name..."
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="search-input-field"
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#fff'
                    }}
                  />
                  <button type="submit" className="album-play-btn" style={{ padding: '8px 18px' }}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="album-shuffle-btn"
                    onClick={() => setIsCreating(false)}
                    style={{ padding: '8px 14px' }}
                  >
                    Cancel
                  </button>
                </form>
              )}

              {/* Playlists Cards Grid */}
              <div className="album-cards-grid">
                {userPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaylistId(pl.id)}
                    className="album-card-link"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="album-card-item playlist-card-item">
                      <div className="album-card-img-wrapper">
                        {pl.cover ? (
                          <img src={pl.cover} alt={pl.name} className="album-card-img" loading="lazy" />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(135deg, #1f2937, #374151)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Music2 size={36} color="var(--text-muted)" />
                          </div>
                        )}

                        <div className="album-card-badge">
                          <Music2 size={12} />
                          <span>{pl.songs.length} Tracks</span>
                        </div>

                        {pl.songs.length > 0 && (
                          <button
                            className="album-card-play-overlay"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayUserPlaylist(pl);
                            }}
                            title={`Play ${pl.name}`}
                            aria-label={`Play ${pl.name}`}
                          >
                            <Play size={20} fill="#fff" />
                          </button>
                        )}
                      </div>

                      <div className="album-card-meta">
                        <h3 className="album-card-title" title={pl.name}>
                          {pl.name}
                        </h3>
                        <p className="album-card-artists">
                          {pl.songs.length > 0
                            ? pl.songs.slice(0, 2).map((s) => s.name).join(', ')
                            : 'Empty playlist'}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span className="album-card-year">
                            {pl.songs.length} {pl.songs.length === 1 ? 'song' : 'songs'}
                          </span>
                          <span className="album-card-year" style={{ color: 'var(--accent-pink)', fontWeight: 700, fontSize: '0.78rem' }}>
                            VIEW
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

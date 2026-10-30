'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMusic } from '../context/MusicContext';
import { getAlbumDetails, STARTER_ALBUMS } from '../services/saavnApi';
import type { Album } from '../types/music';
import {
  ArrowLeft,
  Play,
  Shuffle,
  Heart,
  Disc,
  Clock,
  Loader2,
  Music2,
  Share2,
  Radio,
  ListPlus
} from 'lucide-react';
import { QualityBadge } from './QualityBadge';

// Format seconds to mm:ss
function formatDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds)) return '3:45';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

interface AlbumViewProps {
  albumId?: string;
}

export const AlbumView: React.FC<AlbumViewProps> = ({ albumId = 'alb_ala_vaikunthapurramuloo' }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from');
  const qParam = searchParams.get('q');
  const tabParam = searchParams.get('tab');
  const titleParam = searchParams.get('title');

  const { playSong, currentSong, isPlaying, toggleFavorite, isFavorite, openShareModal, openAddToPlaylistModal } = useMusic();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Resolve exact album ID from URL search parameter if present
    let targetAlbumId = albumId;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get('id') || urlParams.get('albumId');
      if (queryId) targetAlbumId = queryId;
    }

    getAlbumDetails(targetAlbumId, titleParam || undefined)
      .then((data) => {
        if (isMounted) {
          setAlbum(data || STARTER_ALBUMS[0]);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAlbum(STARTER_ALBUMS[0]);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [albumId, titleParam]);

  if (isLoading) {
    return (
      <div className="album-loading-state">
        <Loader2 size={36} className="spin-loader text-pink" />
        <p>Loading album tracks...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="album-empty-state">
        <Disc size={48} className="text-muted" />
        <h2>Album Not Found</h2>
        <Link href="/" className="explore-btn" style={{ textDecoration: 'none' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (album.songs && album.songs.length > 0) {
      playSong(album.songs[0], album.songs);
    }
  };

  const handleShuffle = () => {
    if (album.songs && album.songs.length > 0) {
      const shuffled = [...album.songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  const isPlaylist =
    album.artists?.toLowerCase().includes('curated') ||
    album.artists?.toLowerCase().includes('playlist');

  const handleBack = () => {
    // 1. If explicit query parameter from search was passed
    if (qParam || fromParam === 'search') {
      const q = qParam || '';
      const tab = tabParam || (isPlaylist ? 'charts' : 'albums');
      router.push(`/search?q=${encodeURIComponent(q)}&tab=${encodeURIComponent(tab)}`);
      return;
    }

    // 2. Check sessionStorage for the previously searched value
    if (typeof window !== 'undefined') {
      try {
        const lastSearchRaw = sessionStorage.getItem('sangeetham_last_search');
        if (lastSearchRaw) {
          const lastSearch = JSON.parse(lastSearchRaw);
          if (lastSearch?.query) {
            router.push(`/search?q=${encodeURIComponent(lastSearch.query)}&tab=${encodeURIComponent(lastSearch.tab || 'albums')}`);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to parse last search:', e);
      }
    }

    // 3. Fallback to router.back or search
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/search');
    }
  };

  const handleShareAlbum = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    openShareModal({
      title: album.title,
      subtitle: `${album.artists} • ${album.year || '2024'}`,
      url: `${origin}/album?id=${album.id}&title=${encodeURIComponent(album.title)}`,
      image: album.cover,
      type: 'album'
    });
  };

  const isFromSearch = fromParam === 'search' || Boolean(qParam);

  return (
    <div className="album-view-container">
      {/* Top Back Navigation Bar */}
      <div className="album-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={handleBack}
          className="album-back-btn"
          title={isFromSearch ? 'Back to Search Results' : 'Back'}
          aria-label="Back"
          style={{ border: '1px solid var(--glass-border)', background: 'var(--bg-surface)' }}
        >
          <ArrowLeft size={18} />
          <span>{isFromSearch ? 'Back to Search' : 'Back'}</span>
        </button>

        <Link
          href={isPlaylist ? '/search?tab=charts' : '/search?tab=albums'}
          className="album-back-btn"
          style={{ textDecoration: 'none', background: 'rgba(255, 255, 255, 0.08)' }}
        >
          {isPlaylist ? <Radio size={16} /> : <Disc size={16} />}
          <span>{isPlaylist ? 'Browse Charts & Playlists' : 'Browse All Albums'}</span>
        </Link>
      </div>

      {/* Album Hero Card */}
      <div className="album-hero-card">
        <div className="album-cover-glow" style={{ backgroundImage: `url(${album.cover})` }} />

        <div className="album-cover-box" style={{ position: 'relative' }}>
          <img src={album.cover} alt={album.title} className="album-cover-img" />
          <QualityBadge size="md" className="album-hero-quality-badge" />
        </div>

        <div className="album-meta-details">
          <span className="album-pill-badge">
            {isPlaylist ? (
              <>
                <Radio size={14} /> PLAYLIST COLLECTION
              </>
            ) : (
              <>
                <Disc size={14} /> ALBUM
              </>
            )}
          </span>
          <h1 className="album-title-text">{album.title}</h1>
          <p className="album-artists-text">{album.artists}</p>

          <div className="album-info-stats">
            <span>{album.year || '2024'}</span>
            <span>•</span>
            <span>{album.songs ? album.songs.length : album.songCount} Songs</span>
            <span>•</span>
            <span className="album-lang-chip">{album.language?.toUpperCase() || 'MUSIC'}</span>
          </div>

          <div className="album-actions-group">
            <button className="album-play-btn" onClick={handlePlayAll}>
              <Play size={18} fill="currentColor" />
              <span>Play All</span>
            </button>
            <button className="album-shuffle-btn" onClick={handleShuffle}>
              <Shuffle size={18} />
              <span>Shuffle</span>
            </button>
            <button className="album-share-btn" onClick={handleShareAlbum} title="Share Album">
              <Share2 size={18} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tracklist List */}
      <div className="album-tracklist-section">
        <div className="tracklist-header-row">
          <h3>
            <Music2 size={18} className="text-pink" /> Album Tracklist
          </h3>
          <span className="tracklist-count">
            {album.songs ? album.songs.length : 0} Tracks
          </span>
        </div>

        <div className="album-tracks-list">
          {album.songs && album.songs.length > 0 ? (
            album.songs.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              const isFav = isFavorite(song.id);

              return (
                <div
                  key={`${song.id}-${index}`}
                  className={`album-track-row ${isCurrent ? 'active-track' : ''}`}
                  onClick={() => playSong(song, album.songs)}
                >
                  <div className="track-index-col">
                    {isCurrent && isPlaying ? (
                      <span className="track-equalizer-bars">▶</span>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  <div className="track-info-col">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="track-name-text">{song.name}</span>
                      <QualityBadge song={song} size="sm" />
                    </div>
                    <span className="track-artist-text">{song.artist}</span>
                  </div>

                  <div className="track-duration-col">
                    <Clock size={13} className="text-muted" />
                    <span>{formatDuration(song.duration)}</span>
                  </div>

                  <div className="track-fav-col" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="share-btn-inline"
                      onClick={() => openAddToPlaylistModal(song)}
                      title="Add to Playlist"
                    >
                      <ListPlus size={16} />
                    </button>

                    <button
                      className="share-btn-inline"
                      onClick={() => {
                        const origin = typeof window !== 'undefined' ? window.location.origin : '';
                        openShareModal({
                          title: song.name,
                          subtitle: `${song.artist} • ${album.title}`,
                          url: `${origin}/player?songId=${song.id}&song=${encodeURIComponent(song.name)}`,
                          image: song.image,
                          type: 'song'
                        });
                      }}
                      title="Share Song"
                    >
                      <Share2 size={15} />
                    </button>

                    <button
                      className={`fav-btn-action ${isFav ? 'is-fav' : ''}`}
                      onClick={() => toggleFavorite(song)}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart
                        size={17}
                        fill={isFav ? '#ff3b30' : 'none'}
                        color={isFav ? '#ff3b30' : 'currentColor'}
                      />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-tracks-state">
              <p>No tracks loaded for this album.</p>
            </div>
          )}
        </div>
      </div>

      {/* Discover Other Top Albums */}
      <div className="album-related-section" style={{ marginTop: '40px' }}>
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <div className="section-title-wrap">
            <Disc className="section-icon text-pink" size={20} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Discover More Top Albums</h3>
          </div>
          <Link
            href="/search?tab=albums"
            className="section-view-more"
            style={{ textDecoration: 'none' }}
          >
            <span>View All Albums</span>
          </Link>
        </div>

        <div className="album-cards-grid">
          {STARTER_ALBUMS.filter((item) => item.id !== album.id).map((other) => (
            <Link
              key={other.id}
              href={`/album?id=${other.id}`}
              className="album-card-link"
              style={{ textDecoration: 'none' }}
            >
              <div className="album-card-item">
                <div className="album-card-img-wrapper">
                  <img src={other.cover} alt={other.title} className="album-card-img" loading="lazy" />
                  <div className="album-card-badge">
                    <Music2 size={12} />
                    <span>{other.songs ? other.songs.length : other.songCount} Songs</span>
                  </div>
                  <div className="album-card-play-overlay">
                    <Play size={20} fill="#fff" />
                  </div>
                </div>
                <div className="album-card-meta">
                  <h3 className="album-card-title" title={other.title}>
                    {other.title}
                  </h3>
                  <p className="album-card-artists" title={other.artists}>
                    {other.artists}
                  </p>
                  <span className="album-card-year">
                    {other.year} • {other.language}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

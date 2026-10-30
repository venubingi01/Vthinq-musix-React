'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMusic } from '../context/MusicContext';
import { useDebounce } from '../hooks/useDebounce';
import {
  searchAlbums,
  searchSongs,
  searchPlaylists,
  fetchTopCharts,
  getAlbumDetails,
  STARTER_ALBUMS,
  STARTER_SONGS,
  STARTER_PLAYLISTS
} from '../services/saavnApi';
import type { Song, Album } from '../types/music';
import {
  Search,
  Mic,
  X,
  Play,
  Heart,
  Loader2,
  Music,
  Disc,
  Radio,
  Flame,
  Clock,
  Sparkles,
  Share2,
  ListPlus
} from 'lucide-react';
import { QualityBadge } from './QualityBadge';

type SearchCategory = 'albums' | 'songs' | 'charts';

const POPULAR_ALBUM_CHIPS = [
  'Ala Vaikunthapurramuloo',
  'Jawan',
  'Pushpa 2',
  'Animal',
  'Devara',
  'RRR',
  'Kalki 2898 AD',
  'Guntur Kaaram'
];

const POPULAR_SONG_CHIPS = [
  'Sid Sriram Telugu',
  'Arijit Singh Hits',
  'Anirudh Mass',
  'AR Rahman Classics',
  'Devi Sri Prasad Party',
  'Shreya Ghoshal Melodies'
];

const CHART_PLAYLIST_CHIPS = [
  'SP Balasubramanyam telugu hits',
  'HSK 50 Most Popular Hindi Songs',
  'Anirudh Ravichander hits',
  'Arijit Singh romantic',
  'Sid Sriram melody',
  'Telugu Top 50 Chartbusters'
];

// Helper to format seconds to mm:ss
function formatDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds)) return '3:45';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const SearchView: React.FC = () => {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as SearchCategory) || 'albums';
  const initialQuery = searchParams.get('q') || '';

  const { playSong, currentSong, isPlaying, pauseSong, resumeSong, toggleFavorite, isFavorite, openShareModal, openVoiceSearch, openAddToPlaylistModal } = useMusic();

  // Search category state: ALBUMS FIRST by requirement
  const [searchCategory, setSearchCategory] = useState<SearchCategory>(initialTab);
  const [searchTerm, setSearchTerm] = useState<string>(initialQuery);

  // Results state
  const [albumsResults, setAlbumsResults] = useState<Album[]>(STARTER_ALBUMS);
  const [songsResults, setSongsResults] = useState<Song[]>(STARTER_SONGS);
  const [playlistsResults, setPlaylistsResults] = useState<Album[]>(STARTER_PLAYLISTS);
  const [selectedChartChip, setSelectedChartChip] = useState<string>(CHART_PLAYLIST_CHIPS[0]);

  // Loading & voice states
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Pagination states for loading all songs/albums related to search query
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Debounce user input by 400ms to eliminate redundant network requests
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Synchronize category tab and query from URL parameter if user navigates back or with ?tab=&q=
  useEffect(() => {
    const tabParam = searchParams.get('tab') as SearchCategory;
    if (tabParam && ['albums', 'songs', 'charts'].includes(tabParam)) {
      setSearchCategory(tabParam);
    }
    const qParam = searchParams.get('q');
    if (qParam !== null && qParam !== undefined) {
      setSearchTerm(qParam);
    }
  }, [searchParams]);

  // Persist latest non-empty search to sessionStorage so Back navigation always remembers
  useEffect(() => {
    if (typeof window !== 'undefined' && searchTerm.trim()) {
      try {
        sessionStorage.setItem(
          'sangeetham_last_search',
          JSON.stringify({ query: searchTerm.trim(), tab: searchCategory })
        );
      } catch (e) {
        // ignore
      }
    }
  }, [searchTerm, searchCategory]);

  // Main search effect based on current category and debounced query
  useEffect(() => {
    let active = true;

    if (!debouncedSearch.trim()) {
      setIsSearching(false);
      setPage(1);
      setHasMore(false);
      if (searchCategory === 'albums') {
        setAlbumsResults(STARTER_ALBUMS);
      } else if (searchCategory === 'songs') {
        setSongsResults(STARTER_SONGS);
      } else if (searchCategory === 'charts') {
        setPlaylistsResults(STARTER_PLAYLISTS);
      }
      return;
    }

    setIsSearching(true);
    setPage(1);
    setHasMore(true);

    if (searchCategory === 'albums') {
      searchAlbums(debouncedSearch, 1, 20)
        .then((albums) => {
          if (active) {
            setAlbumsResults(albums);
            setHasMore(albums.length >= 20);
            setIsSearching(false);
          }
        })
        .catch(() => {
          if (active) {
            setAlbumsResults(STARTER_ALBUMS);
            setHasMore(false);
            setIsSearching(false);
          }
        });
    } else if (searchCategory === 'songs') {
      searchSongs(debouncedSearch, 1, 20)
        .then((songs) => {
          if (active) {
            setSongsResults(songs);
            setHasMore(songs.length >= 20);
            setIsSearching(false);
          }
        })
        .catch(() => {
          if (active) {
            setHasMore(false);
            setIsSearching(false);
          }
        });
    } else if (searchCategory === 'charts') {
      searchPlaylists(debouncedSearch, 1, 20)
        .then((playlists) => {
          if (active) {
            setPlaylistsResults(playlists);
            setHasMore(playlists.length >= 20);
            setIsSearching(false);
          }
        })
        .catch(() => {
          if (active) {
            setPlaylistsResults(STARTER_PLAYLISTS);
            setHasMore(false);
            setIsSearching(false);
          }
        });
    }

    return () => {
      active = false;
    };
  }, [debouncedSearch, searchCategory]);

  // Load more handler to fetch next pages and append results
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      if (searchCategory === 'albums') {
        const query = debouncedSearch.trim();
        if (!query) {
          setIsLoadingMore(false);
          setHasMore(false);
          return;
        }
        const moreAlbums = await searchAlbums(query, nextPage, 20);
        if (!moreAlbums || moreAlbums.length === 0) {
          setHasMore(false);
        } else {
          setAlbumsResults((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const unique = moreAlbums.filter((a) => !existingIds.has(a.id));
            return [...prev, ...unique];
          });
          setPage(nextPage);
          if (moreAlbums.length < 20) {
            setHasMore(false);
          }
        }
      } else if (searchCategory === 'songs') {
        const query = debouncedSearch.trim();
        if (!query) {
          setIsLoadingMore(false);
          setHasMore(false);
          return;
        }
        const moreSongs = await searchSongs(query, nextPage, 20);
        if (!moreSongs || moreSongs.length === 0) {
          setHasMore(false);
        } else {
          setSongsResults((prev) => {
            const existingIds = new Set(prev.map((s) => s.id));
            const unique = moreSongs.filter((s) => !existingIds.has(s.id));
            return [...prev, ...unique];
          });
          setPage(nextPage);
          if (moreSongs.length < 20) {
            setHasMore(false);
          }
        }
      } else if (searchCategory === 'charts') {
        const query = debouncedSearch.trim() || selectedChartChip;
        const morePlaylists = await searchPlaylists(query, nextPage, 20);
        if (!morePlaylists || morePlaylists.length === 0) {
          setHasMore(false);
        } else {
          setPlaylistsResults((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const unique = morePlaylists.filter((p) => !existingIds.has(p.id));
            return [...prev, ...unique];
          });
          setPage(nextPage);
          if (morePlaylists.length < 20) {
            setHasMore(false);
          }
        }
      }
    } catch (err) {
      console.warn('Load more error:', err);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Load playlists & charts when switching or selecting chart chips in Charts tab
  useEffect(() => {
    if (searchCategory === 'charts' && !searchTerm.trim()) {
      let active = true;
      setIsSearching(true);

      searchPlaylists(selectedChartChip)
        .then((playlists) => {
          if (active) {
            setPlaylistsResults(playlists);
            setIsSearching(false);
          }
        })
        .catch(() => {
          if (active) {
            setPlaylistsResults(STARTER_PLAYLISTS);
            setIsSearching(false);
          }
        });

      return () => {
        active = false;
      };
    }
  }, [selectedChartChip, searchCategory, searchTerm]);

  // 1-Click play entire album from card overlay
  const handlePlayAlbum = async (e: React.MouseEvent, album: Album) => {
    e.preventDefault();
    e.stopPropagation();

    if (album.songs && album.songs.length > 0) {
      playSong(album.songs[0], album.songs);
      return;
    }

    try {
      const fullAlbum = await getAlbumDetails(album.id);
      if (fullAlbum && fullAlbum.songs && fullAlbum.songs.length > 0) {
        playSong(fullAlbum.songs[0], fullAlbum.songs);
      }
    } catch (err) {
      console.warn('Could not auto-play album:', err);
    }
  };

  // Open Interactive ChatGPT-Style Voice Search Modal
  const handleVoiceSearch = () => {
    openVoiceSearch();
  };

  const renderLoadMoreButton = () => {
    const count =
      searchCategory === 'albums'
        ? albumsResults.length
        : searchCategory === 'songs'
        ? songsResults.length
        : playlistsResults.length;

    if (count === 0) return null;

    if (hasMore) {
      return (
        <div className="search-load-more-wrap">
          <button
            type="button"
            className="search-load-more-btn"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            aria-label={`Load more ${searchCategory}`}
          >
            {isLoadingMore ? (
              <>
                <Loader2 size={18} className="spin-loader" />
                <span>Loading more {searchCategory}...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} className="text-pink" />
                <span>
                  Load More {searchCategory === 'albums' ? 'Albums' : searchCategory === 'songs' ? 'Songs' : 'Playlists'}
                </span>
              </>
            )}
          </button>
        </div>
      );
    }

    if (searchTerm.trim() && count > 0) {
      return (
        <div className="search-end-of-results">
          <span>✓ All {count} {searchCategory} loaded</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="search-view-container">
      {/* Search Input Box */}
      <div className="search-hero-box">
        <h1 className="search-title">Discover Music & Albums</h1>
        <p className="search-desc">
          Search full albums, soundtrack collections, top tracks, and curated charts
        </p>

        <div className="search-input-wrapper">
          <Search size={20} className="search-input-icon text-muted" />
          <input
            type="text"
            className="search-input-field"
            placeholder={
              searchCategory === 'albums'
                ? 'Search albums (e.g. Ala Vaikunthapurramuloo, Jawan, Pushpa, Animal)...'
                : searchCategory === 'songs'
                ? 'Search songs or artist name...'
                : 'Search charts or curated playlists...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
          <button
            className={`search-voice-btn ${isListening ? 'listening-pulse' : ''}`}
            onClick={handleVoiceSearch}
            title="Voice Search"
          >
            <Mic size={18} />
          </button>
        </div>

        {/* Category Filter Tabs: ALBUMS 1ST, SONGS 2ND, CHARTS 3RD */}
        <div className="search-categories-bar" role="tablist">
          <button
            role="tab"
            aria-selected={searchCategory === 'albums'}
            className={`search-category-btn ${searchCategory === 'albums' ? 'active' : ''}`}
            onClick={() => setSearchCategory('albums')}
          >
            <Disc size={17} />
            <span>1. Albums</span>
            <span className="category-badge">
              {searchTerm.trim() ? albumsResults.length : STARTER_ALBUMS.length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={searchCategory === 'songs'}
            className={`search-category-btn ${searchCategory === 'songs' ? 'active' : ''}`}
            onClick={() => setSearchCategory('songs')}
          >
            <Music size={17} />
            <span>2. Songs</span>
            {searchTerm.trim() && (
              <span className="category-badge">{songsResults.length}</span>
            )}
          </button>

          <button
            role="tab"
            aria-selected={searchCategory === 'charts'}
            className={`search-category-btn ${searchCategory === 'charts' ? 'active' : ''}`}
            onClick={() => setSearchCategory('charts')}
          >
            <Radio size={17} />
            <span>3. Charts & Playlists</span>
            <span className="category-badge">
              {searchTerm.trim() ? playlistsResults.length : STARTER_PLAYLISTS.length}
            </span>
          </button>
        </div>

        {/* Suggestion Chips according to active tab */}
        <div className="search-chips-row">
          {searchCategory === 'albums' &&
            POPULAR_ALBUM_CHIPS.map((chip) => (
              <button
                key={chip}
                className="search-chip"
                onClick={() => setSearchTerm(chip)}
              >
                💿 {chip}
              </button>
            ))}

          {searchCategory === 'songs' &&
            POPULAR_SONG_CHIPS.map((chip) => (
              <button
                key={chip}
                className="search-chip"
                onClick={() => setSearchTerm(chip)}
              >
                🎵 {chip}
              </button>
            ))}

          {searchCategory === 'charts' &&
            CHART_PLAYLIST_CHIPS.map((chip) => (
              <button
                key={chip}
                className={`search-chip ${selectedChartChip === chip ? 'active' : ''}`}
                onClick={() => {
                  setSelectedChartChip(chip);
                  setSearchTerm('');
                }}
              >
                📻 {chip}
              </button>
            ))}
        </div>
      </div>

      {/* Results View */}
      <div className="search-results-section">
        {/* Loading Indicator */}
        {isSearching && (
          <div className="loading-state-container">
            <Loader2 size={32} className="spin-loader text-pink" />
            <p>
              {searchCategory === 'albums'
                ? 'Searching full albums...'
                : searchCategory === 'songs'
                ? 'Searching song tracks...'
                : 'Searching charts & curated playlists...'}
            </p>
          </div>
        )}

        {/* 1. ALBUMS TAB (FIRST) */}
        {!isSearching && searchCategory === 'albums' && (
          <div>
            <div className="search-section-header">
              <h2 className="search-section-title">
                <Disc size={22} className="text-pink" />
                <span>
                  {searchTerm.trim()
                    ? `Album Results for "${searchTerm}"`
                    : 'Featured & Trending Albums (Click to View Album)'}
                </span>
              </h2>
              <span className="search-section-count">{albumsResults.length} Albums</span>
            </div>

            {albumsResults.length === 0 ? (
              <div className="empty-results-state">
                <Disc size={44} className="text-muted" />
                <p>No albums found for "{searchTerm}". Try searching in Songs tab.</p>
                <button
                  className="search-category-btn active"
                  style={{ marginTop: 12 }}
                  onClick={() => setSearchCategory('songs')}
                >
                  <Music size={16} /> Switch to Songs Search
                </button>
              </div>
            ) : (
              <div className="album-cards-grid">
                {albumsResults.map((album) => (
                  <Link
                    key={album.id}
                    href={`/album?id=${album.id}&from=search&q=${encodeURIComponent(searchTerm)}&tab=albums`}
                    className="album-card-link"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="album-card-item">
                      <div className="album-card-img-wrapper">
                        <img
                          src={album.cover}
                          alt={album.title}
                          className="album-card-img"
                          loading="lazy"
                        />
                        <div className="album-card-badge">
                          <Disc size={12} />
                          <span>{album.songs ? album.songs.length : album.songCount} Songs</span>
                        </div>
                        <button
                          className="album-card-play-overlay"
                          onClick={(e) => handlePlayAlbum(e, album)}
                          title={`Play ${album.title} Album`}
                          aria-label={`Play ${album.title}`}
                        >
                          <Play size={20} fill="#fff" />
                        </button>
                      </div>

                      <div className="album-card-meta">
                        <h3 className="album-card-title" title={album.title}>
                          {album.title}
                        </h3>
                        <p className="album-card-artists" title={album.artists}>
                          {album.artists}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span className="album-card-year">
                            {album.year || '2024'} • {album.language || 'Music'}
                          </span>
                          <button
                            className="share-btn-inline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const origin = typeof window !== 'undefined' ? window.location.origin : '';
                              openShareModal({
                                title: album.title,
                                subtitle: `${album.artists} • ${album.year || '2024'}`,
                                url: `${origin}/album?id=${album.id}&title=${encodeURIComponent(album.title)}`,
                                image: album.cover,
                                type: 'album'
                              });
                            }}
                            title="Share Album"
                          >
                            <Share2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {renderLoadMoreButton()}
          </div>
        )}

        {/* 2. SONGS TAB (SECOND) */}
        {!isSearching && searchCategory === 'songs' && (
          <div>
            <div className="search-section-header">
              <h2 className="search-section-title">
                <Music size={22} className="text-pink" />
                <span>
                  {searchTerm.trim()
                    ? `Song Results for "${searchTerm}"`
                    : 'Popular & Trending Tracks'}
                </span>
              </h2>
              <span className="search-section-count">{songsResults.length} Tracks</span>
            </div>

            {songsResults.length === 0 ? (
              <div className="empty-results-state">
                <Music size={44} className="text-muted" />
                <p>No songs found for "{searchTerm}". Try another keyword or artist name.</p>
              </div>
            ) : (
              <div className="search-results-list">
                {songsResults.map((song) => {
                  const isFav = isFavorite(song.id);
                  const isCurrent = currentSong?.id === song.id;

                  return (
                    <div
                      key={song.id}
                      className={`search-result-row ${isCurrent ? 'active-row' : ''}`}
                      onClick={() => playSong(song, songsResults)}
                    >
                      <div className="result-thumb-wrap" style={{ position: 'relative' }}>
                        <img
                          src={song.image}
                          alt={song.name}
                          className="result-thumb"
                          loading="lazy"
                        />
                        <QualityBadge song={song} size="sm" className="thumb-quality-badge" />
                        <div className="result-play-overlay">
                          <Play size={16} fill="#fff" />
                        </div>
                      </div>

                      <div className="result-info">
                        <h3 className="result-title">{song.name}</h3>
                        <p className="result-artist">{song.artist}</p>
                        <span className="result-album">{song.album}</span>
                      </div>

                      <div className="result-actions" onClick={(e) => e.stopPropagation()}>
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
                              subtitle: `${song.artist} • ${song.album}`,
                              url: `${origin}/player?songId=${song.id}&song=${encodeURIComponent(song.name)}`,
                              image: song.image,
                              type: 'song'
                            });
                          }}
                          title="Share Song"
                        >
                          <Share2 size={16} />
                        </button>

                        <button
                          className={`fav-btn-action ${isFav ? 'is-fav' : ''}`}
                          onClick={() => toggleFavorite(song)}
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart
                            size={18}
                            fill={isFav ? '#ff3b30' : 'none'}
                            color={isFav ? '#ff3b30' : 'currentColor'}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {renderLoadMoreButton()}
          </div>
        )}

        {/* 3. CHARTS & PLAYLISTS TAB (ALBUM KIND OF VIEW) */}
        {!isSearching && searchCategory === 'charts' && (
          <div>
            <div className="search-section-header">
              <h2 className="search-section-title">
                <Radio size={22} className="text-pink" />
                <span>
                  {searchTerm.trim()
                    ? `Playlist & Chart Results for "${searchTerm}"`
                    : selectedChartChip
                    ? `Curated Playlists for "${selectedChartChip}"`
                    : 'Featured Charts & Curated Playlists (Click to View Album)'}
                </span>
              </h2>
              <span className="search-section-count">{playlistsResults.length} Playlists</span>
            </div>

            {playlistsResults.length === 0 ? (
              <div className="empty-results-state">
                <Radio size={44} className="text-muted" />
                <p>No playlists found for "{searchTerm || selectedChartChip}".</p>
                <button
                  className="search-category-btn active"
                  style={{ marginTop: 12 }}
                  onClick={() => setSearchCategory('songs')}
                >
                  <Music size={16} /> Switch to Songs Search
                </button>
              </div>
            ) : (
              <div className="album-cards-grid">
                {playlistsResults.map((playlist) => (
                  <Link
                    key={playlist.id}
                    href={`/album?id=${playlist.id}&from=search&q=${encodeURIComponent(searchTerm || selectedChartChip)}&tab=charts`}
                    className="album-card-link"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="album-card-item playlist-card-item">
                      <div className="album-card-img-wrapper">
                        <img
                          src={playlist.cover}
                          alt={playlist.title}
                          className="album-card-img"
                          loading="lazy"
                        />
                        <div className="album-card-badge">
                          <Radio size={12} />
                          <span>{playlist.songs ? playlist.songs.length : playlist.songCount} Tracks</span>
                        </div>
                        <button
                          className="album-card-play-overlay"
                          onClick={(e) => handlePlayAlbum(e, playlist)}
                          title={`Play ${playlist.title} Playlist`}
                          aria-label={`Play ${playlist.title}`}
                        >
                          <Play size={20} fill="#fff" />
                        </button>
                      </div>

                      <div className="album-card-meta">
                        <h3 className="album-card-title" title={playlist.title}>
                          {playlist.title}
                        </h3>
                        <p className="album-card-artists" title={playlist.artists}>
                          {playlist.artists}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span className="album-card-year">
                            {playlist.language || 'Curated'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              className="share-btn-inline"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                                openShareModal({
                                  title: playlist.title,
                                  subtitle: `${playlist.artists} • ${playlist.year || '2024'}`,
                                  url: `${origin}/album?id=${playlist.id}&title=${encodeURIComponent(playlist.title)}`,
                                  image: playlist.cover,
                                  type: 'album'
                                });
                              }}
                              title="Share Playlist"
                            >
                              <Share2 size={14} />
                            </button>
                            <span className="album-card-year" style={{ color: 'var(--accent-pink)', fontWeight: 700, fontSize: '0.78rem' }}>
                              PLAYLIST
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {renderLoadMoreButton()}
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import type { Song, Album } from '../../types/music';
import { useMusic } from '../../context/MusicContext';
import { Play, Music, Disc, Radio, Loader2, ArrowLeft, Mic, X, MoreVertical, Sparkles } from 'lucide-react';
import {
  searchSongs,
  searchAlbums,
  searchPlaylists,
  getAlbumDetails,
  decodeHTMLEntities
} from '../../services/sangeethamApi';

interface CarSearchResultsProps {
  initialResults?: Song[];
  initialQuery?: string;
  onSongSelected?: (song: Song) => void;
  onBack?: () => void;
  onMicTap?: () => void;
}

type FilterTab = 'all' | 'songs' | 'albums' | 'artists' | 'playlists';

export const CarSearchResults: React.FC<CarSearchResultsProps> = ({
  initialResults = [],
  initialQuery = 'Play Arijit Singh songs',
  onSongSelected,
  onBack,
  onMicTap
}) => {
  const { playSong, currentSong } = useMusic();
  const [searchTerm, setSearchTerm] = useState<string>(initialQuery);
  const [results, setResults] = useState<Song[]>(initialResults);
  const [albumResults, setAlbumResults] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Perform search based on query and active category filter
  const performSearch = async (query: string, filter: FilterTab, targetPage = 1) => {
    if (!query.trim()) return;
    if (targetPage === 1) {
      setIsLoading(true);
      setPage(1);
      setHasMore(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      if (filter === 'albums') {
        const found = await searchAlbums(query, targetPage, 20);
        if (targetPage === 1) {
          setAlbumResults(found);
        } else {
          setAlbumResults((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const unique = found.filter((a) => !existingIds.has(a.id));
            return [...prev, ...unique];
          });
        }
        setPage(targetPage);
        setHasMore(found.length >= 20);
      } else if (filter === 'playlists') {
        const found = await searchPlaylists(query, targetPage, 20);
        if (targetPage === 1) {
          setAlbumResults(found);
        } else {
          setAlbumResults((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const unique = found.filter((a) => !existingIds.has(a.id));
            return [...prev, ...unique];
          });
        }
        setPage(targetPage);
        setHasMore(found.length >= 20);
      } else {
        // 'all', 'songs', 'artists'
        const found = await searchSongs(query, targetPage, 20);
        if (targetPage === 1) {
          setResults(found);
        } else {
          setResults((prev) => {
            const existingIds = new Set(prev.map((s) => s.id));
            const unique = found.filter((s) => !existingIds.has(s.id));
            return [...prev, ...unique];
          });
        }
        setPage(targetPage);
        setHasMore(found.length >= 20);
      }
    } catch {
      if (targetPage === 1) {
        if (filter === 'albums' || filter === 'playlists') {
          setAlbumResults([]);
        } else {
          setResults([]);
        }
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Re-run search if initialQuery changes
  useEffect(() => {
    if (initialQuery && initialQuery !== searchTerm) {
      setSearchTerm(initialQuery);
      performSearch(initialQuery, activeFilter, 1);
    }
  }, [initialQuery]);

  // When filter tab changes, run search for that category if search term exists
  const handleFilterChange = (newFilter: FilterTab) => {
    setActiveFilter(newFilter);
    if (searchTerm.trim()) {
      performSearch(searchTerm, newFilter, 1);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performSearch(searchTerm, activeFilter, 1);
  };

  // Load next page of songs or albums
  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore || !searchTerm.trim()) return;
    performSearch(searchTerm, activeFilter, page + 1);
  };

  const handlePlaySong = (song: Song) => {
    playSong(song, results.length > 0 ? results : undefined);
    if (onSongSelected) onSongSelected(song);
  };

  const handlePlayAlbum = async (album: Album) => {
    try {
      if (album.songs && album.songs.length > 0) {
        playSong(album.songs[0], album.songs);
        if (onSongSelected) onSongSelected(album.songs[0]);
        return;
      }
      setIsLoading(true);
      const detailed = await getAlbumDetails(album.id);
      if (detailed && detailed.songs && detailed.songs.length > 0) {
        playSong(detailed.songs[0], detailed.songs);
        if (onSongSelected) onSongSelected(detailed.songs[0]);
      }
    } catch (err) {
      console.warn('Could not play album:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isAlbumMode = activeFilter === 'albums' || activeFilter === 'playlists';
  const itemCount = isAlbumMode ? albumResults.length : results.length;

  return (
    <div className="car-search-screen3-view">
      {/* Top Search Input Pill (Screen 3: [ ← 🎤 Search Query ✕ ]) */}
      <div className="car-search-header-screen3">
        {onBack && (
          <button className="car-back-arrow-btn" onClick={onBack} aria-label="Back to player">
            <ArrowLeft size={24} />
          </button>
        )}

        <form className="car-search-pill-form" onSubmit={handleSearchSubmit}>
          <button
            type="button"
            className="car-search-mic-icon-btn"
            onClick={onMicTap}
            title="Voice Search"
            aria-label="Voice Search"
          >
            <Mic size={22} className="text-electric-blue" />
          </button>

          <input
            type="text"
            className="car-search-pill-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search songs, artists, albums..."
            aria-label="Search"
          />

          {searchTerm && (
            <button
              type="button"
              className="car-search-pill-clear"
              onClick={() => {
                setSearchTerm('');
                setResults([]);
                setAlbumResults([]);
                setHasMore(false);
              }}
              aria-label="Clear search text"
            >
              <X size={20} />
            </button>
          )}
        </form>
      </div>

      {/* Filter Chips Row matching Screen 3: All, Songs, Albums, Artists, Playlists */}
      <div className="car-filter-chips-row" role="tablist" aria-label="Search categories">
        {(['all', 'songs', 'albums', 'artists', 'playlists'] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            className={`car-filter-chip ${activeFilter === tab ? 'active' : ''}`}
            onClick={() => handleFilterChange(tab)}
            role="tab"
            aria-selected={activeFilter === tab}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Results List Cards matching Screen 3 */}
      <div className="car-search-results-list">
        {isLoading ? (
          <div className="car-search-loading">
            <Loader2 size={36} className="spin text-electric-blue" />
            <span>
              Searching {isAlbumMode ? 'full albums & collections' : 'road tracks'}...
            </span>
          </div>
        ) : isAlbumMode ? (
          albumResults.length > 0 ? (
            <div className="car-screen3-cards">
              {albumResults.map((album) => {
                const title = decodeHTMLEntities(album.title);
                const artists = decodeHTMLEntities(album.artists);

                return (
                  <div
                    key={album.id}
                    className="car-screen3-card"
                    onClick={() => handlePlayAlbum(album)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Play album ${title}`}
                  >
                    <div className="car-s3-cover-wrap">
                      {album.cover ? (
                        <img src={album.cover} alt={title} className="car-s3-cover" loading="lazy" />
                      ) : (
                        <div className="car-s3-placeholder">
                          {activeFilter === 'playlists' ? (
                            <Radio size={24} className="text-electric-blue" />
                          ) : (
                            <Disc size={24} className="text-electric-blue" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="car-s3-info">
                      <span className="car-s3-title">{title}</span>
                      <span className="car-s3-artist">
                        {artists} • {album.year || '2024'} • {album.songCount || (album.songs ? album.songs.length : 5)} Songs
                      </span>
                    </div>

                    <div className="car-s3-actions">
                      <button
                        className="car-s3-play-circle-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAlbum(album);
                        }}
                        title={`Play ${title}`}
                        aria-label={`Play ${title}`}
                      >
                        <Play size={20} className="fill-white offset-play" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Load More Button for Albums */}
              {hasMore ? (
                <div className="car-load-more-row">
                  <button
                    className="car-load-more-btn"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 size={20} className="spin text-electric-blue" />
                        <span>Loading more albums...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} className="text-electric-blue" />
                        <span>Load More {activeFilter === 'playlists' ? 'Playlists' : 'Albums'}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="car-search-end-banner">
                  <span>✓ All {albumResults.length} {activeFilter} loaded</span>
                </div>
              )}
            </div>
          ) : (
            <div className="car-search-empty">
              <Disc size={48} className="text-muted" />
              <p>No {activeFilter} found for &quot;{searchTerm}&quot;</p>
              <span>Try searching for Ala Vaikunthapurramuloo, Pushpa, or Animal</span>
            </div>
          )
        ) : results.length > 0 ? (
          <div className="car-screen3-cards">
            {results.map((song) => {
              const isCurrent = currentSong?.id === song.id;
              const name = decodeHTMLEntities(song.name);
              const artist = decodeHTMLEntities(song.artist);
              const album = decodeHTMLEntities(song.album || '');

              return (
                <div
                  key={song.id}
                  className={`car-screen3-card ${isCurrent ? 'active' : ''}`}
                  onClick={() => handlePlaySong(song)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Play ${name}`}
                >
                  <div className="car-s3-cover-wrap">
                    {song.image ? (
                      <img src={song.image} alt={name} className="car-s3-cover" loading="lazy" />
                    ) : (
                      <div className="car-s3-placeholder">
                        <Music size={24} className="text-electric-blue" />
                      </div>
                    )}
                  </div>

                  <div className="car-s3-info">
                    <span className="car-s3-title">{name}</span>
                    <span className="car-s3-artist">
                      {artist} {album ? `• ${album}` : ''}
                    </span>
                  </div>

                  <div className="car-s3-actions">
                    <button
                      className="car-s3-play-circle-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySong(song);
                      }}
                      title="Play song"
                      aria-label="Play song"
                    >
                      <Play size={20} className="fill-white offset-play" />
                    </button>

                    <button
                      className="car-s3-more-btn"
                      onClick={(e) => e.stopPropagation()}
                      title="More options"
                      aria-label="More options"
                    >
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Load More Button for Songs */}
            {hasMore ? (
              <div className="car-load-more-row">
                <button
                  className="car-load-more-btn"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={20} className="spin text-electric-blue" />
                      <span>Loading more tracks...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} className="text-electric-blue" />
                      <span>Load More Songs</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="car-search-end-banner">
                <span>✓ All {results.length} songs loaded</span>
              </div>
            )}
          </div>
        ) : (
          <div className="car-search-empty">
            <Music size={48} className="text-muted" />
            <p>No results found for &quot;{searchTerm}&quot;</p>
            <span>Try searching for Arijit Singh, Kesariya, or Telugu songs</span>
          </div>
        )}
      </div>
    </div>
  );
};

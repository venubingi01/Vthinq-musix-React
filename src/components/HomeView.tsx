'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMusic } from '../context/MusicContext';
import type { Song, Album } from '../types/music';
import {
  fetchTopCharts,
  fetchTeluguSongs,
  fetchHindiSongs,
  fetchDevotionalSongs,
  STARTER_SONGS,
  TELUGU_SONGS,
  HINDI_SONGS,
  DEVOTIONAL_SONGS,
  STARTER_ALBUMS
} from '../services/saavnApi';
import {
  Play,
  Flame,
  Disc,
  Radio,
  Sparkles,
  Music,
  Compass,
  Loader2,
  ChevronRight
} from 'lucide-react';

const GENRE_CHIPS = [
  'SP Balasubramanyam telugu hits',
  'HSK 50 Most Popular Hindi Songs',
  'Anirudh Ravichander hits',
  'Arijit Singh romantic',
  'Sid Sriram melody'
];

export const HomeView: React.FC = () => {
  const { playSong, currentSong, isPlaying, togglePlay } = useMusic();

  // Feeds state
  const [selectedChip, setSelectedChip] = useState<string>(GENRE_CHIPS[0]);
  const [chipSongs, setChipSongs] = useState<Song[]>(STARTER_SONGS);
  const [isLoadingChip, setIsLoadingChip] = useState<boolean>(false);

  const [teluguSongs, setTeluguSongs] = useState<Song[]>(TELUGU_SONGS);
  const [hindiSongs, setHindiSongs] = useState<Song[]>(HINDI_SONGS);
  const [devotionalSongs, setDevotionalSongs] = useState<Song[]>(DEVOTIONAL_SONGS);
  const [albums] = useState<Album[]>(STARTER_ALBUMS);

  // Load Top Charts on chip change
  useEffect(() => {
    let active = true;
    setIsLoadingChip(true);

    fetchTopCharts(selectedChip)
      .then((songs) => {
        if (active) {
          setChipSongs(songs);
          setIsLoadingChip(false);
        }
      })
      .catch(() => {
        if (active) {
          setChipSongs(STARTER_SONGS);
          setIsLoadingChip(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedChip]);

  // Load Category Feeds on initial mount
  useEffect(() => {
    let active = true;

    fetchTeluguSongs().then((songs) => {
      if (active && songs.length > 0) setTeluguSongs(songs);
    });

    fetchHindiSongs().then((songs) => {
      if (active && songs.length > 0) setHindiSongs(songs);
    });

    fetchDevotionalSongs().then((songs) => {
      if (active && songs.length > 0) setDevotionalSongs(songs);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="home-view-container">
      {/* Hero Banner with Featured Track */}
      {/* <section className="hero-banner">
        <div className="hero-content">
          <span className="hero-badge">Featured Audio Stream</span>
          <h1 className="hero-title">Sangeetham AI Music Player</h1>
          <p className="hero-subtitle">
            Experience high-fidelity streaming with synchronized karaoke lyrics, 5-band studio equalizer, and Spotify Canvas video looper.
          </p>
          <div className="hero-actions">
            <button
              className="hero-play-btn"
              onClick={() => {
                if (currentSong) {
                  togglePlay();
                } else if (chipSongs[0]) {
                  playSong(chipSongs[0], chipSongs);
                }
              }}
            >
              <Play size={18} fill="currentColor" />
              <span>{isPlaying ? 'Pause Track' : 'Play Featured Hits'}</span>
            </button>
            <Link href="/search" className="hero-secondary-btn" style={{ textDecoration: 'none' }}>
              <Compass size={18} />
              <span>Explore Songs</span>
            </Link>
          </div>
        </div>
      </section> */}


      {/* 2. Telugu Section */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <Flame className="section-icon text-orange" size={22} />
            <h2>Telugu Chartbusters & Melodies</h2>
          </div>
          <Link href="/search" className="section-view-more" style={{ textDecoration: 'none' }}>
            <span>View More</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="song-cards-grid">
          {teluguSongs.map((song) => {
            const isThisPlaying = currentSong?.id === song.id && isPlaying;
            return (
              <div
                key={song.id}
                className={`song-card ${currentSong?.id === song.id ? 'active-song-card' : ''}`}
                onClick={() => playSong(song, teluguSongs)}
                role="button"
                tabIndex={0}
              >
                <div className="song-card-img-wrap">
                  <img src={song.image} alt={song.name} className="song-card-img" loading="lazy" />
                  <div className={`card-play-overlay ${isThisPlaying ? 'always-visible' : ''}`}>
                    <Play size={20} fill="#fff" />
                  </div>
                </div>
                <div className="song-card-meta">
                  <h3 className="card-song-title" title={song.name}>
                    {song.name}
                  </h3>
                  <p className="card-song-artist" title={song.artist}>
                    {song.artist}
                  </p>
                  <span className="card-song-album">{song.album}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Hindi / Bollywood Section */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <Sparkles className="section-icon text-pink" size={22} />
            <h2>Bollywood & Hindi Hits</h2>
          </div>
          <Link href="/search" className="section-view-more" style={{ textDecoration: 'none' }}>
            <span>View More</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="song-cards-grid">
          {hindiSongs.map((song) => {
            const isThisPlaying = currentSong?.id === song.id && isPlaying;
            return (
              <div
                key={song.id}
                className={`song-card ${currentSong?.id === song.id ? 'active-song-card' : ''}`}
                onClick={() => playSong(song, hindiSongs)}
                role="button"
                tabIndex={0}
              >
                <div className="song-card-img-wrap">
                  <img src={song.image} alt={song.name} className="song-card-img" loading="lazy" />
                  <div className={`card-play-overlay ${isThisPlaying ? 'always-visible' : ''}`}>
                    <Play size={20} fill="#fff" />
                  </div>
                </div>
                <div className="song-card-meta">
                  <h3 className="card-song-title" title={song.name}>
                    {song.name}
                  </h3>
                  <p className="card-song-artist" title={song.artist}>
                    {song.artist}
                  </p>
                  <span className="card-song-album">{song.album}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 1. Top Charts Section with Filter Chips */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <Disc className="section-icon text-pink" size={22} />
            <h2>Top Charts & Curated Mixes</h2>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="genre-chips-scroll">
          {GENRE_CHIPS.map((chip) => (
            <button
              key={chip}
              className={`genre-chip ${selectedChip === chip ? 'active' : ''}`}
              onClick={() => setSelectedChip(chip)}
            >
              <Radio size={14} className="chip-icon" />
              <span>{chip}</span>
            </button>
          ))}
        </div>

        {/* Songs Grid */}
        {isLoadingChip ? (
          <div className="loading-state-container">
            <Loader2 size={32} className="spin-loader text-pink" />
            <p>Fetching top chart songs...</p>
          </div>
        ) : (
          <div className="song-cards-grid">
            {chipSongs.slice(0, 8).map((song) => {
              const isThisPlaying = currentSong?.id === song.id && isPlaying;
              return (
                <div
                  key={song.id}
                  className={`song-card ${currentSong?.id === song.id ? 'active-song-card' : ''}`}
                  onClick={() => playSong(song, chipSongs)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="song-card-img-wrap">
                    <img src={song.image} alt={song.name} className="song-card-img" loading="lazy" />
                    <div className={`card-play-overlay ${isThisPlaying ? 'always-visible' : ''}`}>
                      <Play size={20} fill="#fff" />
                    </div>
                  </div>
                  <div className="song-card-meta">
                    <h3 className="card-song-title" title={song.name}>
                      {song.name}
                    </h3>
                    <p className="card-song-artist" title={song.artist}>
                      {song.artist}
                    </p>
                    <span className="card-song-album">{song.album}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Devotional & Spiritual Section */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <span className="devotional-om-icon">🪔</span>
            <h2>Devotional & Spiritual Melodies</h2>
          </div>
          <Link href="/search" className="section-view-more" style={{ textDecoration: 'none' }}>
            <span>View More</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="song-cards-grid">
          {devotionalSongs.map((song) => {
            const isThisPlaying = currentSong?.id === song.id && isPlaying;
            return (
              <div
                key={song.id}
                className={`song-card devotional-song-card ${currentSong?.id === song.id ? 'active-song-card' : ''}`}
                onClick={() => playSong(song, devotionalSongs)}
                role="button"
                tabIndex={0}
              >
                <div className="song-card-img-wrap">
                  <img src={song.image} alt={song.name} className="song-card-img" loading="lazy" />
                  <div className={`card-play-overlay ${isThisPlaying ? 'always-visible' : ''}`}>
                    <Play size={20} fill="#fff" />
                  </div>
                </div>
                <div className="song-card-meta">
                  <h3 className="card-song-title" title={song.name}>
                    {song.name}
                  </h3>
                  <p className="card-song-artist" title={song.artist}>
                    {song.artist}
                  </p>
                  <span className="card-song-album">{song.album}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Trending Albums Section (Links to Album View) */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <Disc className="section-icon text-pink" size={22} />
            <h2>Trending Albums</h2>
          </div>
          <Link href="/search?tab=albums" className="section-view-more" style={{ textDecoration: 'none' }}>
            <span>Browse All Albums</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="album-cards-grid">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/album/${album.id}`}
              className="album-card-link"
              style={{ textDecoration: 'none' }}
            >
              <div className="album-card-item">
                <div className="album-card-img-wrapper">
                  <img src={album.cover} alt={album.title} className="album-card-img" loading="lazy" />
                  <div className="album-card-badge">
                    <Music size={12} />
                    <span>{album.songs ? album.songs.length : album.songCount} Songs</span>
                  </div>
                  <div className="album-card-play-overlay">
                    <Play size={22} fill="#fff" />
                  </div>
                </div>
                <div className="album-card-meta">
                  <h3 className="album-card-title" title={album.title}>
                    {album.title}
                  </h3>
                  <p className="album-card-artists" title={album.artists}>
                    {album.artists}
                  </p>
                  <span className="album-card-year">{album.year} • {album.language}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

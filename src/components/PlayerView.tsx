'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useMusic } from '../context/MusicContext';
import { searchMusicVideo } from '../services/videoService';
import { fetchLyrics, isPlainLyrics } from '../services/lyricsService';
import { Visualizer } from './Visualizer';
import { LyricalVisualizer } from './LyricalVisualizer';
import { FullscreenVideoModal } from './FullscreenVideoModal';
import { QueueModal } from './QueueModal';
import type { TimedLyric } from '../types/music';
import {
  Heart,
  Expand,
  Video,
  Image as ImageIcon,
  Sliders,
  ListMusic,
  Zap,
  Loader2,
  Quote,
  Music2,
  Share2,
  Sparkles
} from 'lucide-react';

export const PlayerView: React.FC = () => {
  const {
    currentSong,
    currentTime,
    isPlaying,
    seek,
    toggleFavorite,
    isFavorite,
    openShareModal,
    openFullscreenVisualizer
  } = useMusic();

  // Video & View states (defaults to visualizer with synced lyrical video)
  const [videoMode, setVideoMode] = useState<'canvas' | 'cover' | 'visualizer'>('visualizer');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [isFullscreenVideoOpen, setIsFullscreenVideoOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [mobileSection, setMobileSection] = useState<'video' | 'lyrics'>('video');

  // Video canvas iframe reference for bidirectional postMessage control
  const canvasIframeRef = useRef<HTMLIFrameElement | null>(null);
  const lastTimeRef = useRef<number>(currentTime);

  // Lyrics states
  const [lyrics, setLyrics] = useState<TimedLyric[]>([]);
  const [isLyricsLoading, setIsLyricsLoading] = useState<boolean>(false);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch Music Video ID whenever song changes
  useEffect(() => {
    if (!currentSong) return;

    let isMounted = true;
    setIsVideoLoading(true);

    searchMusicVideo(currentSong.id, currentSong.name, currentSong.artist)
      .then((id) => {
        if (isMounted) {
          setVideoId(id);
          setIsVideoLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsVideoLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentSong?.id]);

  // 2. Fetch Synced Lyrics whenever song changes
  useEffect(() => {
    if (!currentSong) return;

    let isMounted = true;
    setIsLyricsLoading(true);

    fetchLyrics(currentSong.name, currentSong.artist)
      .then((data) => {
        if (isMounted) {
          setLyrics(data);
          setIsLyricsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLyricsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentSong?.id]);

  const isPlain = isPlainLyrics(lyrics);

  // Calculate active lyric index based on audio currentTime (only for synced lyrics)
  let activeIndex = -1;
  if (!isPlain) {
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        activeIndex = i;
        break;
      }
    }
  }

  // Autoscroll active lyric line (only for synced lyrics)
  useEffect(() => {
    if (!isPlain && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex, isPlain]);

  // 3. Synchronize YouTube Canvas video play/pause with audio playback state
  useEffect(() => {
    const iframe = canvasIframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    try {
      const command = isPlaying ? 'playVideo' : 'pauseVideo';
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }),
        '*'
      );
    } catch (err) {
      console.warn('Canvas video sync note:', err);
    }
  }, [isPlaying]);

  // 4. Synchronize YouTube Canvas timeline when audio is seeked
  useEffect(() => {
    const iframe = canvasIframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    const diff = Math.abs(currentTime - lastTimeRef.current);
    if (diff > 1.5) {
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [currentTime, true] }),
          '*'
        );
      } catch {
        // ignore
      }
    }
    lastTimeRef.current = currentTime;
  }, [currentTime]);

  const handleIframeLoad = () => {
    const iframe = canvasIframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    // Immediately pause video if audio is paused upon iframe load
    if (!isPlaying) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
        '*'
      );
    }
    if (currentTime > 0) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [currentTime, true] }),
        '*'
      );
    }
  };

  if (!currentSong) {
    return (
      <div className="player-empty-state">
        <Music2 size={48} className="text-muted" />
        <p>No track currently playing. Pick a song to start.</p>
      </div>
    );
  }

  const isFav = isFavorite(currentSong.id);
  const canvasEmbedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${isPlaying ? '1' : '0'}&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1&rel=0&enablejsapi=1`
    : '';

  const handleShareSong = () => {
    if (!currentSong) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    openShareModal({
      title: currentSong.name,
      subtitle: `${currentSong.artist} • ${currentSong.album}`,
      url: `${origin}/player?songId=${currentSong.id}&song=${encodeURIComponent(currentSong.name)}`,
      image: currentSong.image,
      type: 'song'
    });
  };

  const handleShareLyrics = () => {
    if (!currentSong) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    openShareModal({
      title: `${currentSong.name} (Live Lyrics)`,
      subtitle: `${currentSong.artist} • Synced Karaoke`,
      url: `${origin}/player?tab=lyrics&songId=${currentSong.id}&song=${encodeURIComponent(currentSong.name)}`,
      image: currentSong.image,
      type: 'lyrics'
    });
  };

  return (
    <div className="player-view-wrapper">
      {/* Background ambient album cover blur */}
      <div
        className="player-ambient-bg"
        style={{ backgroundImage: `url(${currentSong.image})` }}
      />

      {/* Mobile Segmented Switcher (for classic split view) */}
      {videoMode !== 'visualizer' && (
        <div className="mobile-player-segments">
          <button
            className={`seg-btn ${mobileSection === 'video' ? 'active' : ''}`}
            onClick={() => setMobileSection('video')}
          >
            <Video size={16} />
            <span>Song & Video</span>
          </button>
          <button
            className={`seg-btn ${mobileSection === 'lyrics' ? 'active' : ''}`}
            onClick={() => setMobileSection('lyrics')}
          >
            <Quote size={16} />
            <span>Synced Lyrics</span>
          </button>
        </div>
      )}

      {/* Main Player Display: Visualizer Stage OR Split View */}
      {videoMode === 'visualizer' ? (
        <div className="player-visualizer-stage-box">
          <LyricalVisualizer
            lyrics={lyrics}
            showMediaCard={true}
            onToggleFullscreen={openFullscreenVisualizer}
          />
          <div className="visualizer-stage-mode-bar">
            <div className="canvas-mode-toggles">
              <button
                className="canvas-mode-btn active"
                onClick={() => setVideoMode('visualizer')}
                title="Audio Visualizer & Synced Lyrics"
              >
                <Sparkles size={14} />
                <span>Visualizer</span>
              </button>
              <button
                className="canvas-mode-btn"
                onClick={() => setVideoMode('canvas')}
                title="Video Song Mode"
              >
                <Video size={14} />
                <span>Video Song</span>
              </button>
              <button
                className="canvas-mode-btn"
                onClick={() => setVideoMode('cover')}
                title="Album Cover Art Mode"
              >
                <ImageIcon size={14} />
                <span>Cover Art</span>
              </button>
            </div>
          </div>

          {/* Track Details & HD Badges underneath Visualizer Stage */}
          <div className="player-metadata-block visualizer-stage-meta">
            <div className="player-track-titles">
              <h1 className="player-song-title" title={currentSong.name}>
                {currentSong.name}
              </h1>
              <p className="player-artist-name">{currentSong.artist}</p>
              <span className="player-album-badge">{currentSong.album}</span>
            </div>

            <div className="player-badges-row">
              <span className="hd-studio-badge">
                <Zap size={13} /> ULTRA HD 320kbps
              </span>
            </div>

            {/* Quick Action Toolbar */}
            <div className="player-action-toolbar">
              <button
                className={`player-tool-btn ${isFav ? 'is-fav' : ''}`}
                onClick={() => toggleFavorite(currentSong)}
                title="Favorite"
              >
                <Heart
                  size={18}
                  fill={isFav ? '#ff3b30' : 'none'}
                  color={isFav ? '#ff3b30' : 'currentColor'}
                />
                <span>{isFav ? 'Liked' : 'Favorite'}</span>
              </button>

              <button
                className="player-tool-btn"
                onClick={() => setIsQueueOpen(true)}
                title="Current Queue"
              >
                <ListMusic size={18} />
                <span>Queue</span>
              </button>

              <Link
                href="/equalizer"
                className="player-tool-btn"
                title="Equalizer & 3D Audio"
                style={{ textDecoration: 'none' }}
              >
                <Sliders size={18} />
                <span>EQ & 3D</span>
              </Link>

              <button
                className="player-tool-btn"
                onClick={openFullscreenVisualizer}
                title="Fullscreen Particle Visualizer"
              >
                <Sparkles size={18} className="text-orange sparkle-icon" />
                <span>Visualizer</span>
              </button>

              <button
                className="player-tool-btn"
                onClick={handleShareSong}
                title="Share Song"
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="player-split-layout">
          {/* Left Column: Canvas Video / Cover Art & Controls */}
          <section
            className={`player-left-panel ${mobileSection === 'lyrics' ? 'mobile-hidden' : ''}`}
          >
            <div className="media-display-card">
              {videoMode === 'canvas' && videoId ? (
                <div className="canvas-video-container">
                  {isVideoLoading && (
                    <div className="video-loading-badge">
                      <Loader2 size={24} className="spin-loader text-pink" />
                      <span>Loading Video Canvas...</span>
                    </div>
                  )}
                  <iframe
                    ref={canvasIframeRef}
                    src={canvasEmbedUrl}
                    title="Canvas Music Video"
                    className="canvas-iframe"
                    allow="autoplay; encrypted-media"
                    onLoad={handleIframeLoad}
                  />
                  <div className="canvas-gradient-overlay" />
                </div>
              ) : (
                <div className="cover-art-container">
                  <div className="cover-glow-backdrop" style={{ backgroundImage: `url(${currentSong.image})` }} />
                  <img
                    src={currentSong.image}
                    alt={currentSong.name}
                    className="cover-art-large"
                  />
                </div>
              )}

              {/* Top Canvas HUD overlay */}
              <div className="canvas-top-bar">
                <div className="canvas-mode-toggles">
                  <button
                    className="canvas-mode-btn"
                    onClick={() => setVideoMode('visualizer')}
                    title="Audio Visualizer & Synced Lyrics"
                  >
                    <Sparkles size={14} />
                    <span>Visualizer</span>
                  </button>
                  <button
                    className={`canvas-mode-btn ${videoMode === 'canvas' ? 'active' : ''}`}
                    onClick={() => setVideoMode('canvas')}
                    title="Video Song Mode"
                  >
                    <Video size={14} />
                    <span>Video Song</span>
                  </button>
                  <button
                    className={`canvas-mode-btn ${videoMode === 'cover' ? 'active' : ''}`}
                    onClick={() => setVideoMode('cover')}
                    title="Album Cover Art Mode"
                  >
                    <ImageIcon size={14} />
                    <span>Cover Art</span>
                  </button>
                </div>

                {videoId && (
                  <button
                    className="canvas-fs-btn"
                    onClick={() => setIsFullscreenVideoOpen(true)}
                    title="Watch Fullscreen Music Video"
                  >
                    <Expand size={15} />
                    <span>Watch Video</span>
                  </button>
                )}
              </div>
            </div>

            {/* Track Details & HD Badges */}
            <div className="player-metadata-block">
              <div className="player-track-titles">
                <h1 className="player-song-title" title={currentSong.name}>
                  {currentSong.name}
                </h1>
                <p className="player-artist-name">{currentSong.artist}</p>
                <span className="player-album-badge">{currentSong.album}</span>
              </div>

              <div className="player-badges-row">
                <span className="hd-studio-badge">
                  <Zap size={13} /> ULTRA HD 320kbps
                </span>
                <div
                  className="mini-visualizer-wrap"
                  onClick={() => setVideoMode('visualizer')}
                  title="Switch to Lyrical Visualizer"
                  style={{ cursor: 'pointer' }}
                >
                  <Visualizer height={20} />
                </div>
              </div>

              {/* Quick Action Toolbar */}
              <div className="player-action-toolbar">
                <button
                  className={`player-tool-btn ${isFav ? 'is-fav' : ''}`}
                  onClick={() => toggleFavorite(currentSong)}
                  title="Favorite"
                >
                  <Heart
                    size={18}
                    fill={isFav ? '#ff3b30' : 'none'}
                    color={isFav ? '#ff3b30' : 'currentColor'}
                  />
                  <span>{isFav ? 'Liked' : 'Favorite'}</span>
                </button>

                <button
                  className="player-tool-btn"
                  onClick={() => setIsQueueOpen(true)}
                  title="Current Queue"
                >
                  <ListMusic size={18} />
                  <span>Queue</span>
                </button>

                <Link
                  href="/equalizer"
                  className="player-tool-btn"
                  title="Equalizer & 3D Audio"
                  style={{ textDecoration: 'none' }}
                >
                  <Sliders size={18} />
                  <span>EQ & 3D</span>
                </Link>

                <button
                  className="player-tool-btn"
                  onClick={openFullscreenVisualizer}
                  title="Fullscreen Particle Visualizer"
                >
                  <Sparkles size={18} className="text-orange sparkle-icon" />
                  <span>Visualizer</span>
                </button>

                <button
                  className="player-tool-btn"
                  onClick={handleShareSong}
                  title="Share Song"
                >
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </section>

          {/* Right Column: Synced Karaoke Lyrics */}
          <section
            className={`player-right-panel ${mobileSection === 'video' ? 'mobile-hidden' : ''}`}
          >
            <div className="lyrics-panel-header">
              <div className="lyrics-header-title">
                <Quote size={20} className="text-pink" />
                <h2>{isPlain ? 'Lyrics' : 'Live Synced Lyrics'}</h2>
              </div>
              <button
                className="share-lyrics-btn"
                onClick={handleShareLyrics}
                title="Share Live Lyrics"
              >
                <Share2 size={14} />
                <span>Share Lyrics</span>
              </button>
            </div>

            {isLyricsLoading ? (
              <div className="lyrics-loading-state">
                <Loader2 size={32} className="spin-loader text-pink" />
                <p>{isPlain ? 'Loading lyrics...' : 'Syncing karaoke lyrics...'}</p>
              </div>
            ) : lyrics.length === 0 ? (
              <div className="lyrics-empty-placeholder">
                <p className="lyrics-empty-title">{currentSong?.name}</p>
                {currentSong?.artist && <p className="lyrics-empty-artist">{currentSong.artist}</p>}
                <p className="lyrics-empty-notice">Lyrics not available for this track</p>
              </div>
            ) : isPlain ? (
              <div className="plain-lyrics-scroll-box custom-scrollbar">
                {lyrics.map((line, index) => (
                  <p key={`pv-plain-${index}`} className="plain-lyric-line">
                    {line.text}
                  </p>
                ))}
              </div>
            ) : (
              <div className="lyrics-scroll-box">
                {lyrics.map((line, index) => {
                  const isActive = index === activeIndex;
                  const isPast = index < activeIndex;

                  return (
                    <div
                      key={`${line.time}-${index}`}
                      ref={isActive ? activeLineRef : null}
                      className={`karaoke-line ${isActive ? 'active-line' : ''} ${isPast ? 'past-line' : ''}`}
                      onClick={() => seek(line.time)}
                      title="Tap to seek to this line"
                    >
                      <span className="karaoke-text">{line.text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Fullscreen Video Overlay */}
      <FullscreenVideoModal
        isOpen={isFullscreenVideoOpen}
        onClose={() => setIsFullscreenVideoOpen(false)}
        song={currentSong}
        videoId={videoId}
      />

      {/* Playlist Queue Drawer Modal */}
      <QueueModal isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </div>
  );
};

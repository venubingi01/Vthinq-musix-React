'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMusic } from '../../context/MusicContext';
import { fetchLyrics, isPlainLyrics } from '../../services/lyricsService';
import type { TimedLyric, Song } from '../../types/music';
import {
  Heart,
  Shuffle,
  Repeat,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  MoreVertical,
  Volume2,
  Sliders,
  ListMusic,
  Quote,
  Sparkles,
  BarChart2,
  Video,
  Radio,
  Music2,
  Eye,
  RotateCcw,
  Share2,
  X,
  Check,
  Disc,
  ListPlus
} from 'lucide-react';
import { Visualizer } from '../Visualizer';
import { LyricalVisualizer } from '../LyricalVisualizer';
import { FullscreenVideoModal } from '../FullscreenVideoModal';
import { searchMusicVideo } from '../../services/videoService';
import '../../styles/mobile-player.css';
import { Footer } from '../Footer';
import { QualityBadge } from '../QualityBadge';
import { EqualizerView } from '../EqualizerView';

export type MobileTab = 'now-playing' | 'lyrics' | 'video' | 'equalizer' | 'queue';
export type VisualizerMode = 'spectrum' | 'waveform' | 'particles' | 'circle';
export type LyricsMode = 'plain' | 'karaoke' | 'fulltext';

interface MobilePlayerViewProps {
  initialTab?: MobileTab;
  onClose?: () => void;
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const EQ_PRESETS = [
  { name: 'Default', gains: [0, 0, 0, 0, 0] },
  { name: 'Pop', gains: [-1, 2, 5, 3, 1] },
  { name: 'Rock', gains: [5, 3, -1, 3, 5] },
  { name: 'Classic', gains: [4, 2, 0, 2, 4] },
  { name: 'Vocal', gains: [-2, 1, 6, 4, 1] }
];

const BAND_FREQS = ['60Hz', '230Hz', '910Hz', '3.6kHz', '14kHz'];

export const MobilePlayerView: React.FC<MobilePlayerViewProps> = ({
  initialTab = 'now-playing',
  onClose
}) => {
  const {
    currentSong,
    playlist,
    isPlaying,
    currentTime,
    duration,
    seek,
    togglePlay,
    nextSong,
    prevSong,
    isShuffle,
    toggleShuffle,
    isLoop,
    toggleLoop,
    toggleFavorite,
    isFavorite,
    openShareModal,
    openFullscreenVisualizer,
    openAddToPlaylistModal,
    goToAlbum,
    eqGains,
    setEqBand,
    applyEqPreset,
    bassBoost,
    setBassBoost,
    spatial3D,
    setSpatial3D,
    analyserNode,
    playSong,
    lyrics,
    streamQuality
  } = useMusic();

  // Active view state
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MobileTab>(initialTab);

  // Sub-modes
  const [lyricsMode, setLyricsMode] = useState<LyricsMode>('karaoke');
  const [eqSubTab, setEqSubTab] = useState<'equalizer' | 'effects'>('equalizer');
  const [queueSubTab, setQueueSubTab] = useState<'queue' | 'playlist'>('queue');
  const [fontSizeScale, setFontSizeScale] = useState<number>(1);

  // Audio Effects local toggles
  const [vocalClarity, setVocalClarity] = useState<boolean>(true);
  const [nightMode, setNightMode] = useState<boolean>(false);

  // Video states
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);

  // Auto-open fullscreen lyrics if navigated with lyrics tab
  useEffect(() => {
    if (initialTab === 'lyrics') {
      openFullscreenVisualizer();
    }
  }, [initialTab]);

  // Fetch Music Video ID whenever song changes (clear immediately to prevent showing old video)
  useEffect(() => {
    setVideoId(null);
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
        if (isMounted) setIsVideoLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentSong?.id]);

  const handleWatchVideo = async () => {
    if (!videoId && currentSong) {
      setIsVideoLoading(true);
      try {
        const id = await searchMusicVideo(currentSong.id, currentSong.name, currentSong.artist);
        setVideoId(id);
      } catch (err) {
        console.warn('Video search failed:', err);
      } finally {
        setIsVideoLoading(false);
      }
    }
    setIsVideoModalOpen(true);
  };

  // Active lyric index state (lyrics provided centrally by useMusic)
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(-1);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // Radial Visualizer Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset active lyric index when currentSong changes
  useEffect(() => {
    setActiveLyricIndex(-1);
  }, [currentSong?.id]);

  // Compute active lyric line
  useEffect(() => {
    if (lyrics.length === 0) return;
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    setActiveLyricIndex(idx);
  }, [currentTime, lyrics]);

  // Auto-scroll lyrics active line
  useEffect(() => {
    if (activeLyricIndex >= 0 && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLyricIndex]);



  if (!currentSong) return null;

  const isFav = isFavorite(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleShare = async () => {
    if (!currentSong) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/player?songId=${currentSong.id}&song=${encodeURIComponent(currentSong.name)}`;
    const shareTitle = `${currentSong.name} - Sangeetham AI Music Player`;
    const shareText = `Listen to "${currentSong.name}" by ${currentSong.artist} on Sangeetham AI Music Player! 🎶`;

    // Try native share sheet on mobile devices (iOS Safari, Android Chrome)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return;
        }
      }
    }

    // Fallback to our custom share modal (WhatsApp, Telegram, X, Facebook, Email, Copy Link)
    openShareModal({
      title: currentSong.name,
      subtitle: `${currentSong.artist} • ${currentSong.album}`,
      url: shareUrl,
      image: currentSong.image,
      type: 'song'
    });
  };

  const handleResetEq = () => {
    applyEqPreset([0, 0, 0, 0, 0]);
    setBassBoost(0);
    setSpatial3D(false);
  };

  const handleCloseOrBack = () => {
    if (onClose) {
      onClose();
    } else if (activeTab !== 'now-playing') {
      setActiveTab('now-playing');
    } else {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
      } else {
        router.push('/');
      }
    }
  };

  // Active streaming quality details for mobile
  const songQuality = (currentSong.quality || '').toLowerCase();
  const songUrl = (currentSong.url || '').toLowerCase();
  const is160Quality =
    streamQuality === '160' ||
    songQuality.includes('160') ||
    (songUrl.includes('_160') && !songUrl.includes('_320'));
  const is96Quality =
    !is160Quality &&
    (streamQuality === '96' ||
      songQuality.includes('96') ||
      songQuality.includes('48') ||
      (songUrl.includes('_96') && !songUrl.includes('_320')));
  const qualityPropValue = is160Quality ? '160kbps' : is96Quality ? '96kbps' : '320kbps';

  return (
    <div className="mobile-player-shell">
      {/* Background ambient album cover blur */}
      <div
        className="mobile-player-ambient-blur"
        style={{ backgroundImage: `url(${currentSong.image})` }}
      />

      {/* Top App Bar Header */}
      <div className="mobile-top-header">
        {activeTab === 'equalizer' || activeTab === 'queue' || activeTab === 'lyrics' ? (
          <button
            className="mobile-header-back-btn"
            onClick={() => setActiveTab('now-playing')}
            aria-label="Back to player"
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <Link href="/" className="brand-logo" style={{ textDecoration: 'none' }}>
            <div className="logo-icon-wrapper">
              <Music2 className="logo-icon" size={20} />
            </div>
            <div className="logo-text">
              <span className="logo-title">Sangeetham</span>
              <span className="logo-badge">AI Music Player</span>
            </div>
          </Link>
        )}

        <div className="mobile-header-actions">
          <button
            className="mobile-header-icon-btn"
            onClick={handleCloseOrBack}
            title="Close / Back"
            aria-label="Close / Back"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ===================================================================
          SCREEN 1: NOW PLAYING (EXPANDED)
          =================================================================== */}
      {activeTab === 'now-playing' && (
        <div className="mobile-nowplaying-card">
          {/* Centered Large Album Art with glowing frame */}
          <div className="mobile-artwork-container" style={{ position: 'relative' }}>
            <img
              src={currentSong.image}
              alt={currentSong.name}
              className="mobile-artwork-img"
            />
            <QualityBadge
              song={currentSong}
              quality={qualityPropValue}
              size="md"
              className="mobile-cover-quality-badge"
            />
          </div>

          {/* Track Details & Inline Heart */}
          <div className="mobile-track-info-row">
            <div className="mobile-track-text-group">
              <h1 className="mobile-song-title" title={currentSong.name}>
                {currentSong.name}
              </h1>
              <p className="mobile-artist-name">{currentSong.artist}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="mobile-header-icon-btn"
                onClick={() => goToAlbum(currentSong)}
                title={`Go to Album: ${currentSong.album}`}
                aria-label="Go to Album"
                style={{ width: '38px', height: '38px' }}
              >
                <Disc size={20} />
              </button>

              <button
                className="mobile-header-icon-btn"
                onClick={() => openAddToPlaylistModal(currentSong)}
                title="Add to Playlist"
                aria-label="Add to Playlist"
                style={{ width: '38px', height: '38px' }}
              >
                <ListPlus size={20} />
              </button>

              <button
                className={`mobile-heart-btn ${isFav ? 'is-fav' : ''}`}
                onClick={() => toggleFavorite(currentSong)}
                aria-label="Favorite button"
              >
                <Heart size={22} fill={isFav ? '#ff3366' : 'none'} color={isFav ? '#ff3366' : 'currentColor'} />
              </button>
            </div>
          </div>

          {/* Scrubber Seek Bar with 1:24 left and 5:32 right */}
          <div className="mobile-scrubber-section">
            <div className="mobile-slider-track-wrap">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="mobile-seek-slider"
                style={{
                  background: `linear-gradient(to right, #ff2d75 ${progressPercent}%, rgba(255, 255, 255, 0.16) ${progressPercent}%)`
                }}
                aria-label="Seek track"
              />
            </div>
            <div className="mobile-timestamps-row">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Controls: Shuffle, Prev, Huge Circular Play/Pause, Next, Repeat */}
          <div className="mobile-controls-row">
            <button
              className={`mobile-ctrl-btn ${isShuffle ? 'active-toggle' : ''}`}
              onClick={toggleShuffle}
              aria-label="Shuffle"
            >
              <Shuffle size={20} />
            </button>
            <button className="mobile-ctrl-btn" onClick={prevSong} aria-label="Previous">
              <SkipBack size={26} />
            </button>
            <button
              className="mobile-play-circle-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="play-offset" />}
            </button>
            <button className="mobile-ctrl-btn" onClick={nextSong} aria-label="Next">
              <SkipForward size={26} />
            </button>
            <button
              className={`mobile-ctrl-btn ${isLoop ? 'active-toggle' : ''}`}
              onClick={toggleLoop}
              aria-label="Repeat"
            >
              <Repeat size={20} />
            </button>
          </div>

          {/* Bottom Reactive Spectrum Visualizer matching desktop animation */}


        </div>
      )}

      {/* ===================================================================
          SCREEN 2: LYRICS VIEW (Existing Large Screen Lyrics Page in Full Screen View)
          =================================================================== */}
      {activeTab === 'lyrics' && (
        <div className="mobile-lyrics-existing-stage">
          <LyricalVisualizer
            lyrics={lyrics}
            showMediaCard={true}
            onToggleFullscreen={openFullscreenVisualizer}
          />
        </div>
      )}



      {/* ===================================================================
          SCREEN 4: STUDIO EQUALIZER, 3D SPATIAL AUDIO & AUDIO QUALITY
          =================================================================== */}
      {activeTab === 'equalizer' && (
        <div className="mobile-equalizer-embedded-container" style={{ flex: 1, overflowY: 'auto', padding: '0 4px 80px' }}>
          <EqualizerView isEmbedded={true} onBack={() => setActiveTab('now-playing')} />
        </div>
      )}

      {/* ===================================================================
          SCREEN 5: QUEUE / PLAYLIST
          =================================================================== */}
      {activeTab === 'queue' && (
        <div className="mobile-queue-view-body">
          {/* Segmented Switcher: [ Queue | Playlist ] */}
          <div className="mobile-segmented-bar">
            <button
              className={`mobile-seg-btn ${queueSubTab === 'queue' ? 'active' : ''}`}
              onClick={() => setQueueSubTab('queue')}
            >
              Queue
            </button>
            <button
              className={`mobile-seg-btn ${queueSubTab === 'playlist' ? 'active' : ''}`}
              onClick={() => setQueueSubTab('playlist')}
            >
              Playlist
            </button>
          </div>

          <div className="mobile-queue-list-scroll">
            {/* Active Playing Song Highlighted Card with sound wave bars */}
            <div className="mobile-queue-card-active">
              <div className="mobile-q-left">
                <img
                  src={currentSong.image}
                  alt={currentSong.name}
                  className="q-thumb"
                />
                <div className="mobile-q-meta">
                  <span className="mobile-q-title">{currentSong.name}</span>
                  <span className="mobile-q-artist">{currentSong.artist}</span>
                </div>
              </div>
              <Volume2 size={18} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </div>

            {/* Queue List of Upcoming Songs */}
            {playlist
              .filter((s) => s.id !== currentSong.id)
              .map((song) => (
                <div
                  key={song.id}
                  className="mobile-queue-item"
                  onClick={() => playSong(song, playlist)}
                >
                  <div className="mobile-q-left">
                    <img src={song.image} alt={song.name} className="q-thumb" />
                    <div className="mobile-q-meta">
                      <span className="mobile-q-title">{song.name}</span>
                      <span className="mobile-q-artist">{song.artist}</span>
                    </div>
                  </div>
                  <MoreVertical size={16} color="rgba(255, 255, 255, 0.4)" />
                </div>
              ))}
          </div>

          {/* Sticky Bottom Mini Player */}
          <div
            className="mobile-sticky-mini-player"
            onClick={() => setActiveTab('now-playing')}
          >
            <div className="mobile-q-left">
              <img src={currentSong.image} alt={currentSong.name} className="q-thumb" />
              <div className="mobile-q-meta">
                <span className="mobile-q-title">{currentSong.name}</span>
                <span className="mobile-q-artist">{currentSong.artist}</span>
              </div>
            </div>
            <button
              className="mobile-mini-play-btn"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          Bottom Player Tab Navigation (Lyrics, Watch Video, Equalizer, Queue)
          =================================================================== */}
      <div className="mobile-bottom-nav-tabs">
        <button
          className="mobile-nav-tab-btn"
          onClick={() => openFullscreenVisualizer()}
          title="Fullscreen Live Lyrics"
          aria-label="Lyrics Fullscreen"
        >
          <Quote size={20} />
          <span>Lyrics</span>
        </button>

        <button
          className="mobile-nav-tab-btn"
          onClick={handleWatchVideo}
          title="Watch Music Video"
          aria-label="Watch Music Video"
        >
          <Video size={20} />
          <span>Watch Video</span>
        </button>

        <button
          className={`mobile-nav-tab-btn ${activeTab === 'equalizer' ? 'active' : ''}`}
          onClick={() => setActiveTab('equalizer')}
          title="Studio Equalizer & 3D Audio"
          aria-label="Equalizer"
        >
          <Sliders size={20} />
          <span>Equalizer</span>
        </button>

        <button
          className="mobile-nav-tab-btn"
          onClick={handleShare}
          title="Share Song"
          aria-label="Share Song"
        >
          <Share2 size={20} />
          <span>Share</span>
        </button>

        <button
          className={`mobile-nav-tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
          aria-label="Queue"
        >
          <ListMusic size={20} />
          <span>Queue</span>
        </button>
      </div>

      {/* Fullscreen Music Video Modal */}
      <FullscreenVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        song={currentSong}
        videoId={videoId}
      />
    </div>
  );
};

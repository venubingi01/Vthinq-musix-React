'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMusic } from '../../context/MusicContext';
import {
  VoiceRecognitionService,
  speakVoiceFeedback,
  ParsedVoiceCommand,
  parseVoiceCommand,
  VoiceStatus,
  VoiceServiceState
} from '../../services/voiceCommandService';
import { searchSongs } from '../../services/sangeethamApi';
import { processAIChatMessage } from '../../services/aiOrchestratorService';
import type { Song } from '../../types/music';

import { CarHeader } from './CarHeader';
import { CarHeroPlayer } from './CarHeroPlayer';
import { CarVisualizerStyle } from './CarVisualizer';
import { CarVisualizerStylesView } from './CarVisualizerStylesView';
import { CarLyricsView } from './CarLyricsView';
import { CarEqualizerModal, CAR_EQ_PRESETS } from './CarEqualizerModal';
import { CarSearchResults } from './CarSearchResults';
import { CarQueueView } from './CarQueueView';
import { CarFavoritesView } from './CarFavoritesView';
import { CarVoiceOverlay } from './CarVoiceOverlay';
import { CarFullscreenVisualizer } from './CarFullscreenVisualizer';
import { CarStatusBanner } from './CarStatusBanner';
import { FullscreenVideoModal } from '../FullscreenVideoModal';
import { searchMusicVideo } from '../../services/videoService';

import Link from 'next/link';
import {
  Home,
  Music2,
  Mic,
  PlayCircle,
  BarChart3,
  Quote,
  Sliders,
  ListMusic,
  Search,
  Heart,
  Sparkles,
  Video
} from 'lucide-react';
import '../../styles/car-mode.css';

export type CarNavTab = 'player' | 'visualizer' | 'lyrics' | 'equalizer' | 'queue' | 'search' | 'favorites';

export const CarModeView: React.FC = () => {
  const {
    currentSong,
    playSong,
    togglePlay,
    pauseSong,
    resumeSong,
    nextSong,
    prevSong,
    isPlaying,
    applyEqPreset,
    setBassBoost,
    setSpatial3D,
    setIsAiChatOpen
  } = useMusic();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<CarNavTab>('player');

  // Visualizer states
  const [visualizerStyle, setVisualizerStyle] = useState<CarVisualizerStyle>('bars');
  const [isVisualizerOn, setIsVisualizerOn] = useState<boolean>(true);
  const [isFullscreenVizOpen, setIsFullscreenVizOpen] = useState<boolean>(false);

  // Video State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);

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

  // Search states
  const [searchQuery, setSearchQuery] = useState<string>('Play Arijit Singh songs');
  const [searchResults, setSearchResults] = useState<Song[]>([]);

  // Voice Command states
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const voiceServiceRef = useRef<VoiceRecognitionService | null>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const displayStatus = useCallback((msg: string, status: VoiceStatus = 'success') => {
    setVoiceMessage(msg);
    setVoiceStatus(status);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setVoiceMessage(null);
      setVoiceStatus('idle');
    }, 4500);
  }, []);

  // Command executor
  const handleExecuteVoiceCommand = useCallback(
    async (cmd: ParsedVoiceCommand) => {
      setVoiceTranscript(cmd.rawTranscript);

      switch (cmd.type) {
        case 'next':
          nextSong();
          displayStatus('Skipped to next track ⏭️');
          break;

        case 'prev':
          prevSong();
          displayStatus('Playing previous track ⏮️');
          break;

        case 'pause':
          wasPlayingBeforeVoiceRef.current = false;
          if (isPlaying) {
            togglePlay();
            displayStatus('Playback paused ⏸️');
          } else {
            displayStatus('Music is already paused');
          }
          break;

        case 'resume':
          wasPlayingBeforeVoiceRef.current = true;
          resumeSongRef.current();
          displayStatus('Music playing ▶️');
          break;

        case 'show_visualizer':
          setIsVisualizerOn(true);
          setActiveTab('visualizer');
          displayStatus('Audio visualizer enabled 📊');
          if (wasPlayingBeforeVoiceRef.current) {
            resumeSongRef.current();
            wasPlayingBeforeVoiceRef.current = false;
          }
          break;

        case 'hide_visualizer':
          setIsVisualizerOn(false);
          displayStatus('Audio visualizer hidden');
          if (wasPlayingBeforeVoiceRef.current) {
            resumeSongRef.current();
            wasPlayingBeforeVoiceRef.current = false;
          }
          break;

        case 'change_visualizer':
          if (cmd.visualizerStyle) {
            setVisualizerStyle(cmd.visualizerStyle);
            setIsVisualizerOn(true);
            displayStatus(`Visualizer set to ${cmd.visualizerStyle} ✨`);
          }
          if (wasPlayingBeforeVoiceRef.current) {
            resumeSongRef.current();
            wasPlayingBeforeVoiceRef.current = false;
          }
          break;

        case 'open_equalizer':
          setActiveTab('equalizer');
          displayStatus('Equalizer opened 🎚️');
          if (wasPlayingBeforeVoiceRef.current) {
            resumeSongRef.current();
            wasPlayingBeforeVoiceRef.current = false;
          }
          break;

        case 'close_equalizer':
          setActiveTab('player');
          displayStatus('Equalizer closed');
          if (wasPlayingBeforeVoiceRef.current) {
            resumeSongRef.current();
            wasPlayingBeforeVoiceRef.current = false;
          }
          break;

        case 'reset_equalizer':
          applyEqPreset([0, 0, 0, 0, 0]);
          setBassBoost(0);
          setSpatial3D(false);
          displayStatus('Equalizer reset to Flat ⚖️');
          if (wasPlayingBeforeVoiceRef.current) {
            resumeSongRef.current();
            wasPlayingBeforeVoiceRef.current = false;
          }
          break;

        case 'set_eq_preset':
          if (cmd.preset) {
            const foundPreset = CAR_EQ_PRESETS.find(
              (p) => p.name.toLowerCase() === cmd.preset?.toLowerCase()
            );
            if (foundPreset) {
              applyEqPreset(foundPreset.gains);
              if (foundPreset.bassBoost !== undefined) {
                setBassBoost(foundPreset.bassBoost);
              }
              displayStatus(`Equalizer preset set to ${foundPreset.name} 🎵`);
            } else {
              displayStatus(`Preset "${cmd.preset}" not found`);
            }
          }
          if (wasPlayingBeforeVoiceRef.current) {
            resumeSongRef.current();
            wasPlayingBeforeVoiceRef.current = false;
          }
          break;

        case 'play_song':
          if (cmd.query) {
            displayStatus(`Searching for "${cmd.query}"...`, 'processing');
            try {
              const songs = await searchSongs(cmd.query, 1, 20);
              if (songs && songs.length > 0) {
                playSong(songs[0], songs);
                setActiveTab('player');
                displayStatus(`Now Playing: ${songs[0].name} 🎶`, 'success');
              } else {
                displayStatus(`No results found for "${cmd.query}". Try again.`, 'error');
                speakVoiceFeedback('No results found. Try again.');
              }
            } catch {
              displayStatus(`No results found for "${cmd.query}". Try again.`, 'error');
              speakVoiceFeedback('No results found. Try again.');
            }
          }
          break;

        case 'search':
          if (cmd.query) {
            displayStatus(`Searching for "${cmd.query}"...`, 'processing');
            try {
              const songs = await searchSongs(cmd.query, 1, 20);
              setSearchQuery(cmd.query);
              setSearchResults(songs);
              setActiveTab('search');
              if (songs.length > 0) {
                displayStatus(`Found ${songs.length} results for "${cmd.query}"`, 'success');
              } else {
                displayStatus(`No results found for "${cmd.query}". Try again.`, 'error');
                speakVoiceFeedback('No results found. Try again.');
              }
            } catch {
              displayStatus(`No results found for "${cmd.query}". Try again.`, 'error');
              speakVoiceFeedback('No results found. Try again.');
            }
          }
          break;

        default: {
          displayStatus(`Asking Sangeetham AI: "${cmd.rawTranscript}"...`, 'processing');
          try {
            const aiRes = await processAIChatMessage({
              message: cmd.rawTranscript,
              activeTrack: currentSongRef.current
                ? {
                    id: currentSongRef.current.id,
                    name: currentSongRef.current.name,
                    artist: currentSongRef.current.artist,
                    album: currentSongRef.current.album,
                    language: currentSongRef.current.language
                  }
                : undefined
            });

            if (aiRes.playbackCommand) {
              if (
                aiRes.playbackCommand.action === 'play' &&
                aiRes.generatedPlaylist &&
                aiRes.generatedPlaylist.songs.length > 0
              ) {
                playSong(aiRes.generatedPlaylist.songs[0], aiRes.generatedPlaylist.songs);
                displayStatus(`Playing ${aiRes.generatedPlaylist.title}`, 'success');
                speakVoiceFeedback(`Playing ${aiRes.generatedPlaylist.title}`);
                return;
              }
            }

            if (aiRes.generatedPlaylist && aiRes.generatedPlaylist.songs.length > 0) {
              playSong(aiRes.generatedPlaylist.songs[0], aiRes.generatedPlaylist.songs);
              displayStatus(`Playing: ${aiRes.generatedPlaylist.title}`, 'success');
              speakVoiceFeedback(`Now playing ${aiRes.generatedPlaylist.title}`);
              return;
            }

            if (aiRes.songFactSheet) {
              const brief = `${aiRes.songFactSheet.songTitle} is sung by ${aiRes.songFactSheet.singers.join(', ')} and composed by ${aiRes.songFactSheet.musicDirectors.join(', ')}.`;
              displayStatus(brief, 'success');
              speakVoiceFeedback(brief);
              if (wasPlayingBeforeVoiceRef.current) {
                setTimeout(() => resumeSongRef.current(), 4000);
                wasPlayingBeforeVoiceRef.current = false;
              }
              return;
            }

            const cleanReply = aiRes.replyText.replace(/[*_#`]/g, '').slice(0, 100);
            displayStatus(cleanReply, 'success');
            speakVoiceFeedback(cleanReply);
            if (wasPlayingBeforeVoiceRef.current) {
              setTimeout(() => resumeSongRef.current(), 3500);
              wasPlayingBeforeVoiceRef.current = false;
            }
          } catch {
            displayStatus(`Could not understand: "${cmd.rawTranscript}". Try again.`, 'error');
            speakVoiceFeedback('Could not understand. Try again.');
          }
          break;
        }
      }
    },
    [
      isPlaying,
      nextSong,
      prevSong,
      togglePlay,
      playSong,
      applyEqPreset,
      setBassBoost,
      setSpatial3D,
      displayStatus
    ]
  );

  // Stable refs for callbacks so VoiceRecognitionService is never torn down when playback state changes
  const handleExecuteVoiceCommandRef = useRef(handleExecuteVoiceCommand);
  handleExecuteVoiceCommandRef.current = handleExecuteVoiceCommand;

  const pauseSongRef = useRef(pauseSong);
  pauseSongRef.current = pauseSong;

  const resumeSongRef = useRef(resumeSong);
  resumeSongRef.current = resumeSong;

  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentSongRef = useRef(currentSong);
  currentSongRef.current = currentSong;

  // Track if a song was actively playing before voice search interrupted it
  const wasPlayingBeforeVoiceRef = useRef<boolean>(false);

  // Resume playback if voice search is cancelled, dismissed, or ends without play command
  const resumePlaybackIfPaused = useCallback(() => {
    if (wasPlayingBeforeVoiceRef.current || (currentSongRef.current && !isPlayingRef.current)) {
      resumeSongRef.current();
      wasPlayingBeforeVoiceRef.current = false;
    }
  }, []);

  // Initialize Voice Service ONCE on mount
  useEffect(() => {
    const handleVoiceState = (state: VoiceServiceState) => {
      setVoiceStatus(state.status);
      setVoiceTranscript(state.transcript);
      if (state.message) {
        setVoiceMessage(state.message);
      }
      // When voice command starts listening, immediately pause song
      if (state.status === 'listening') {
        if (isPlayingRef.current) {
          wasPlayingBeforeVoiceRef.current = true;
        }
        pauseSongRef.current();
      } else if (state.status === 'error' || state.status === 'permission_denied' || state.status === 'unsupported') {
        speakVoiceFeedback('No results found. Try again.');
        // Resume song if voice search errored or aborted without a command
        resumePlaybackIfPaused();
      }
    };

    const service = new VoiceRecognitionService(
      handleVoiceState,
      (cmd) => handleExecuteVoiceCommandRef.current(cmd),
      () => {
        if (isPlayingRef.current) {
          wasPlayingBeforeVoiceRef.current = true;
        }
        pauseSongRef.current();
      }
    );
    voiceServiceRef.current = service;

    return () => {
      service.stop();
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, [resumePlaybackIfPaused]);

  const handleVoiceTap = () => {
    if (voiceStatus === 'listening' || voiceStatus === 'processing') {
      // User tapped voice button again to cancel/stop active voice search
      voiceServiceRef.current?.stop();
      setVoiceStatus('idle');
      setVoiceMessage(null);
      setVoiceTranscript('');
      // If voice search cancelled, the song should play again if it is paused
      resumePlaybackIfPaused();
    } else {
      // Starting voice search: track if song is currently playing before pausing
      wasPlayingBeforeVoiceRef.current = isPlayingRef.current;
      pauseSong();
      setVoiceTranscript('');
      // Brief 50ms tick to let audio engine pause before mic engages hardware capture
      setTimeout(() => {
        voiceServiceRef.current?.startListening();
      }, 50);
    }
  };

  const handleCancelVoice = () => {
    voiceServiceRef.current?.stop();
    setVoiceStatus('idle');
    setVoiceMessage(null);
    setVoiceTranscript('');
    // If voice search cancelled, the song should play again if it is paused
    resumePlaybackIfPaused();
  };

  const handleQuickVoiceCommand = (text: string) => {
    voiceServiceRef.current?.stop();
    setVoiceStatus('processing');
    const parsed = parseVoiceCommand(text);
    handleExecuteVoiceCommand(parsed);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextSong();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevSong();
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        handleVoiceTap();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setActiveTab((prev) => (prev === 'lyrics' ? 'player' : 'lyrics'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextSong, prevSong, handleVoiceTap]);

  return (
    <div className="car-mode-root">
      {/* Top Infotainment Header */}
      <CarHeader />

      {/* Main Workspace Body: Left Sidebar Rail + Main View Area */}
      <div className="car-workspace-body">
        {/* Left Automotive Sidebar Rail matching reference board */}
        <aside className="car-sidebar-rail" aria-label="Car Navigation">
          <Link
            href="/"
            className="car-rail-item"
            title="Home"
            aria-label="Home"
            style={{ textDecoration: 'none' }}
          >
            <Home size={26} className="car-rail-icon" />
          </Link>

          <button
            className={`car-rail-item ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
            title="Music Search"
            aria-label="Search"
          >
            <Search size={26} className="car-rail-icon" />
          </button>

          <button
            className={`car-rail-item ${activeTab === 'player' ? 'active' : ''}`}
            onClick={() => setActiveTab('player')}
            title="Main Player"
            aria-label="Main Player"
          >
            <Music2 size={26} className="car-rail-icon" />
          </button>

          <button
            className="car-rail-item"
            onClick={handleWatchVideo}
            title="Watch Music Video"
            aria-label="Watch Video"
          >
            <Video size={26} className="car-rail-icon text-cyan" />
          </button>

          <button
            className={`car-rail-item ${activeTab === 'equalizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('equalizer')}
            title="Sound Settings & Equalizer"
            aria-label="Settings"
          >
            <Sliders size={26} className="car-rail-icon" />
          </button>

          <button
            className={`car-rail-item ${voiceStatus === 'listening' ? 'active' : ''}`}
            onClick={handleVoiceTap}
            title="Voice Search"
            aria-label="Voice Search"
          >
            <Mic size={26} className="car-rail-icon" />
          </button>

          <button
            className="car-rail-item car-rail-ai-btn"
            onClick={() => setIsAiChatOpen(true)}
            title="Ask AI Music Companion"
            aria-label="Ask AI"
          >
            <Sparkles size={26} className="car-rail-icon text-pink" />
          </button>
        </aside>

        {/* Central Stage View */}
        <main className={`car-stage-main ${activeTab === 'player' ? 'car-stage-dashboard-active' : ''}`}>
          {/* TAB 1: HERO PLAYER (Screen 6) */}
          {activeTab === 'player' && (
            <CarHeroPlayer
              visualizerStyle={visualizerStyle}
              isVisualizerOn={isVisualizerOn}
              voiceStatus={voiceStatus}
              onVoiceTap={handleVoiceTap}
              onOpenVisualizerStyles={() => setActiveTab('visualizer')}
              onOpenFullscreenVisualizer={() => setIsFullscreenVizOpen(true)}
              onOpenLyrics={() => setActiveTab('lyrics')}
              onOpenVideo={handleWatchVideo}
              onOpenEqualizer={() => setActiveTab('equalizer')}
              onOpenQueue={() => setActiveTab('queue')}
            />
          )}

          {/* TAB 2: VISUALIZER STYLES SELECTION (Screen 4) */}
          {activeTab === 'visualizer' && (
            <CarVisualizerStylesView
              currentStyle={visualizerStyle}
              onStyleSelect={(style) => {
                setVisualizerStyle(style);
                setIsVisualizerOn(true);
                displayStatus(`Set visualizer to ${style}`);
              }}
              isVisualizerOn={isVisualizerOn}
              onToggleVisualizer={() => setIsVisualizerOn(!isVisualizerOn)}
            />
          )}

          {/* TAB 3: SYNCED LYRICS VIEW */}
          {activeTab === 'lyrics' && (
            <CarLyricsView onClose={() => setActiveTab('player')} />
          )}

          {/* TAB 4: EQUALIZER CUSTOM BANDS & PRESETS (Screen 5) */}
          {activeTab === 'equalizer' && (
            <CarEqualizerModal isEmbedded={true} onBack={() => setActiveTab('player')} />
          )}

          {/* TAB 5: PLAYING NEXT QUEUE (Screen 8) */}
          {activeTab === 'queue' && (
            <CarQueueView onSongSelected={() => setActiveTab('player')} />
          )}

          {/* TAB 6: SEARCH RESULTS (Screen 3) */}
          {activeTab === 'search' && (
            <CarSearchResults
              initialQuery={searchQuery}
              initialResults={searchResults}
              onSongSelected={() => setActiveTab('player')}
              onBack={() => setActiveTab('player')}
              onMicTap={handleVoiceTap}
            />
          )}

          {/* TAB 7: FAVORITES */}
          {activeTab === 'favorites' && (
            <CarFavoritesView onSongSelected={() => setActiveTab('player')} />
          )}
        </main>
      </div>

      {/* Screen 2: Voice Search Listening Orb Overlay */}
      <CarVoiceOverlay
        status={voiceStatus}
        transcript={voiceTranscript}
        onCancel={handleCancelVoice}
        onQuickCommand={handleQuickVoiceCommand}
      />

      {/* Screen 7: Fullscreen Visualizer Modal */}
      <CarFullscreenVisualizer
        isOpen={isFullscreenVizOpen}
        onClose={() => setIsFullscreenVizOpen(false)}
        style={visualizerStyle}
      />

      {/* Status Feedback Banner */}
      <CarStatusBanner
        status={voiceStatus}
        message={voiceMessage}
        transcript={voiceTranscript}
        onDismiss={() => {
          setVoiceMessage(null);
          setVoiceStatus('idle');
        }}
        onCancelListening={handleCancelVoice}
      />

      {/* Fullscreen Video Modal with Mobile Rotate Mode */}
      <FullscreenVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        song={currentSong}
        videoId={videoId}
      />
    </div>
  );
};

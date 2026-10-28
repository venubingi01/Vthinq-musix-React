'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMusic } from '../../context/MusicContext';
import {
  VoiceRecognitionService,
  speakVoiceFeedback,
  ParsedVoiceCommand,
  VoiceStatus,
  VoiceServiceState
} from '../../services/voiceCommandService';
import { searchSongs } from '../../services/sangeethamApi';
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

import {
  PlayCircle,
  BarChart3,
  Quote,
  Sliders,
  ListMusic,
  Search,
  Heart
} from 'lucide-react';
import '../../styles/car-mode.css';

export type CarNavTab = 'player' | 'visualizer' | 'lyrics' | 'equalizer' | 'queue' | 'search' | 'favorites';

export const CarModeView: React.FC = () => {
  const {
    playSong,
    togglePlay,
    pauseSong,
    nextSong,
    prevSong,
    isPlaying,
    applyEqPreset,
    setBassBoost,
    setSpatial3D
  } = useMusic();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<CarNavTab>('player');

  // Visualizer states
  const [visualizerStyle, setVisualizerStyle] = useState<CarVisualizerStyle>('bars');
  const [isVisualizerOn, setIsVisualizerOn] = useState<boolean>(true);
  const [isFullscreenVizOpen, setIsFullscreenVizOpen] = useState<boolean>(false);

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
          if (isPlaying) {
            togglePlay();
            displayStatus('Playback paused ⏸️');
          } else {
            displayStatus('Music is already paused');
          }
          break;

        case 'resume':
          if (!isPlaying) {
            togglePlay();
            displayStatus('Music playing ▶️');
          } else {
            displayStatus('Music is already playing');
          }
          break;

        case 'show_visualizer':
          setIsVisualizerOn(true);
          setActiveTab('visualizer');
          displayStatus('Audio visualizer enabled 📊');
          break;

        case 'hide_visualizer':
          setIsVisualizerOn(false);
          displayStatus('Audio visualizer hidden');
          break;

        case 'change_visualizer':
          if (cmd.visualizerStyle) {
            setVisualizerStyle(cmd.visualizerStyle);
            setIsVisualizerOn(true);
            displayStatus(`Visualizer set to ${cmd.visualizerStyle} ✨`);
          }
          break;

        case 'open_equalizer':
          setActiveTab('equalizer');
          displayStatus('Equalizer opened 🎚️');
          break;

        case 'close_equalizer':
          setActiveTab('player');
          displayStatus('Equalizer closed');
          break;

        case 'reset_equalizer':
          applyEqPreset([0, 0, 0, 0, 0]);
          setBassBoost(0);
          setSpatial3D(false);
          displayStatus('Equalizer reset to Flat ⚖️');
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

        default:
          displayStatus(`Could not understand: "${cmd.rawTranscript}". Try again.`, 'error');
          speakVoiceFeedback('Could not understand. Try again.');
          break;
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
        pauseSongRef.current();
      } else if (state.status === 'error') {
        speakVoiceFeedback('No results found. Try again.');
      }
    };

    const service = new VoiceRecognitionService(
      handleVoiceState,
      (cmd) => handleExecuteVoiceCommandRef.current(cmd),
      () => pauseSongRef.current()
    );
    voiceServiceRef.current = service;

    return () => {
      service.stop();
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  const handleVoiceTap = () => {
    if (voiceStatus === 'listening' || voiceStatus === 'processing') {
      voiceServiceRef.current?.stop();
      setVoiceStatus('idle');
      setVoiceMessage(null);
      setVoiceTranscript('');
    } else {
      // Pause song immediately when voice command is clicked
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
  };

  const handleQuickVoiceCommand = (text: string) => {
    voiceServiceRef.current?.stop();
    setVoiceStatus('processing');
    handleExecuteVoiceCommand({
      type: 'play_song',
      query: text.replace(/^play\s+/i, ''),
      rawTranscript: text
    });
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
          <button
            className={`car-rail-item ${activeTab === 'player' ? 'active' : ''}`}
            onClick={() => setActiveTab('player')}
            title="Hero Player"
            aria-label="Hero Player"
          >
            <PlayCircle size={22} className="car-rail-icon" />
            <span className="car-rail-label">Player</span>
          </button>

          <button
            className={`car-rail-item ${activeTab === 'visualizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('visualizer')}
            title="Visualizer Styles"
            aria-label="Visualizer Styles"
          >
            <BarChart3 size={22} className="car-rail-icon" />
            <span className="car-rail-label">Visualizer</span>
          </button>

          {/* Dedicated Lyrics Tab */}
          <button
            className={`car-rail-item ${activeTab === 'lyrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('lyrics')}
            title="Synced Karaoke Lyrics"
            aria-label="Synced Lyrics"
          >
            <Quote size={22} className="car-rail-icon" />
            <span className="car-rail-label">Lyrics</span>
          </button>

          <button
            className={`car-rail-item ${activeTab === 'equalizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('equalizer')}
            title="Sound Equalizer"
            aria-label="Equalizer"
          >
            <Sliders size={22} className="car-rail-icon" />
            <span className="car-rail-label">Equalizer</span>
          </button>

          <button
            className={`car-rail-item ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
            title="Playing Next Queue"
            aria-label="Queue"
          >
            <ListMusic size={22} className="car-rail-icon" />
            <span className="car-rail-label">Queue</span>
          </button>

          <button
            className={`car-rail-item ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
            title="Music Search"
            aria-label="Search"
          >
            <Search size={22} className="car-rail-icon" />
            <span className="car-rail-label">Search</span>
          </button>

          <button
            className={`car-rail-item ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
            title="Favorite Road Tracks"
            aria-label="Favorites"
          >
            <Heart size={22} className="car-rail-icon" />
            <span className="car-rail-label">Favorites</span>
          </button>
        </aside>

        {/* Central Stage View */}
        <main className="car-stage-main">
          {/* TAB 1: HERO PLAYER (Screen 1) */}
          {activeTab === 'player' && (
            <CarHeroPlayer
              visualizerStyle={visualizerStyle}
              isVisualizerOn={isVisualizerOn}
              voiceStatus={voiceStatus}
              onVoiceTap={handleVoiceTap}
              onOpenVisualizerStyles={() => setActiveTab('visualizer')}
              onOpenFullscreenVisualizer={() => setIsFullscreenVizOpen(true)}
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
    </div>
  );
};

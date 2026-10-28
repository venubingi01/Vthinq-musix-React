'use client';

import React from 'react';
import { useMusic } from '../../context/MusicContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Sliders,
  Loader2
} from 'lucide-react';
import { CarVoiceButton } from './CarVoiceButton';
import type { VoiceStatus } from '../../services/voiceCommandService';

interface CarPlaybackControlsProps {
  voiceStatus: VoiceStatus;
  onVoiceTap: () => void;
  onOpenEq: () => void;
  className?: string;
}

export const CarPlaybackControls: React.FC<CarPlaybackControlsProps> = ({
  voiceStatus,
  onVoiceTap,
  onOpenEq,
  className = ''
}) => {
  const {
    isPlaying,
    isLoading,
    togglePlay,
    nextSong,
    prevSong,
    isShuffle,
    toggleShuffle,
    isLoop,
    toggleLoop
  } = useMusic();

  const [isDebouncing, setIsDebouncing] = React.useState(false);

  const handleAction = (action: () => void) => {
    if (isDebouncing) return;
    setIsDebouncing(true);
    action();
    setTimeout(() => setIsDebouncing(false), 250);
  };

  return (
    <div className={`car-playback-controls-bar ${className}`}>
      {/* Secondary Controls: Shuffle, Repeat */}
      <div className="car-controls-aux-group">
        <button
          className={`car-aux-btn ${isShuffle ? 'active' : ''}`}
          onClick={toggleShuffle}
          title={isShuffle ? 'Shuffle enabled' : 'Shuffle disabled'}
          aria-label={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
        >
          <Shuffle size={24} />
        </button>

        <button
          className={`car-aux-btn ${isLoop ? 'active' : ''}`}
          onClick={toggleLoop}
          title={isLoop ? 'Loop track enabled' : 'Loop track disabled'}
          aria-label={isLoop ? 'Disable loop' : 'Enable loop'}
        >
          <Repeat size={24} />
        </button>
      </div>

      {/* Primary Hero Controls: Previous, Play/Pause, Next */}
      <div className="car-controls-primary-group">
        {/* Previous Track */}
        <button
          className="car-ctrl-btn car-prev-btn"
          onClick={() => handleAction(prevSong)}
          disabled={isDebouncing}
          title="Previous Track"
          aria-label="Previous Track"
        >
          <SkipBack size={34} />
        </button>

        {/* Hero Play / Pause Button */}
        <button
          className={`car-ctrl-btn car-play-pause-hero ${isPlaying ? 'playing' : 'paused'} ${
            isLoading ? 'loading' : ''
          }`}
          onClick={() => handleAction(togglePlay)}
          disabled={isLoading || isDebouncing}
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <Loader2 size={42} className="car-play-spinner" />
          ) : isPlaying ? (
            <Pause size={42} className="car-play-icon" />
          ) : (
            <Play size={42} className="car-play-icon offset" />
          )}
        </button>

        {/* Next Track */}
        <button
          className="car-ctrl-btn car-next-btn"
          onClick={() => handleAction(nextSong)}
          disabled={isDebouncing}
          title="Next Track"
          aria-label="Next Track"
        >
          <SkipForward size={34} />
        </button>
      </div>

      {/* Voice Search & Equalizer */}
      <div className="car-controls-right-group">
        {/* Voice Search Button */}
        <CarVoiceButton status={voiceStatus} onClick={onVoiceTap} />

        {/* EQ Button */}
        <button
          className="car-aux-btn car-eq-trigger-btn"
          onClick={onOpenEq}
          title="Open Audio Equalizer"
          aria-label="Open Audio Equalizer"
        >
          <Sliders size={26} />
          <span className="car-aux-label">EQ</span>
        </button>
      </div>
    </div>
  );
};

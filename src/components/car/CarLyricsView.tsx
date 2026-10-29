'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useMusic } from '../../context/MusicContext';
import { ChevronLeft, Loader2, Music2, SkipBack, Play, Pause, SkipForward } from 'lucide-react';
import { decodeHTMLEntities } from '../../services/sangeethamApi';

interface CarLyricsViewProps {
  className?: string;
  onClose?: () => void;
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const CarLyricsView: React.FC<CarLyricsViewProps> = ({ className = '', onClose }) => {
  const {
    currentSong,
    currentTime,
    duration,
    seek,
    isPlaying,
    togglePlay,
    prevSong,
    nextSong,
    lyrics,
    isLyricsLoading
  } = useMusic();

  const [activeLineIdx, setActiveLineIdx] = useState<number>(-1);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('large');

  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLParagraphElement | null>(null);

  // Reset active line index immediately whenever current song changes
  useEffect(() => {
    setActiveLineIdx(-1);
  }, [currentSong?.id]);

  // Sync active line based on audio currentTime
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

    if (idx !== activeLineIdx) {
      setActiveLineIdx(idx);
    }
  }, [currentTime, lyrics, activeLineIdx]);

  // Smooth scroll to active line
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLineIdx]);

  if (!currentSong) {
    return (
      <div className={`car-lyrics-screen7-card empty ${className}`}>
        <Music2 size={54} className="text-muted" />
        <p>No track currently playing</p>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const toggleFontSize = () => {
    if (fontSizeLevel === 'normal') setFontSizeLevel('large');
    else if (fontSizeLevel === 'large') setFontSizeLevel('xlarge');
    else setFontSizeLevel('normal');
  };

  return (
    <div className={`car-lyrics-screen7-card ${className}`}>
      {/* Top Bar with Back Arrow, Currently Playing Song Info, and Font Size Toggle */}
      <div className="car-lyrics-top-nav-bar">
        <button
          className="car-lyrics-back-arrow-btn"
          onClick={onClose}
          aria-label="Back to Main Player"
        >
          <ChevronLeft size={30} />
        </button>

        <div className="car-lyrics-header-info">
          <h2 className="car-lyrics-song-title">{decodeHTMLEntities(currentSong.name)}</h2>
          <p className="car-lyrics-artist-name">{decodeHTMLEntities(currentSong.artist)}</p>
        </div>

        <button
          className="car-lyrics-font-toggle-btn"
          onClick={toggleFontSize}
          title="Toggle font size"
          aria-label="Toggle font size"
        >
          <span>A</span>
          <span className="font-lg-indicator">A</span>
        </button>
      </div>

      {/* Main Lyrics Display Area with centered large automotive karaoke lines */}
      <div className={`car-lyrics-lines-container font-scale-${fontSizeLevel}`} ref={lyricsContainerRef}>
        {isLyricsLoading ? (
          <div className="car-lyrics-screen7-loading">
            <Loader2 size={36} className="spin text-pink" />
            <span>Loading synced karaoke lyrics...</span>
          </div>
        ) : lyrics.length > 0 ? (
          <div className="car-lyrics-lines-wrapper">
            {lyrics.map((line, idx) => {
              const isActive = idx === activeLineIdx;
              const isPast = idx < activeLineIdx;

              return (
                <p
                  key={`${line.time}-${idx}`}
                  ref={isActive ? activeLineRef : null}
                  className={`car-screen7-line ${isActive ? 'active-singing' : ''} ${isPast ? 'past' : ''}`}
                  onClick={() => seek(line.time)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Jump to ${line.text}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      seek(line.time);
                    }
                  }}
                >
                  {line.text}
                </p>
              );
            })}
          </div>
        ) : (
          <div className="car-lyrics-screen7-empty">
            <p>Lyrics not available for this track</p>
          </div>
        )}
      </div>

      {/* Bottom Transport Controls & Scrubber */}
      <div className="car-lyrics-bottom-bar">
        <div className="car-lyrics-mini-controls">
          <button
            className="car-lyrics-ctrl-btn"
            onClick={prevSong}
            title="Previous Song"
            aria-label="Previous Song"
          >
            <SkipBack size={26} />
          </button>
          <button
            className="car-lyrics-ctrl-btn play-pause"
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            className="car-lyrics-ctrl-btn"
            onClick={nextSong}
            title="Next Song"
            aria-label="Next Song"
          >
            <SkipForward size={26} />
          </button>
        </div>

        <div className="car-lyrics-screen7-scrubber">
          <span className="car-scrubber-time current">{formatDuration(currentTime)}</span>
          <div className="car-scrubber-track-box">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="car-scrubber-slider"
              aria-label="Seek track position"
              style={{
                background: `linear-gradient(to right, #ff2d75 ${progressPercent}%, rgba(255, 255, 255, 0.16) ${progressPercent}%)`
              }}
            />
          </div>
          <span className="car-scrubber-time duration">{formatDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useMusic } from '../../context/MusicContext';
import { fetchLyrics } from '../../services/lyricsService';
import type { TimedLyric } from '../../types/music';
import { Quote, Loader2, Music2, Sparkles } from 'lucide-react';
import { decodeHTMLEntities } from '../../services/sangeethamApi';

interface CarLyricsViewProps {
  className?: string;
  onClose?: () => void;
}

export const CarLyricsView: React.FC<CarLyricsViewProps> = ({ className = '', onClose }) => {
  const { currentSong, currentTime, seek, isPlaying } = useMusic();
  const [lyrics, setLyrics] = useState<TimedLyric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeLineIdx, setActiveLineIdx] = useState<number>(-1);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLParagraphElement | null>(null);

  // Load lyrics whenever current song changes
  useEffect(() => {
    if (!currentSong) {
      setLyrics([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetchLyrics(currentSong.name, currentSong.artist, currentSong.album, currentSong.language)
      .then((data) => {
        if (!isMounted) return;
        setLyrics(data || []);
      })
      .catch(() => {
        if (!isMounted) return;
        setLyrics([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
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
      <div className={`car-lyrics-empty ${className}`}>
        <Music2 size={54} className="text-muted" />
        <p>No track currently playing</p>
      </div>
    );
  }

  const songName = decodeHTMLEntities(currentSong.name);
  const artistName = decodeHTMLEntities(currentSong.artist);

  return (
    <div className={`car-lyrics-container ${className}`}>
      {/* Lyrics Header */}
      <div className="car-lyrics-header">
        <div className="car-lyrics-title-group">
          <Quote size={22} className="text-electric-blue" />
          <div>
            <h2 className="car-lyrics-track-title">{songName}</h2>
            <p className="car-lyrics-track-artist">{artistName} • Synced Lyrics</p>
          </div>
        </div>

        {onClose && (
          <button className="car-lyrics-close-btn" onClick={onClose} aria-label="Close lyrics">
            Close
          </button>
        )}
      </div>

      {/* Lyrics Content Stream */}
      <div className="car-lyrics-scroll-area" ref={lyricsContainerRef}>
        {isLoading ? (
          <div className="car-lyrics-loading">
            <Loader2 size={36} className="spin text-electric-blue" />
            <span>Finding synchronized lyrics...</span>
          </div>
        ) : lyrics.length > 0 ? (
          <div className="car-lyrics-lines-list">
            {lyrics.map((line, idx) => {
              const isActive = idx === activeLineIdx;
              const isPast = idx < activeLineIdx;

              return (
                <p
                  key={`${line.time}-${idx}`}
                  ref={isActive ? activeLineRef : null}
                  className={`car-lyric-line ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
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
                  {isActive && <Sparkles size={18} className="car-lyric-sparkle" />}
                  <span>{line.text}</span>
                </p>
              );
            })}
          </div>
        ) : (
          <div className="car-lyrics-empty">
            <Quote size={48} className="text-muted" />
            <p>Lyrics not available for this track</p>
            <span>Sing along and enjoy the beat!</span>
          </div>
        )}
      </div>
    </div>
  );
};

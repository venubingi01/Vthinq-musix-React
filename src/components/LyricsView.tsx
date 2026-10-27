import React, { useState, useEffect, useRef } from 'react';
import { useMusic } from '../context/MusicContext';
import { fetchLyrics } from '../services/lyricsService';
import type { TimedLyric } from '../types/music';
import { Quote, Loader2, Music2 } from 'lucide-react';

export const LyricsView: React.FC = () => {
  const { currentSong, currentTime, seek } = useMusic();
  const [lyrics, setLyrics] = useState<TimedLyric[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // Fetch lyrics whenever currentSong changes
  useEffect(() => {
    if (!currentSong) return;

    let isMounted = true;
    setLoading(true);

    fetchLyrics(currentSong.name, currentSong.artist)
      .then((data) => {
        if (isMounted) {
          setLyrics(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentSong?.id]);

  // Find index of currently active lyric line matching playback currentTime
  let activeIndex = -1;
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
      break;
    }
  }

  // Smoothly autoscroll the active line into center view
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  if (!currentSong) {
    return (
      <div className="lyrics-empty-state">
        <Music2 size={48} className="text-muted" />
        <p>No track currently playing</p>
      </div>
    );
  }

  return (
    <div className="lyrics-view-wrapper">
      {/* Dynamic blurred ambient background from album cover */}
      <div
        className="lyrics-ambient-bg"
        style={{ backgroundImage: `url(${currentSong.image})` }}
      />

      <div className="lyrics-container">
        {/* Track header */}
        <div className="lyrics-header">
          <img src={currentSong.image} alt={currentSong.name} className="lyrics-cover-small" />
          <div className="lyrics-meta">
            <h2 className="lyrics-song-title">{currentSong.name}</h2>
            <p className="lyrics-artist-name">{currentSong.artist}</p>
          </div>
        </div>

        {/* Lyrics content */}
        {loading ? (
          <div className="lyrics-loading">
            <Loader2 size={36} className="spin-loader text-pink" />
            <p>Syncing lyrics...</p>
          </div>
        ) : lyrics.length === 0 ? (
          <div className="lyrics-not-found">
            <Quote size={40} className="text-muted" />
            <p>Lyrics not available for this track.</p>
          </div>
        ) : (
          <div className="lyrics-lines-scroll">
            {lyrics.map((line, index) => {
              const isActive = index === activeIndex;
              const isPast = index < activeIndex;

              return (
                <div
                  key={`${line.time}-${index}`}
                  ref={isActive ? activeLineRef : null}
                  className={`lyrics-line ${isActive ? 'active-line' : ''} ${isPast ? 'past-line' : ''}`}
                  onClick={() => seek(line.time)}
                  title="Click to seek to this lyric line"
                >
                  <span className="lyrics-text">{line.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

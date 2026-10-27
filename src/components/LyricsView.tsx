import React, { useState, useEffect, useRef } from 'react';
import { useMusic } from '../context/MusicContext';
import { fetchLyrics, isPlainLyrics } from '../services/lyricsService';
import type { TimedLyric } from '../types/music';
import { Quote, Loader2, Music2, AlignLeft } from 'lucide-react';

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

  const isPlain = isPlainLyrics(lyrics);

  // Find index of currently active lyric line matching playback currentTime (only for synced lyrics)
  let activeIndex = -1;
  if (!isPlain) {
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        activeIndex = i;
        break;
      }
    }
  }

  // Smoothly autoscroll the active line into center view (only for synced lyrics)
  useEffect(() => {
    if (!isPlain && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex, isPlain]);

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
            <h3 className="lyrics-empty-title">{currentSong?.name}</h3>
            {currentSong?.artist && <p className="lyrics-empty-artist">{currentSong.artist}</p>}
            <p className="lyrics-empty-notice">Lyrics not available for this track.</p>
          </div>
        ) : isPlain ? (
          <div className="lyrics-plain-scroll-box custom-scrollbar">
            <div className="lyrics-plain-tag">
              <AlignLeft size={14} />
              <span>Plain Lyrics</span>
            </div>
            {lyrics.map((line, index) => (
              <p key={`lv-plain-${index}`} className="lyrics-plain-line">
                {line.text}
              </p>
            ))}
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

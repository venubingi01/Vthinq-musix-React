'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMusic } from '../context/MusicContext';
import { fetchLyrics, isPlainLyrics } from '../services/lyricsService';
import type { TimedLyric } from '../types/music';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  Palette,
  Loader2,
  AlignLeft
} from 'lucide-react';

export type LyricalThemeKey = 'noir' | 'lightgrey' | 'silver';

export interface LyricalThemeConfig {
  key: LyricalThemeKey;
  label: string;
  dotColor: string;
  bgGradient: string;
  activeTextColor: string;
  inactiveTextColor: string;
  textGlow: string;
  barTopColor: string;
  barMidColor: string;
  barBottomColor: string;
  particleColors: string[];
  borderColor: string;
}

export const LYRICAL_THEMES: Record<LyricalThemeKey, LyricalThemeConfig> = {
  noir: {
    key: 'noir',
    label: 'Black & White',
    dotColor: '#ffffff',
    bgGradient: 'radial-gradient(ellipse at 70% 30%, #0d1117 0%, #06080c 60%, #000000 100%)',
    activeTextColor: '#ffffff',
    inactiveTextColor: 'rgba(215, 225, 240, 0.42)',
    textGlow: '0 2px 10px rgba(0, 0, 0, 0.7), 0 0 8px rgba(255, 255, 255, 0.2)',
    barTopColor: 'rgba(255, 255, 255, 0.95)',
    barMidColor: 'rgba(209, 213, 219, 0.65)',
    barBottomColor: 'rgba(156, 163, 175, 0.12)',
    particleColors: ['#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db'],
    borderColor: 'rgba(255, 255, 255, 0.14)'
  },
  lightgrey: {
    key: 'lightgrey',
    label: 'Light Grey',
    dotColor: '#cbd5e1',
    bgGradient: 'radial-gradient(ellipse at 70% 30%, #1e2430 0%, #121620 60%, #090c12 100%)',
    activeTextColor: '#f8fafc',
    inactiveTextColor: 'rgba(203, 213, 225, 0.45)',
    textGlow: '0 2px 10px rgba(0, 0, 0, 0.7), 0 0 8px rgba(226, 232, 240, 0.2)',
    barTopColor: 'rgba(241, 245, 249, 0.95)',
    barMidColor: 'rgba(148, 163, 184, 0.65)',
    barBottomColor: 'rgba(100, 116, 139, 0.12)',
    particleColors: ['#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8'],
    borderColor: 'rgba(203, 213, 225, 0.18)'
  },
  silver: {
    key: 'silver',
    label: 'Silver Minimal',
    dotColor: '#9ca3af',
    bgGradient: 'radial-gradient(ellipse at 70% 30%, #161a22 0%, #0c0e14 60%, #040507 100%)',
    activeTextColor: '#ffffff',
    inactiveTextColor: 'rgba(156, 163, 175, 0.38)',
    textGlow: '0 2px 10px rgba(0, 0, 0, 0.7), 0 0 8px rgba(255, 255, 255, 0.18)',
    barTopColor: 'rgba(229, 231, 235, 0.9)',
    barMidColor: 'rgba(107, 114, 128, 0.6)',
    barBottomColor: 'rgba(75, 85, 99, 0.12)',
    particleColors: ['#ffffff', '#e5e7eb', '#9ca3af', '#6b7280'],
    borderColor: 'rgba(156, 163, 175, 0.15)'
  }
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface LyricalVisualizerProps {
  lyrics?: TimedLyric[];
  videoId?: string | null;
  showMediaCard?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  className?: string;
  initialTheme?: LyricalThemeKey;
}

export const LyricalVisualizer: React.FC<LyricalVisualizerProps> = ({
  lyrics: propLyrics,
  showMediaCard = true,
  isFullscreen = false,
  onToggleFullscreen,
  className = '',
  initialTheme = 'noir'
}) => {
  const {
    currentSong,
    currentTime,
    isPlaying,
    seek,
    analyserNode,
    openFullscreenVisualizer
  } = useMusic();

  const [currentThemeKey, setCurrentThemeKey] = useState<LyricalThemeKey>(initialTheme);
  const theme = LYRICAL_THEMES[currentThemeKey];

  // Synced lyrics fetching
  const [lyricsList, setLyricsList] = useState<TimedLyric[]>(propLyrics || []);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState<boolean>(false);

  useEffect(() => {
    if (propLyrics && propLyrics.length > 0) {
      setLyricsList(propLyrics);
      return;
    }
    if (!currentSong) return;

    let isMounted = true;
    setIsLoadingLyrics(true);

    fetchLyrics(currentSong.name, currentSong.artist, currentSong.album, currentSong.language)
      .then((data) => {
        if (isMounted) {
          setLyricsList(data);
          setIsLoadingLyrics(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingLyrics(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentSong?.id, propLyrics]);

  const isPlain = useMemo(() => isPlainLyrics(lyricsList), [lyricsList]);

  // Active lyric calculation
  const activeIndex = useMemo(() => {
    if (isPlain || !lyricsList.length) return -1;
    let idx = -1;
    for (let i = lyricsList.length - 1; i >= 0; i--) {
      if (currentTime >= lyricsList[i].time) {
        idx = i;
        break;
      }
    }
    return idx;
  }, [lyricsList, currentTime]);

  // Slices for the multi-line lyrical display (matching the screenshot)
  const pastLines = useMemo(() => {
    if (activeIndex <= 0) return [];
    const start = Math.max(0, activeIndex - 4);
    return lyricsList.slice(start, activeIndex);
  }, [lyricsList, activeIndex]);

  const activeLyric = activeIndex >= 0 ? lyricsList[activeIndex] : null;

  const futureLines = useMemo(() => {
    if (activeIndex < 0) return lyricsList.slice(0, 3);
    return lyricsList.slice(activeIndex + 1, Math.min(lyricsList.length, activeIndex + 4));
  }, [lyricsList, activeIndex]);

  // Canvas visualizer refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Audio Equalizer Visualizer & Floating Peak Sparks Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 128;
    const freqData = new Uint8Array(bufferLength);

    let beatThreshold = 180;
    let beatPulse = 0;

    const render = () => {
      animId = requestAnimationFrame(render);

      const w = canvas.width;
      const h = canvas.height;
      const dpr = window.devicePixelRatio || 1;

      // Extract frequency data
      if (analyserNode && isPlaying) {
        analyserNode.getByteFrequencyData(freqData);
      } else {
        // Natural fluid idle wave
        const time = Date.now() / 360;
        for (let i = 0; i < bufferLength; i++) {
          freqData[i] = Math.max(12, Math.floor(Math.sin(time + i * 0.16) * 32 + 38));
        }
      }

      // Bass beat detection
      let bassSum = 0;
      const bassBins = Math.min(10, bufferLength);
      for (let b = 0; b < bassBins; b++) {
        bassSum += freqData[b];
      }
      const bassEnergy = bassSum / bassBins;

      if (bassEnergy > beatThreshold * 1.15) {
        beatPulse = 1.0;
      } else {
        beatPulse *= 0.92;
      }
      beatThreshold = beatThreshold * 0.96 + bassEnergy * 0.04;

      ctx.clearRect(0, 0, w, h);

      // 1. Render Dense Equalizer Bars across full width
      // Thin bars with small gaps (e.g. 2.6px bar + 2px gap)
      const barWidth = Math.max(2 * dpr, 2.6 * dpr);
      const barGap = Math.max(1.4 * dpr, 2.2 * dpr);
      const slotWidth = barWidth + barGap;
      const barCount = Math.floor(w / slotWidth);
      const startX = (w - (barCount * slotWidth)) / 2;

      for (let i = 0; i < barCount; i++) {
        const normX = i / barCount;
        // Frequency mapping
        const freqIdx = Math.min(
          bufferLength - 1,
          Math.floor(Math.pow(normX, 0.82) * (bufferLength * 0.78))
        );
        const rawVal = (freqData[freqIdx] || 0) / 255;

        // Curve envelope matching the screenshot (rising wave profile with dynamic peaks)
        const curveEnvelope = 0.22 + Math.pow(normX, 0.9) * 0.78;
        const maxBarH = h * 0.62;
        const barH = Math.max(
          8 * dpr,
          rawVal * curveEnvelope * maxBarH + (beatPulse * 14 * dpr * normX)
        );

        const x = startX + i * slotWidth;
        const y = h - barH;

        // Gradient for bars (White tip -> Light Grey -> Translucent base)
        const barGrad = ctx.createLinearGradient(0, y, 0, h);
        barGrad.addColorStop(0, theme.barTopColor);
        barGrad.addColorStop(0.3, theme.barMidColor);
        barGrad.addColorStop(1, theme.barBottomColor);

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, [barWidth / 2, barWidth / 2, 0, 0]);
        ctx.fill();

        // 2. Spawn glowing peak sparks/embers on active upper bars
        if (normX > 0.42 && barH > h * 0.2 && Math.random() < (0.045 + (bassEnergy / 255) * 0.06)) {
          if (particles.length < 160) {
            particles.push({
              x: x + (Math.random() - 0.5) * 6 * dpr,
              y: y - Math.random() * 6 * dpr,
              vx: (Math.random() - 0.5) * 1.4 * dpr,
              vy: (-Math.random() * 2.2 - 1.2) * dpr,
              size: (Math.random() * 2.8 + 1.2) * dpr,
              color: theme.particleColors[Math.floor(Math.random() * theme.particleColors.length)],
              alpha: Math.random() * 0.65 + 0.35,
              life: 0,
              maxLife: Math.floor(Math.random() * 75 + 45)
            });
          }
        }
      }

      // 3. Render floating spark embers dancing upward from peaks
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife || p.alpha <= 0 || p.y < -10) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8 * dpr;
        ctx.fill();
        ctx.restore();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [theme, isPlaying, analyserNode]);

  const handleSeekLyric = (time: number) => {
    seek(time);
  };

  const handleExpandToFullscreen = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    } else {
      openFullscreenVisualizer();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`lyrical-stage-wrapper ${className} ${isFullscreen ? 'is-fullscreen' : ''}`}
      style={{
        background: theme.bgGradient,
        borderColor: theme.borderColor
      }}
    >
      {/* 1. Full-bleed Audio Equalizer Canvas with Peak Sparks */}
      <canvas ref={canvasRef} className="lyrical-canvas-bg" />

      {/* 2. Top Header HUD: Brand/Badge, Theme Picker & Fullscreen */}
      <div className="lyrical-top-header">
        <div className="lyrical-badge-box">
          <Sparkles size={14} className="sparkle-shimmer" style={{ color: theme.activeTextColor }} />
          <span className="lyrical-badge-text">VISUALIZER & LYRICS</span>
        </div>

        <div className="lyrical-top-actions">
          {/* Black & White / Light Grey Color Scheme Switcher */}
          <div className="lyrical-theme-picker" title="Color Theme: Black & White and Light Grey">
            <Palette size={13} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            {(['noir', 'lightgrey', 'silver'] as LyricalThemeKey[]).map((tKey) => {
              const t = LYRICAL_THEMES[tKey];
              const isActive = currentThemeKey === tKey;
              return (
                <button
                  key={tKey}
                  type="button"
                  className={`lyrical-theme-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setCurrentThemeKey(tKey)}
                  title={t.label}
                >
                  <span
                    className="theme-btn-dot"
                    style={{ backgroundColor: t.dotColor }}
                  />
                  <span className="theme-btn-label">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="lyrical-icon-btn"
            onClick={handleExpandToFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Open Fullscreen Lyrical Visualizer'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* 3. Main Stage: Left 9:16 Portrait Canvas + Right Multi-line Synced Lyrics */}
      <div className="lyrical-main-stage">
        {/* Left Side: 9:16 Portrait Album Cover Card */}
        {showMediaCard && currentSong && (
          <div className="lyrical-portrait-column">
            <div className="lyrical-portrait-card">
              <div
                className="portrait-cover-box"
                style={{ backgroundImage: `url(${currentSong.image})` }}
              >
                <img
                  src={currentSong.image}
                  alt={currentSong.name}
                  className="portrait-cover-img"
                />
              </div>

              {/* Card Top Badges */}
              <div className="portrait-badges-overlay">
                {/* <span className="portrait-status-pill">
                  ✦ COVER ART
                </span> */}
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Multi-line Synced Lyrics Display */}
        <div className="lyrical-lyrics-column">
          {isLoadingLyrics ? (
            <div className="lyrical-loading-box">
              <Loader2 size={32} className="spin-loader" style={{ color: theme.activeTextColor }} />
              <p style={{ color: theme.activeTextColor }}>Syncing lyrics...</p>
            </div>
          ) : lyricsList.length === 0 ? (
            <div className="lyrical-lyrics-stack">
              <div
                className="lyrical-line lyrical-active-line"
                style={{
                  color: theme.activeTextColor,
                  textShadow: theme.textGlow
                }}
              >
                <span className="active-lyric-glow-text">{currentSong?.name}</span>
              </div>
              {currentSong?.artist && (
                <div
                  className="lyrical-line"
                  style={{
                    color: theme.inactiveTextColor,
                    opacity: 0.55,
                    fontSize: '1rem',
                    fontWeight: 500,
                    textShadow: 'none'
                  }}
                >
                  <span>{currentSong.artist}</span>
                </div>
              )}
            </div>
          ) : isPlain ? (
            <div className="lyrical-plain-container">
              <div className="lyrical-plain-header">
                <span
                  className="lyrical-plain-badge"
                  style={{
                    borderColor: theme.borderColor,
                    color: theme.dotColor
                  }}
                >
                  <AlignLeft size={13} />
                  Plain Lyrics
                </span>
                <span className="lyrical-plain-hint" style={{ color: theme.inactiveTextColor }}>
                  Full Text View
                </span>
              </div>
              <div className="lyrical-plain-scroll custom-scrollbar">
                {lyricsList.map((line, idx) => (
                  <p
                    key={`plain-${idx}`}
                    className="lyrical-plain-line"
                    style={{
                      color: theme.activeTextColor,
                      textShadow: theme.textGlow
                    }}
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="lyrical-lyrics-stack">
              {/* Past Lines (Muted Light Grey Context) */}
              {pastLines.map((line, pIdx) => {
                const distance = pastLines.length - pIdx;
                const opacity = Math.max(0.2, 0.65 - distance * 0.12);
                return (
                  <div
                    key={`past-${line.time}-${pIdx}`}
                    className="lyrical-line lyrical-past-line"
                    onClick={() => handleSeekLyric(line.time)}
                    style={{
                      color: theme.inactiveTextColor,
                      opacity
                    }}
                    title="Click to seek back"
                  >
                    <span className="lyric-text">{line.text}</span>
                  </div>
                );
              })}

              {/* ACTIVE LINE (Large, Bold, Crisp Stark White with Glow) */}
              {activeLyric ? (
                <div
                  key={`active-${activeIndex}`}
                  className="lyrical-line lyrical-active-line"
                  onClick={() => handleSeekLyric(activeLyric.time)}
                  style={{
                    color: theme.activeTextColor,
                    textShadow: theme.textGlow
                  }}
                  title="Currently playing"
                >
                  <span className="active-lyric-glow-text">{activeLyric.text}</span>
                </div>
              ) : (
                <div
                  className="lyrical-line lyrical-active-line intro"
                  style={{
                    color: theme.activeTextColor,
                    textShadow: theme.textGlow
                  }}
                >
                  <span className="active-lyric-glow-text">{currentSong?.name}</span>
                </div>
              )}

              {/* Future Lines (Upcoming Preview in Light Grey) */}
              {futureLines.map((line, fIdx) => {
                const opacity = Math.max(0.18, 0.45 - fIdx * 0.12);
                return (
                  <div
                    key={`future-${line.time}-${fIdx}`}
                    className="lyrical-line lyrical-future-line"
                    onClick={() => handleSeekLyric(line.time)}
                    style={{
                      color: theme.inactiveTextColor,
                      opacity
                    }}
                    title="Click to jump forward"
                  >
                    <span className="lyric-text">{line.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

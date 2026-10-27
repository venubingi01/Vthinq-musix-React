'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMusic } from '../context/MusicContext';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Palette,
  Heart,
  Repeat,
  Shuffle,
  Zap,
  Layers,
  Radio
} from 'lucide-react';

import { fetchLyrics } from '../services/lyricsService';
import type { TimedLyric } from '../types/music';

type VisualizerMode = 'lyrics' | 'burst' | 'galaxy' | 'radial' | 'wave';
type ColorTheme = 'monochrome' | 'lightgrey' | 'cyberpunk' | 'sunset' | 'violet' | 'emerald' | 'ocean';

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

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
}

// Color schemes definition
const THEMES: Record<ColorTheme, { name: string; primary: string; secondary: string; accent: string; core: string }> = {
  monochrome: {
    name: 'Noir Black & White',
    primary: '#ffffff',
    secondary: '#d1d5db',
    accent: '#9ca3af',
    core: 'rgba(255, 255, 255, 0.28)'
  },
  lightgrey: {
    name: 'Platinum Light Grey',
    primary: '#e2e8f0',
    secondary: '#94a3b8',
    accent: '#cbd5e1',
    core: 'rgba(226, 232, 240, 0.28)'
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    primary: '#00f0ff',
    secondary: '#ff2d49',
    accent: '#ffd00f',
    core: 'rgba(255, 45, 73, 0.4)'
  },
  sunset: {
    name: 'Sunset Glow',
    primary: '#ff6a00',
    secondary: '#ee0979',
    accent: '#ffcc00',
    core: 'rgba(238, 9, 121, 0.4)'
  },
  violet: {
    name: 'Electric Violet',
    primary: '#b57bee',
    secondary: '#00e5ff',
    accent: '#e879b0',
    core: 'rgba(181, 123, 238, 0.4)'
  },
  emerald: {
    name: 'Emerald Aurora',
    primary: '#43e97b',
    secondary: '#38f9d7',
    accent: '#72efdd',
    core: 'rgba(67, 233, 123, 0.4)'
  },
  ocean: {
    name: 'Deep Ocean',
    primary: '#00b4d8',
    secondary: '#4fc3f7',
    accent: '#90e0ef',
    core: 'rgba(0, 180, 216, 0.4)'
  }
};

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const FullscreenVisualizer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoop,
    isShuffle,
    analyserNode,
    isFullscreenVisualizerOpen,
    closeFullscreenVisualizer,
    togglePlay,
    seek,
    nextSong,
    prevSong,
    setVolume,
    toggleMute,
    toggleLoop,
    toggleShuffle,
    toggleFavorite,
    isFavorite
  } = useMusic();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Visualizer settings (defaults to lyrical video with Black & White / Light Grey styling)
  const [mode, setMode] = useState<VisualizerMode>('lyrics');
  const [themeKey, setThemeKey] = useState<ColorTheme>('monochrome');
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synced lyrics fetching & state
  const [lyrics, setLyrics] = useState<TimedLyric[]>([]);

  useEffect(() => {
    if (!currentSong) return;
    let isMounted = true;
    fetchLyrics(currentSong.name, currentSong.artist).then((data) => {
      if (isMounted) setLyrics(data);
    });
    return () => {
      isMounted = false;
    };
  }, [currentSong?.id]);

  let activeIndex = -1;
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
      break;
    }
  }

  const pastLines = activeIndex > 0 ? lyrics.slice(Math.max(0, activeIndex - 4), activeIndex) : [];
  const activeLyric = activeIndex >= 0 ? lyrics[activeIndex] : null;
  const futureLines = activeIndex >= 0 ? lyrics.slice(activeIndex + 1, Math.min(lyrics.length, activeIndex + 4)) : lyrics.slice(0, 3);

  // Reset controls hide timer on interaction
  const handleUserActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4500);
  }, []);

  // Keyboard shortcut listener (Escape to exit)
  useEffect(() => {
    if (!isFullscreenVisualizerOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFullscreenVisualizer();
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreenVisualizerOpen, closeFullscreenVisualizer, togglePlay]);

  // Native Fullscreen toggle
  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsNativeFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsNativeFullscreen(false);
    }
  };

  // Canvas Particle Visualizer Engine
  useEffect(() => {
    if (!isFullscreenVisualizerOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth * (window.devicePixelRatio || 1));
    let height = (canvas.height = window.innerHeight * (window.devicePixelRatio || 1));

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
      height = canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
    };

    window.addEventListener('resize', onResize);

    // Audio Analysis buffers
    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 128;
    const freqData = new Uint8Array(bufferLength);

    // Particles system state
    let particles: Particle[] = [];
    let stars: Star[] = [];
    const STAR_COUNT = 180;

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * width,
        size: Math.random() * 2 + 0.8,
        color: Math.random() > 0.6 ? '#ffffff' : (Math.random() > 0.5 ? '#00f0ff' : '#ff2d49')
      });
    }

    // Beat detection state
    let beatThreshold = 180;
    let beatScale = 0;
    let lastBeatTime = 0;
    let rotationAngle = 0;

    const render = () => {
      animId = requestAnimationFrame(render);

      const dpr = window.devicePixelRatio || 1;
      const theme = THEMES[themeKey];
      const cx = width / 2;
      const cy = height / 2;

      // Extract frequency data
      if (analyserNode && isPlaying) {
        analyserNode.getByteFrequencyData(freqData);
      } else {
        // Idle ambient frequency oscillation
        const time = Date.now() / 300;
        for (let i = 0; i < bufferLength; i++) {
          freqData[i] = Math.max(12, Math.floor(Math.sin(time + i * 0.15) * 35 + 40));
        }
      }

      // 1. Beat detection (bins 0-10 represent punchy sub-bass & kick drum)
      let bassSum = 0;
      const bassBins = Math.min(12, bufferLength);
      for (let b = 0; b < bassBins; b++) {
        bassSum += freqData[b];
      }
      const bassEnergy = bassSum / bassBins;
      const now = performance.now();

      if (bassEnergy > beatThreshold * 1.15 && now - lastBeatTime > 240) {
        beatScale = 1.0;
        lastBeatTime = now;

        // Spawn energetic radial burst particles on kick beat!
        const burstCount = Math.floor(18 + Math.random() * 14);
        for (let p = 0; p < burstCount; p++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = (Math.random() * 6 + 3) * (bassEnergy / 180) * dpr;
          const colors = [theme.primary, theme.secondary, theme.accent, '#ffffff'];
          particles.push({
            x: cx + Math.cos(angle) * (60 * dpr),
            y: cy + Math.sin(angle) * (60 * dpr),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: (Math.random() * 4 + 2) * dpr,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1.0,
            life: 0,
            maxLife: Math.floor(40 + Math.random() * 35)
          });
        }
      } else {
        beatScale *= 0.90;
      }
      beatThreshold = beatThreshold * 0.96 + bassEnergy * 0.04;

      // 2. Clear canvas with slight motion trail
      ctx.fillStyle = 'rgba(6, 9, 18, 0.28)';
      ctx.fillRect(0, 0, width, height);

      // 3. Render 3D Starfield / Dust nebula drifting with speed tied to bass
      const starSpeed = (1.5 + (bassEnergy / 255) * 5 + beatScale * 4) * dpr;
      ctx.save();
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.z -= starSpeed;
        if (star.z <= 0) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width * 1.5;
          star.y = (Math.random() - 0.5) * height * 1.5;
        }

        const k = 250 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = Math.max(0.6, (1 - star.z / width) * star.size * dpr);
          const alpha = (1 - star.z / width) * 0.85;

          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = alpha;
          ctx.fill();
        }
      }
      ctx.restore();

      // 4. Update and render active burst particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife || p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10 * dpr;
        ctx.fill();
        ctx.restore();
      }

      // 5. Visualizer Modes Render
      rotationAngle += 0.008 + (bassEnergy / 255) * 0.015;

      const baseRadius = (Math.min(width, height) * 0.16) + (beatScale * 14 * dpr);

      // Central Glowing Core (shown in non-lyrics modes)
      if (mode !== 'lyrics') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
        coreGrad.addColorStop(0, theme.core);
        coreGrad.addColorStop(0.7, 'rgba(10, 14, 26, 0.9)');
        coreGrad.addColorStop(1, theme.primary);
        ctx.fillStyle = coreGrad;
        ctx.shadowColor = theme.secondary;
        ctx.shadowBlur = (20 + beatScale * 25) * dpr;
        ctx.fill();
        ctx.lineWidth = (2.5 + beatScale * 2) * dpr;
        ctx.strokeStyle = theme.primary;
        ctx.stroke();
        ctx.restore();
      }

      // Mode: Burst / Radial Spectrum
      if (mode === 'burst' || mode === 'radial') {
        const spikeCount = 64;
        const angleStep = (Math.PI * 2) / spikeCount;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotationAngle);

        for (let i = 0; i < spikeCount; i++) {
          const angle = i * angleStep;
          const dataIdx = Math.floor((i / spikeCount) * (bufferLength / 2));
          const val = (freqData[dataIdx] || 0) / 255;
          const spikeLen = (val * (baseRadius * 0.95) + beatScale * 8 * dpr);

          const x1 = Math.cos(angle) * (baseRadius + 4 * dpr);
          const y1 = Math.sin(angle) * (baseRadius + 4 * dpr);
          const x2 = Math.cos(angle) * (baseRadius + 4 * dpr + spikeLen);
          const y2 = Math.sin(angle) * (baseRadius + 4 * dpr + spikeLen);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineWidth = (2.5 + val * 2) * dpr;
          ctx.strokeStyle = i % 2 === 0 ? theme.primary : theme.secondary;
          ctx.shadowColor = theme.primary;
          ctx.shadowBlur = (8 * dpr);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Mode: Galaxy Orbiting Moons
      if (mode === 'galaxy') {
        const moonCount = 4;
        for (let m = 0; m < moonCount; m++) {
          const moonAngle = rotationAngle * (m % 2 === 0 ? 1 : -1) + (m * (Math.PI * 2 / moonCount));
          const dist = baseRadius + (40 + m * 25) * dpr + (beatScale * 12 * dpr);
          const mx = cx + Math.cos(moonAngle) * dist;
          const my = cy + Math.sin(moonAngle) * dist;

          ctx.save();
          ctx.beginPath();
          ctx.arc(mx, my, (6 + m * 2) * dpr, 0, Math.PI * 2);
          ctx.fillStyle = m % 2 === 0 ? theme.primary : theme.accent;
          ctx.shadowColor = theme.secondary;
          ctx.shadowBlur = 15 * dpr;
          ctx.fill();
          ctx.restore();
        }
      }

      // Mode: Dense Equalizer Bars & Peak Sparks (Lyrics Mode)
      if (mode === 'lyrics') {
        const barWidth = Math.max(2 * dpr, 2.6 * dpr);
        const barGap = Math.max(1.4 * dpr, 2.2 * dpr);
        const slotWidth = barWidth + barGap;
        const barCount = Math.floor(width / slotWidth);
        const startX = (width - (barCount * slotWidth)) / 2;

        for (let i = 0; i < barCount; i++) {
          const normX = i / barCount;
          const freqIdx = Math.min(
            bufferLength - 1,
            Math.floor(Math.pow(normX, 0.82) * (bufferLength * 0.78))
          );
          const rawVal = (freqData[freqIdx] || 0) / 255;
          const curveEnvelope = 0.22 + Math.pow(normX, 0.9) * 0.78;
          const maxBarH = height * 0.62;
          const barH = Math.max(8 * dpr, rawVal * curveEnvelope * maxBarH + (beatScale * 14 * dpr * normX));

          const x = startX + i * slotWidth;
          const y = height - barH;

          const barGrad = ctx.createLinearGradient(0, y, 0, height);
          barGrad.addColorStop(0, theme.primary);
          barGrad.addColorStop(0.35, theme.secondary);
          barGrad.addColorStop(1, 'rgba(100, 116, 139, 0.08)');

          ctx.fillStyle = barGrad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barH, [barWidth / 2, barWidth / 2, 0, 0]);
          ctx.fill();

          // Peak spark emissions on mid-high bars
          if (normX > 0.42 && barH > height * 0.2 && Math.random() < 0.05) {
            if (particles.length < 180) {
              particles.push({
                x: x + (Math.random() - 0.5) * 6 * dpr,
                y: y - Math.random() * 6 * dpr,
                vx: (Math.random() - 0.5) * 1.4 * dpr,
                vy: (-Math.random() * 2.5 - 1.2) * dpr,
                size: (Math.random() * 2.8 + 1.2) * dpr,
                color: Math.random() > 0.5 ? theme.primary : theme.secondary,
                alpha: 0.85,
                life: 0,
                maxLife: Math.floor(Math.random() * 70 + 40)
              });
            }
          }
        }
      }

      // Mode: Bottom Cosmic Waveform Spectrum (rendered in wave and burst modes)
      if (mode === 'wave' || mode === 'burst') {
        const waveBars = 48;
        const stepX = width / waveBars;
        const baseY = height - (90 * dpr);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, baseY);

        for (let i = 0; i < waveBars; i++) {
          const val = (freqData[i] || 0) / 255;
          const waveH = val * (120 * dpr) + (beatScale * 14 * dpr);
          const x = i * stepX;
          const y = baseY - waveH;

          if (i === 0) {
            ctx.lineTo(x, y);
          } else {
            const prevX = (i - 1) * stepX;
            const prevVal = (freqData[i - 1] || 0) / 255;
            const prevY = baseY - (prevVal * 120 * dpr);
            const midX = (prevX + x) / 2;
            const midY = (prevY + y) / 2;
            ctx.quadraticCurveTo(prevX, prevY, midX, midY);
          }
        }

        ctx.lineTo(width, baseY);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, baseY - (120 * dpr), 0, height);
        waveGrad.addColorStop(0, theme.primary);
        waveGrad.addColorStop(0.5, theme.secondary);
        waveGrad.addColorStop(1, 'rgba(6, 9, 18, 0.95)');
        ctx.fillStyle = waveGrad;
        ctx.globalAlpha = 0.55;
        ctx.fill();

        ctx.globalAlpha = 1.0;
        ctx.lineWidth = 3 * dpr;
        ctx.strokeStyle = theme.primary;
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 12 * dpr;
        ctx.stroke();
        ctx.restore();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [isFullscreenVisualizerOpen, analyserNode, isPlaying, mode, themeKey]);

  if (!isFullscreenVisualizerOpen) return null;

  const currentTheme = THEMES[themeKey];
  const isFav = currentSong ? isFavorite(currentSong.id) : false;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="fs-visualizer-overlay"
      onMouseMove={handleUserActivity}
      onTouchStart={handleUserActivity}
      onClick={handleUserActivity}
    >
      {/* 1. Fullscreen Visualizer Canvas */}
      <canvas ref={canvasRef} className="fs-visualizer-canvas" />

      {/* 2. Top Header HUD with Song Info, Mode Switcher, Fullscreen & Close */}
      <div className={`fs-hud-header ${showControls ? 'visible' : 'hidden'}`}>
        <div className="fs-song-meta-box">
          {currentSong?.image && (
            <img src={currentSong.image} alt={currentSong.name} className="fs-header-thumb" />
          )}
          <div className="fs-song-text">
            <h2 className="fs-header-title">{currentSong?.name || 'Sangeetham Music'}</h2>
            <p className="fs-header-artist">{currentSong?.artist || 'Unknown Artist'} • {currentSong?.album || 'Soundtrack'}</p>
          </div>
          <span className="fs-hd-badge">
            <Zap size={12} /> 320kbps HD
          </span>
        </div>

        {/* Action Controls & Style Selectors */}
        <div className="fs-header-actions">
          {/* Preset Visualizer Mode Buttons */}
          <div className="fs-mode-pills">
            <button
              className={`fs-pill-btn ${mode === 'lyrics' ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setMode('lyrics'); }}
              title="Synced Lyrical Video Visualizer"
            >
              <Sparkles size={14} />
              <span className="btn-label-desktop">Lyrics</span>
            </button>
            <button
              className={`fs-pill-btn ${mode === 'burst' ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setMode('burst'); }}
              title="Particle Burst Mode"
            >
              <Zap size={14} />
              <span className="btn-label-desktop">Burst</span>
            </button>
            <button
              className={`fs-pill-btn ${mode === 'galaxy' ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setMode('galaxy'); }}
              title="Cosmic Galaxy Orbit Mode"
            >
              <Radio size={14} />
              <span className="btn-label-desktop">Galaxy</span>
            </button>
            <button
              className={`fs-pill-btn ${mode === 'radial' ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setMode('radial'); }}
              title="Radial Laser Pulse Mode"
            >
              <Layers size={14} />
              <span className="btn-label-desktop">Radial</span>
            </button>
            <button
              className={`fs-pill-btn ${mode === 'wave' ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setMode('wave'); }}
              title="Cosmic Waveform Mode"
            >
              <Palette size={14} />
              <span className="btn-label-desktop">Wave</span>
            </button>
          </div>

          {/* Theme Color Switcher: Monochrome (B&W), Light Grey, and vibrant accents */}
          <div className="fs-theme-selector" title="Color Schemes (including Black & White, Light Grey)">
            {(['monochrome', 'lightgrey', 'cyberpunk', 'sunset', 'violet', 'emerald', 'ocean'] as ColorTheme[]).map((tKey) => (
              <button
                key={tKey}
                className={`fs-theme-dot ${themeKey === tKey ? 'active' : ''}`}
                style={{ backgroundColor: THEMES[tKey].primary }}
                onClick={(e) => { e.stopPropagation(); setThemeKey(tKey); }}
                title={THEMES[tKey].name}
              />
            ))}
          </div>

          {/* Native Fullscreen Button */}
          <button
            className="fs-icon-btn"
            onClick={(e) => { e.stopPropagation(); toggleNativeFullscreen(); }}
            title={isNativeFullscreen ? 'Exit Fullscreen' : 'Native Fullscreen'}
          >
            {isNativeFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {/* Close Visualizer Button */}
          <button
            className="fs-icon-btn fs-close-btn"
            onClick={(e) => { e.stopPropagation(); closeFullscreenVisualizer(); }}
            title="Close Visualizer (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* 3. Center Vinyl Cover Art Disc OR Lyrical Video Stage with Kinetic Animation */}
      {mode === 'lyrics' ? (
        <div className="fs-lyrical-center-stage" onClick={(e) => e.stopPropagation()}>
          {activeLyric && (
            <div
              key={`fs-echo-${activeIndex}`}
              className="lyrical-backdrop-watermark"
              style={{
                opacity: 0.05,
                color: currentTheme.primary
              }}
              aria-hidden="true"
            >
              {activeLyric.text}
            </div>
          )}

          <div className="lyrical-lyrics-stack fs-stack">
            {/* Past Lines */}
            {pastLines.map((line, pIdx) => {
              const distance = pastLines.length - pIdx;
              const opacity = Math.max(0.2, 0.65 - distance * 0.12);
              return (
                <div
                  key={`fs-past-${line.time}-${pIdx}`}
                  className="lyrical-line lyrical-past-line"
                  onClick={() => seek(line.time)}
                  style={{
                    color: currentTheme.secondary,
                    opacity
                  }}
                  title="Click to seek back"
                >
                  <span className="lyric-text">{line.text}</span>
                </div>
              );
            })}

            {/* ACTIVE LINE */}
            {activeLyric ? (
              <div
                key={`fs-active-${activeIndex}`}
                className="lyrical-line lyrical-active-line"
                onClick={() => seek(activeLyric.time)}
                style={{
                  color: currentTheme.primary,
                  textShadow: `0 2px 10px rgba(0, 0, 0, 0.7), 0 0 8px ${currentTheme.primary}40`
                }}
                title="Currently playing"
              >
                <span className="active-lyric-glow-text">{activeLyric.text}</span>
              </div>
            ) : (
              <div
                className="lyrical-line lyrical-active-line intro"
                style={{
                  color: currentTheme.primary,
                  textShadow: `0 2px 10px rgba(0, 0, 0, 0.7), 0 0 8px ${currentTheme.primary}40`
                }}
              >
                <span className="active-lyric-glow-text">{currentSong?.name}</span>
              </div>
            )}

            {/* Future Lines */}
            {futureLines.map((line, fIdx) => {
              const opacity = Math.max(0.18, 0.45 - fIdx * 0.12);
              return (
                <div
                  key={`fs-future-${line.time}-${fIdx}`}
                  className="lyrical-line lyrical-future-line"
                  onClick={() => seek(line.time)}
                  style={{
                    color: currentTheme.secondary,
                    opacity
                  }}
                  title="Click to jump forward"
                >
                  <span className="lyric-text">{line.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="fs-center-orb-wrapper" style={{ pointerEvents: 'none' }}>
          <div
            className="fs-album-art-disc"
            style={{
              backgroundImage: currentSong ? `url(${currentSong.image})` : undefined,
              boxShadow: `0 0 50px ${currentTheme.secondary}, 0 0 100px ${currentTheme.primary}`
            }}
          />
        </div>
      )}

      {/* 4. Bottom Player Controls Dock (Autohiding with idle timer) */}
      <div className={`fs-hud-footer ${showControls ? 'visible' : 'hidden'}`} onClick={(e) => e.stopPropagation()}>
        <div className="fs-controls-glass-card">
          {/* Progress Seek Scrubber */}
          <div className="fs-timeline-row">
            <span className="fs-time-text">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="fs-seek-slider"
              style={{
                background: `linear-gradient(to right, ${currentTheme.primary} ${progressPercent}%, rgba(255, 255, 255, 0.2) ${progressPercent}%)`
              }}
            />
            <span className="fs-time-text">{formatTime(duration)}</span>
          </div>

          {/* Playback Button Controls Row */}
          <div className="fs-buttons-row">
            <div className="fs-left-actions">
              <button
                className={`fs-btn-small ${isShuffle ? 'active' : ''}`}
                onClick={toggleShuffle}
                title="Shuffle"
              >
                <Shuffle size={17} />
              </button>
              {currentSong && (
                <button
                  className={`fs-btn-small ${isFav ? 'is-fav' : ''}`}
                  onClick={() => toggleFavorite(currentSong)}
                  title="Favorite"
                >
                  <Heart size={18} fill={isFav ? '#ff3b30' : 'none'} color={isFav ? '#ff3b30' : 'currentColor'} />
                </button>
              )}
            </div>

            <div className="fs-center-playback">
              <button className="fs-skip-btn" onClick={prevSong} title="Previous Track">
                <SkipBack size={22} />
              </button>
              <button className="fs-play-btn" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause size={24} fill="#fff" /> : <Play size={24} fill="#fff" style={{ marginLeft: 2 }} />}
              </button>
              <button className="fs-skip-btn" onClick={nextSong} title="Next Track">
                <SkipForward size={22} />
              </button>
            </div>

            <div className="fs-right-actions">
              <button
                className={`fs-btn-small ${isLoop ? 'active' : ''}`}
                onClick={toggleLoop}
                title="Loop Track"
              >
                <Repeat size={17} />
              </button>

              <div className="fs-volume-box">
                <button className="fs-btn-small" onClick={toggleMute} title="Mute/Unmute">
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="fs-volume-slider"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

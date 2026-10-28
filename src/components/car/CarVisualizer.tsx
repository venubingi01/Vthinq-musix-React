'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMusic } from '../../context/MusicContext';
import { BarChart3, Activity, Disc, Sparkles, Maximize2, Minimize2 } from 'lucide-react';

export type CarVisualizerStyle = 'bars' | 'waveform' | 'circular' | 'particles';

interface CarVisualizerProps {
  currentStyle: CarVisualizerStyle;
  onStyleChange?: (style: CarVisualizerStyle) => void;
  isVisible: boolean;
  onToggleVisible?: () => void;
  className?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  freqIndex: number;
}

export const CarVisualizer: React.FC<CarVisualizerProps> = ({
  currentStyle,
  onStyleChange,
  isVisible,
  className = '',
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { analyserNode, isPlaying } = useMusic();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (!isVisible || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let isDocumentVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const updateSize = () => {
      if (containerRef.current && canvas) {
        const rect = containerRef.current.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }
    };
    updateSize();

    const resizeObserver = new ResizeObserver(() => updateSize());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 128;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    // Particle system matching normal player sunset palette
    const particles: Particle[] = [];
    const particleCount = isFullscreen ? 80 : 45;
    const sunsetColors = ['#ee0979', '#ff2d55', '#ff6a00', '#ffa040', '#ff5493'];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (canvas.width || 600),
        y: Math.random() * (canvas.height || 300),
        radius: Math.random() * 3 + 1.5,
        speedX: (Math.random() - 0.5) * 1.4,
        speedY: (Math.random() - 0.5) * 1.4,
        color: sunsetColors[i % sunsetColors.length],
        alpha: Math.random() * 0.7 + 0.3,
        freqIndex: Math.floor(Math.random() * 40)
      });
    }

    const render = () => {
      if (!isDocumentVisible) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      let hasRealAudio = false;

      if (analyserNode && isPlaying) {
        analyserNode.getByteFrequencyData(freqData);
        analyserNode.getByteTimeDomainData(timeData);

        let sum = 0;
        for (let i = 0; i < Math.min(64, bufferLength); i++) {
          sum += freqData[i];
        }
        if (sum > 0) hasRealAudio = true;
      }

      // 1. FREQUENCY BARS STYLE (Exact matching normal player: Sunset Magenta/Pink #ee0979 to Radiant Orange #ff6a00)
      if (currentStyle === 'bars') {
        const barCount = isFullscreen ? 56 : 38;
        const totalGap = 3.5 * (barCount - 1);
        const barWidth = Math.max(3, (w - totalGap) / barCount);
        let x = 0;

        for (let i = 0; i < barCount; i++) {
          const progress = i / barCount;
          const dataIdx = Math.floor(progress * (bufferLength * 0.65));
          let magnitude = hasRealAudio ? freqData[dataIdx] / 255 : 0;

          if (!hasRealAudio && isPlaying) {
            // Ambient harmonic audio curve
            const bell = Math.sin(progress * Math.PI);
            magnitude = (Math.sin(Date.now() / 250 + i * 0.28) + 1) * 0.3 * bell + 0.08;
          } else if (!isPlaying) {
            magnitude = 0.04;
          }

          const barHeight = Math.max(6, magnitude * h * 0.92);

          // Sangeetham signature gradient: Deep pink #ee0979 at base to sunset orange #ff6a00 at crest
          const grad = ctx.createLinearGradient(0, h, 0, h - barHeight);
          grad.addColorStop(0, 'rgba(238, 9, 121, 0.95)');
          grad.addColorStop(0.55, '#ff2d55');
          grad.addColorStop(1, '#ff6a00');

          ctx.shadowBlur = isPlaying ? 10 : 0;
          ctx.shadowColor = 'rgba(238, 9, 121, 0.45)';

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, h - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // Radiant golden-orange cap dot matching normal player aesthetic
          ctx.fillStyle = '#ff8800';
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, h - barHeight, Math.min(2.5, barWidth / 2), 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;

          x += barWidth + 3.5;
        }
      }

      // 2. WAVEFORM (OSCILLOSCOPE) STYLE
      else if (currentStyle === 'waveform') {
        ctx.beginPath();
        ctx.lineWidth = isFullscreen ? 4 : 3;
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, '#ee0979');
        grad.addColorStop(0.5, '#ff2d55');
        grad.addColorStop(1, '#ff6a00');
        ctx.strokeStyle = grad;

        const sliceWidth = w / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          let v = hasRealAudio ? timeData[i] / 128.0 : 1.0;
          if (!hasRealAudio && isPlaying) {
            v = 1.0 + Math.sin(Date.now() / 220 + i * 0.12) * 0.25;
          }
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(w, h / 2);
        ctx.shadowBlur = 14;
        ctx.shadowColor = 'rgba(238, 9, 121, 0.65)';
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 3. CIRCULAR SPECTRUM STYLE
      else if (currentStyle === 'circular') {
        const centerX = w / 2;
        const centerY = h / 2;
        const baseRadius = Math.min(centerX, centerY) * 0.52;
        const numRays = 52;

        // Inner glowing orb in sunset tones
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.65, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(238, 9, 121, 0.08)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(238, 9, 121, 0.45)';
        ctx.stroke();

        for (let i = 0; i < numRays; i++) {
          const angle = (i / numRays) * Math.PI * 2;
          const dataIdx = Math.floor((i / numRays) * (bufferLength / 3));
          let val = hasRealAudio ? freqData[dataIdx] / 255 : 0;
          if (!hasRealAudio && isPlaying) {
            val = (Math.sin(Date.now() / 280 + i * 0.32) + 1) * 0.2 + 0.06;
          } else if (!isPlaying) {
            val = 0.04;
          }

          const rayLength = val * (Math.min(centerX, centerY) * 0.45);
          const startX = centerX + Math.cos(angle) * baseRadius;
          const startY = centerY + Math.sin(angle) * baseRadius;
          const endX = centerX + Math.cos(angle) * (baseRadius + rayLength);
          const endY = centerY + Math.sin(angle) * (baseRadius + rayLength);

          const grad = ctx.createLinearGradient(startX, startY, endX, endY);
          grad.addColorStop(0, '#ee0979');
          grad.addColorStop(0.5, '#ff2d55');
          grad.addColorStop(1, '#ff6a00');

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // 4. PARTICLES STYLE
      else if (currentStyle === 'particles') {
        let bassEnergy = 0;
        for (let i = 0; i < 8; i++) {
          bassEnergy += freqData[i] || 0;
        }
        bassEnergy = bassEnergy / (8 * 255);
        if (!hasRealAudio && isPlaying) bassEnergy = 0.28;

        particles.forEach((p) => {
          const pVal = hasRealAudio ? (freqData[p.freqIndex] || 0) / 255 : 0.25;
          const speedMultiplier = 1 + bassEnergy * 2.8;

          p.x += p.speedX * speedMultiplier;
          p.y += p.speedY * speedMultiplier;

          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;

          const currentRadius = p.radius * (1 + pVal * 1.8);

          ctx.beginPath();
          ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.min(1, p.alpha + pVal * 0.5);
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
    };
  }, [isVisible, currentStyle, analyserNode, isPlaying, prefersReducedMotion, isFullscreen]);

  if (!isVisible) return null;

  return (
    <div className={`car-visualizer-container ${isFullscreen ? 'fullscreen' : ''} ${className}`} ref={containerRef}>
      <canvas ref={canvasRef} className="car-visualizer-canvas" />

      {/* Top right fullscreen toggle */}
      {onToggleFullscreen && (
        <button
          className="car-viz-fs-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Visualizer'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Visualizer'}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      )}
    </div>
  );
};

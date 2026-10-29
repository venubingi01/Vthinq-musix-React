'use client';

import React, { useEffect, useRef } from 'react';
import { useMusic } from '../context/MusicContext';

interface VisualizerProps {
  height?: number;
  width?: number;
  barColor?: string;
  theme?: 'silver' | 'neon' | 'custom';
  className?: string;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  height = 44,
  width = 340,
  barColor,
  theme = 'silver',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { analyserNode, isPlaying } = useMusic();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 128;
    const freqData = new Uint8Array(bufferLength);

    let beatThreshold = 180;
    let beatPulse = 0;

    const render = () => {
      animId = requestAnimationFrame(render);

      const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
      const displayW = canvas.clientWidth || width;
      const displayH = canvas.clientHeight || height;

      // Handle HiDPI scaling
      if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
        canvas.width = displayW * dpr;
        canvas.height = displayH * dpr;
      }

      const w = canvas.width;
      const h = canvas.height;

      // Extract frequency data from Web Audio or fluid idle wave
      if (analyserNode && isPlaying) {
        analyserNode.getByteFrequencyData(freqData);
      } else {
        // Natural fluid idle wave identical to desktop
        const time = Date.now() / 360;
        for (let i = 0; i < bufferLength; i++) {
          freqData[i] = isPlaying
            ? Math.max(12, Math.floor(Math.sin(time + i * 0.16) * 32 + 38))
            : Math.max(6, Math.floor(Math.sin(time * 0.6 + i * 0.12) * 12 + 16));
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

      // Render Dense Equalizer Bars across full width matching desktop
      const barWidth = Math.max(2 * dpr, 2.5 * dpr);
      const barGap = Math.max(1.2 * dpr, 1.8 * dpr);
      const slotWidth = barWidth + barGap;
      const barCount = Math.floor(w / slotWidth);
      const startX = (w - (barCount * slotWidth)) / 2;

      for (let i = 0; i < barCount; i++) {
        const normX = i / barCount;
        const freqIdx = Math.min(
          bufferLength - 1,
          Math.floor(Math.pow(normX, 0.82) * (bufferLength * 0.78))
        );
        const rawVal = (freqData[freqIdx] || 0) / 255;
        const curveEnvelope = 0.22 + Math.pow(normX, 0.9) * 0.78;
        const maxBarH = h * 0.86;
        const barH = Math.max(
          4 * dpr,
          rawVal * curveEnvelope * maxBarH + (beatPulse * 8 * dpr * normX)
        );

        const x = startX + i * slotWidth;
        const y = h - barH;

        // Gradient for bars: Silver/White tip -> Light Grey -> Translucent base (matching desktop)
        const barGrad = ctx.createLinearGradient(0, y, 0, h);
        if (barColor) {
          barGrad.addColorStop(0, barColor);
          barGrad.addColorStop(0.5, barColor);
          barGrad.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
        } else {
          barGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          barGrad.addColorStop(0.35, 'rgba(209, 213, 219, 0.65)');
          barGrad.addColorStop(1, 'rgba(156, 163, 175, 0.12)');
        }

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, barWidth, barH, [2 * dpr, 2 * dpr, 0, 0]);
        } else {
          ctx.rect(x, y, barWidth, barH);
        }
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [analyserNode, isPlaying, barColor, width, height, theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`visualizer-canvas ${className}`}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: width,
        height,
        borderRadius: '4px'
      }}
    />
  );
};


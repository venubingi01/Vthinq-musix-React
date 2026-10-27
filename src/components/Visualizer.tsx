'use client';

import React, { useEffect, useRef } from 'react';
import { useMusic } from '../context/MusicContext';

interface VisualizerProps {
  height?: number;
  barColor?: string;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  height = 40,
  barColor = 'rgba(238, 9, 121, 0.85)'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { analyserNode, isPlaying } = useMusic();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationId = requestAnimationFrame(render);

      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      if (analyserNode && isPlaying) {
        analyserNode.getByteFrequencyData(dataArray);
      } else {
        // Idle gentle waveform if paused or Web Audio not yet started
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = isPlaying ? Math.sin(Date.now() / 200 + i) * 20 + 25 : 6;
        }
      }

      // Draw aesthetic gradient bars
      const barCount = 28;
      const barWidth = (width / barCount) - 2;
      let x = 0;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * (bufferLength / 2));
        const value = dataArray[dataIndex] || 0;
        const barHeight = Math.max(3, (value / 255) * h);

        // Dynamic neon gradient
        const gradient = ctx.createLinearGradient(0, h, 0, 0);
        gradient.addColorStop(0, barColor);
        gradient.addColorStop(1, '#ff6a00');

        ctx.fillStyle = gradient;
        // Rounded bars
        ctx.beginPath();
        ctx.roundRect(x, h - barHeight, Math.max(2, barWidth), barHeight, [2, 2, 0, 0]);
        ctx.fill();

        x += barWidth + 2;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyserNode, isPlaying, barColor]);

  return (
    <canvas
      ref={canvasRef}
      width={180}
      height={height}
      className="visualizer-canvas"
      style={{ display: 'block', borderRadius: '4px' }}
    />
  );
};

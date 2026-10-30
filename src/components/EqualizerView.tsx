'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMusic, EQ_BANDS_CONFIG, EQ_PRESETS } from '../context/MusicContext';
import { Visualizer } from './Visualizer';
import { QualityBadge } from './QualityBadge';
import { SpatialMode, AudioQuality } from '../types/music';
import {
  Sliders,
  Sparkles,
  RotateCcw,
  Maximize2,
  Radio,
  Compass,
  Waves,
  Building2,
  Film,
  Mic,
  Volume2,
  Zap,
  CheckCircle2,
  Layers,
  Activity,
  ArrowLeft
} from 'lucide-react';

export interface EqualizerViewProps {
  onBack?: () => void;
  isEmbedded?: boolean;
  carMode?: boolean;
  className?: string;
}

export const EqualizerView: React.FC<EqualizerViewProps> = ({
  onBack,
  isEmbedded = false,
  carMode = false,
  className = ''
}) => {
  const {
    // EQ
    eqEnabled,
    toggleEQ,
    currentPreset,
    preamp,
    setPreamp,
    eqGains,
    setEqBand,
    applyEqPreset,
    resetEQ,

    // Spatial
    spatialEnabled,
    toggleSpatial,
    spatialMode,
    setSpatialMode,
    autoOrbit,
    toggleAutoOrbit,
    orbitSpeed,
    setOrbitSpeed,
    soundstageWidth,
    setSoundstageWidth,
    reverbSize,
    setReverbSize,
    subBass,
    setSubBass,
    radarAngle,
    radarDist,
    setSoundPosition,
    resetSpatial,

    // Quality
    streamQuality,
    setStreamQuality,
    currentSong,

    // Visualizer
    openFullscreenVisualizer
  } = useMusic();

  const [activeTab, setActiveTab] = useState<'eq' | 'spatial' | 'quality'>('eq');
  const eqCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRadarRef = useRef<boolean>(false);

  // --------------------------------------------------------------------------
  // Draw Smooth Bézier EQ Curve Canvas
  // --------------------------------------------------------------------------
  const drawEQCurve = useCallback(() => {
    const canvas = eqCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    }

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Center baseline (0 dB)
    const midY = height / 2;
    ctx.lineWidth = 1 * dpr;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    // Map the 7 bands across log frequencies (20Hz to 20kHz)
    const minF = Math.log10(20);
    const maxF = Math.log10(20000);

    const points: Array<{ x: number; y: number }> = [];

    // Start point at 20Hz
    const firstGain = eqEnabled ? eqGains[0] || 0 : 0;
    points.push({
      x: 0,
      y: midY - (firstGain / 12) * (height * 0.38)
    });

    EQ_BANDS_CONFIG.forEach((b, idx) => {
      const fLog = Math.log10(b.freq);
      const x = ((fLog - minF) / (maxF - minF)) * width;
      const g = eqEnabled ? eqGains[idx] || 0 : 0;
      const y = midY - (g / 12) * (height * 0.38);
      points.push({ x, y });
    });

    // End point at 20kHz
    const lastGain = eqEnabled ? eqGains[eqGains.length - 1] || 0 : 0;
    points.push({
      x: width,
      y: midY - (lastGain / 12) * (height * 0.38)
    });

    // Fill gradient under curve
    const fillGrad = ctx.createLinearGradient(0, 0, 0, height);
    fillGrad.addColorStop(0, 'rgba(255, 45, 85, 0.32)');
    fillGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.16)');
    fillGrad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let k = 0; k < points.length - 1; k++) {
      const p0 = points[k === 0 ? k : k - 1];
      const p1 = points[k];
      const p2 = points[k + 1];
      const p3 = points[k + 2 < points.length ? k + 2 : k + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Smooth stroke
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let m = 0; m < points.length - 1; m++) {
      const pt0 = points[m === 0 ? m : m - 1];
      const pt1 = points[m];
      const pt2 = points[m + 1];
      const pt3 = points[m + 2 < points.length ? m + 2 : m + 1];

      const c1x = pt1.x + (pt2.x - pt0.x) / 6;
      const c1y = pt1.y + (pt2.y - pt0.y) / 6;
      const c2x = pt2.x - (pt3.x - pt1.x) / 6;
      const c2y = pt2.y - (pt3.y - pt1.y) / 6;

      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, pt2.x, pt2.y);
    }

    const strokeGrad = ctx.createLinearGradient(0, 0, width, 0);
    strokeGrad.addColorStop(0, '#ff2d55');
    strokeGrad.addColorStop(0.5, '#00f0ff');
    strokeGrad.addColorStop(1, '#ffc107');

    ctx.lineWidth = 2.5 * dpr;
    ctx.strokeStyle = strokeGrad;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8 * dpr;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Anchor points for 7 bands
    for (let i = 1; i < points.length - 1; i++) {
      const pt = points[i];
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ff2d55';
      ctx.shadowBlur = 6 * dpr;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [eqEnabled, eqGains]);

  useEffect(() => {
    drawEQCurve();
    window.addEventListener('resize', drawEQCurve);
    return () => window.removeEventListener('resize', drawEQCurve);
  }, [drawEQCurve]);

  // --------------------------------------------------------------------------
  // Draw Interactive 3D Spatial Radar Canvas
  // --------------------------------------------------------------------------
  const drawRadar = useCallback(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    }

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.min(width, height) * 0.40;

    ctx.clearRect(0, 0, width, height);

    // Radar Concentric Grid Rings
    const rings = [0.33, 0.66, 1.0];
    rings.forEach((ratio, rIdx) => {
      const r = maxR * ratio;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.08 + rIdx * 0.05})`;
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - maxR, cy);
    ctx.lineTo(cx + maxR, cy);
    ctx.moveTo(cx, cy - maxR);
    ctx.lineTo(cx, cy + maxR);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    // Direction labels
    ctx.font = `${10 * dpr}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FRONT', cx, cy - maxR - 10 * dpr);
    ctx.fillText('REAR', cx, cy + maxR + 10 * dpr);
    ctx.fillText('L', cx - maxR - 10 * dpr, cy);
    ctx.fillText('R', cx + maxR + 10 * dpr, cy);

    // Center Listener Head Avatar with Headphones
    ctx.beginPath();
    ctx.arc(cx, cy, 14 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = '#161b2c';
    ctx.strokeStyle = '#ff2d55';
    ctx.lineWidth = 2 * dpr;
    ctx.shadowColor = '#ff2d55';
    ctx.shadowBlur = 8 * dpr;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Headphone Ear-cups
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(cx - 18 * dpr, cy - 6 * dpr, 4 * dpr, 12 * dpr);
    ctx.fillRect(cx + 14 * dpr, cy - 6 * dpr, 4 * dpr, 12 * dpr);

    // Sound Source Coordinates (Polar to Cartesian)
    const rad = (radarAngle - 90) * (Math.PI / 180);
    const distNorm = Math.min(2.0, radarDist) / 2.0;
    const soundR = maxR * distNorm;
    const sx = cx + Math.cos(rad) * soundR;
    const sy = cy + Math.sin(rad) * soundR;

    // Expanding sound wave pulses
    if (spatialEnabled) {
      const pulseT = (Date.now() % 1600) / 1600;
      for (let w = 0; w < 3; w++) {
        const pOffset = (pulseT + w * 0.33) % 1.0;
        const waveR = (8 + pOffset * 28) * dpr;
        ctx.beginPath();
        ctx.arc(sx, sy, waveR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - pOffset) * 0.4})`;
        ctx.lineWidth = 1.5 * dpr;
        ctx.stroke();
      }
    }

    // Line connecting listener to sound source
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sx, sy);
    ctx.strokeStyle = spatialEnabled ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.setLineDash([4 * dpr, 3 * dpr]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sound Source Orb
    ctx.beginPath();
    ctx.arc(sx, sy, 8 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = spatialEnabled ? '#00f0ff' : '#888888';
    ctx.shadowColor = spatialEnabled ? '#00f0ff' : 'transparent';
    ctx.shadowBlur = 12 * dpr;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Glowing center pip
    ctx.beginPath();
    ctx.arc(sx, sy, 3.5 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }, [radarAngle, radarDist, spatialEnabled]);

  useEffect(() => {
    let animId: number;
    const renderLoop = () => {
      drawRadar();
      animId = requestAnimationFrame(renderLoop);
    };
    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [drawRadar]);

  // Handle Dragging Sound Source on Radar Canvas
  const handleRadarPointer = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = radarCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;

      const rad = Math.atan2(dy, dx);
      const deg = (rad * (180 / Math.PI) + 90 + 360) % 360;
      const maxPixelR = Math.min(rect.width, rect.height) * 0.40;
      const curPixelR = Math.sqrt(dx * dx + dy * dy);
      const dist = (curPixelR / maxPixelR) * 2.0;

      setSoundPosition(deg, dist);
      if (autoOrbit) {
        toggleAutoOrbit(false);
      }
    },
    [autoOrbit, setSoundPosition, toggleAutoOrbit]
  );

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRadarRef.current = true;
    handleRadarPointer(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRadarRef.current) {
      handleRadarPointer(e.clientX, e.clientY);
    }
  };

  const onMouseUp = () => {
    isDraggingRadarRef.current = false;
  };

  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      isDraggingRadarRef.current = true;
      handleRadarPointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDraggingRadarRef.current && e.touches.length > 0) {
      handleRadarPointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchEnd = () => {
    isDraggingRadarRef.current = false;
  };

  return (
    <div
      className={`equalizer-view-container ${isEmbedded ? 'embedded' : ''} ${carMode ? 'car-mode-theme' : ''} ${className}`}
    >
      {/* Header */}
      <div className="eq-header">
        <div className="eq-title-wrap">
          {onBack && (
            <button
              className="eq-back-nav-btn"
              onClick={onBack}
              aria-label="Go back"
              title="Go back"
            >
              <ArrowLeft size={22} />
            </button>
          )}
          <Sliders size={carMode ? 32 : 28} className="text-pink" />
          <div>
            <h1 className="eq-main-title">
              {carMode ? 'Cockpit Audio Studio & Equalizer' : 'Audio Studio & Studio Equalizer'}
            </h1>
            <p className="eq-subtitle">
              {carMode
                ? 'Automotive 3D Spatial Cockpit, Studio EQ & HD Bitrate Engine'
                : 'Hardware-accelerated 7-Band Equalizer, 3D Spatial Audio & HD Bitrate Engine'}
            </p>
          </div>
        </div>

        <div className="eq-header-actions">
          {activeTab === 'eq' && (
            <button className="eq-reset-btn" onClick={resetEQ} title="Reset to Flat Equalizer">
              <RotateCcw size={15} />
              <span>Reset EQ</span>
            </button>
          )}
          {activeTab === 'spatial' && (
            <button className="eq-reset-btn" onClick={resetSpatial} title="Reset Spatial Audio">
              <RotateCcw size={15} />
              <span>Reset 3D</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="eq-studio-tabs-bar">
        <button
          className={`eq-studio-tab-btn ${activeTab === 'eq' ? 'active' : ''}`}
          onClick={() => setActiveTab('eq')}
        >
          <Sliders size={18} />
          <span>Equalizer & Preamp</span>
          {eqEnabled && <span className="eq-tab-badge">ON</span>}
        </button>

        <button
          className={`eq-studio-tab-btn ${activeTab === 'spatial' ? 'active' : ''}`}
          onClick={() => setActiveTab('spatial')}
        >
          <Radio size={18} />
          <span>3D Surround Spatial</span>
          {spatialEnabled && <span className="eq-tab-badge spatial-badge">3D ON</span>}
        </button>

        <button
          className={`eq-studio-tab-btn ${activeTab === 'quality' ? 'active' : ''}`}
          onClick={() => setActiveTab('quality')}
        >
          <Zap size={18} />
          <span>Audio Quality</span>
          <span className="eq-tab-badge quality-badge-tab">
            {streamQuality === '320' ? 'HD' : streamQuality === '160' ? 'HQ' : 'SD'}
          </span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: 7-BAND EQUALIZER & PREAMP                                    */}
      {/* =================================================================== */}
      {activeTab === 'eq' && (
        <div className="eq-tab-panel">
          {/* Master EQ Power Switch & Preamp Control */}
          <div className="eq-master-control-card">
            <div className="eq-master-header">
              <div className="eq-master-info">
                <div className={`eq-status-indicator ${eqEnabled ? 'active' : ''}`} />
                <div>
                  <h3 className="eq-master-title">Master Equalizer Processing</h3>
                  <p className="eq-master-desc">
                    {eqEnabled ? 'Active: Web Audio Biquad filter processing enabled' : 'Bypassed: Audio passes unmodified'}
                  </p>
                </div>
              </div>

              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={eqEnabled}
                  onChange={(e) => toggleEQ(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Preamp Gain Slider */}
            <div className="eq-preamp-row">
              <div className="eq-preamp-label-group">
                <Volume2 size={18} className="text-cyan" />
                <span className="eq-preamp-title">Preamp Gain</span>
                <span className="eq-preamp-badge">
                  {preamp > 0 ? `+${preamp}` : preamp} dB
                </span>
              </div>
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={preamp}
                onChange={(e) => setPreamp(parseFloat(e.target.value))}
                className="eq-preamp-slider"
                aria-label="Preamp Gain"
              />
            </div>
          </div>

          {/* Interactive Bézier Curve & Live Visualizer Hero Card */}
          <div className="eq-visualizer-card">
            <div className="eq-visualizer-label">
              <div className="eq-viz-title-group">
                <Activity size={16} className="text-cyan" />
                <span>Curved Frequency Response (60Hz – 14kHz)</span>
              </div>
              <button
                className="eq-open-fs-btn"
                onClick={openFullscreenVisualizer}
                title="Launch Fullscreen Particle Visualizer"
              >
                <Maximize2 size={13} />
                <span>Fullscreen Spectrum</span>
              </button>
            </div>

            <div className="eq-curves-container">
              {/* Bézier Frequency Curve Canvas */}
              <canvas
                ref={eqCanvasRef}
                className="eq-bezier-canvas"
                height={140}
              />
              {/* Visualizer Spectrum Bars */}
              <div
                className="eq-visualizer-frame"
                onClick={openFullscreenVisualizer}
                title="Click to launch Fullscreen Visualizer"
              >
                <Visualizer height={60} barColor="rgba(0, 240, 255, 0.85)" />
              </div>
            </div>
          </div>

          {/* 15 Sound Presets */}
          <div className="eq-section-block">
            <div className="eq-block-header">
              <h2 className="eq-block-title">Acoustic Presets (15 Curated Curves)</h2>
              <span className="eq-active-preset-tag">
                Active: <strong>{EQ_PRESETS[currentPreset]?.name || 'Custom'}</strong>
              </span>
            </div>

            <div className="eq-presets-grid">
              {Object.entries(EQ_PRESETS).map(([key, preset]) => {
                const isSelected = currentPreset === key;
                return (
                  <button
                    key={key}
                    className={`eq-preset-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => applyEqPreset(key)}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7-Band Vertical Faders */}
          <div className="eq-section-block">
            <h2 className="eq-block-title">7-Band Hardware Studio Faders (-12dB to +12dB)</h2>
            <div className="eq-7band-faders-grid">
              {EQ_BANDS_CONFIG.map((band, index) => {
                const gain = eqGains[index] ?? 0;
                return (
                  <div key={band.label} className="fader-column">
                    <span className="fader-db">
                      {gain > 0 ? `+${gain}` : gain} dB
                    </span>
                    <div className="fader-track">
                      <input
                        type="range"
                        min={-12}
                        max={12}
                        step={0.5}
                        value={gain}
                        disabled={!eqEnabled}
                        onChange={(e) => setEqBand(index, parseFloat(e.target.value))}
                        className="vertical-fader-input"
                        aria-label={band.label}
                      />
                    </div>
                    <span className="fader-label">{band.label}</span>
                    <span className="fader-sublabel">{band.type === 'peaking' ? 'Peak' : band.type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: 3D SURROUND SPATIAL AUDIO                                    */}
      {/* =================================================================== */}
      {activeTab === 'spatial' && (
        <div className="eq-tab-panel">
          {/* Master 3D Spatial Switch */}
          <div className="eq-master-control-card">
            <div className="eq-master-header">
              <div className="eq-master-info">
                <div className={`eq-status-indicator spatial ${spatialEnabled ? 'active' : ''}`} />
                <div>
                  <h3 className="eq-master-title">3D Binaural Spatial Audio Engine</h3>
                  <p className="eq-master-desc">
                    {spatialEnabled
                      ? 'Surround Enabled: HRTF 3D panning, binaural Haas widening, and impulse reverb active'
                      : 'Stereo Pass-through: Standard left-right stereo output'}
                  </p>
                </div>
              </div>

              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={spatialEnabled}
                  onChange={(e) => toggleSpatial(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          {/* 5 Spatial Modes Grid */}
          <div className="spatial-modes-grid">
            {/* Mode 1: Orbit */}
            <div
              className={`spatial-mode-card ${spatialMode === 'orbit' ? 'active' : ''}`}
              onClick={() => {
                setSpatialMode('orbit');
                if (!spatialEnabled) toggleSpatial(true);
              }}
            >
              <div className="spatial-card-icon">
                <Compass size={22} />
              </div>
              <h4>360° Dynamic Orbit</h4>
              <p>Rotates virtual sound source continuously around your head</p>
              {spatialMode === 'orbit' && <div className="spatial-mode-check"><CheckCircle2 size={16} /></div>}
            </div>

            {/* Mode 2: Wide */}
            <div
              className={`spatial-mode-card ${spatialMode === 'wide' ? 'active' : ''}`}
              onClick={() => {
                setSpatialMode('wide');
                if (!spatialEnabled) toggleSpatial(true);
              }}
            >
              <div className="spatial-card-icon">
                <Waves size={22} />
              </div>
              <h4>Holographic Wide</h4>
              <p>Expanded stereo soundstage with Haas binaural micro-delay</p>
              {spatialMode === 'wide' && <div className="spatial-mode-check"><CheckCircle2 size={16} /></div>}
            </div>

            {/* Mode 3: Concert Hall */}
            <div
              className={`spatial-mode-card ${spatialMode === 'hall' ? 'active' : ''}`}
              onClick={() => {
                setSpatialMode('hall');
                if (!spatialEnabled) toggleSpatial(true);
              }}
            >
              <div className="spatial-card-icon">
                <Building2 size={22} />
              </div>
              <h4>Concert Hall Reverb</h4>
              <p>Simulates grand acoustic hall reflections via synthetic impulse convolution</p>
              {spatialMode === 'hall' && <div className="spatial-mode-check"><CheckCircle2 size={16} /></div>}
            </div>

            {/* Mode 4: Dolby Cinema */}
            <div
              className={`spatial-mode-card ${spatialMode === 'cinema' ? 'active' : ''}`}
              onClick={() => {
                setSpatialMode('cinema');
                if (!spatialEnabled) toggleSpatial(true);
              }}
            >
              <div className="spatial-card-icon">
                <Film size={22} />
              </div>
              <h4>Dolby Cinema</h4>
              <p>Movie theatre acoustics with ultra-wide soundstage and subwoofer bass</p>
              {spatialMode === 'cinema' && <div className="spatial-mode-check"><CheckCircle2 size={16} /></div>}
            </div>

            {/* Mode 5: Vocal Focus */}
            <div
              className={`spatial-mode-card ${spatialMode === 'vocal' ? 'active' : ''}`}
              onClick={() => {
                setSpatialMode('vocal');
                if (!spatialEnabled) toggleSpatial(true);
              }}
            >
              <div className="spatial-card-icon">
                <Mic size={22} />
              </div>
              <h4>Vocal Focus</h4>
              <p>Centers lead vocals forward with gentle ambient depth</p>
              {spatialMode === 'vocal' && <div className="spatial-mode-check"><CheckCircle2 size={16} /></div>}
            </div>
          </div>

          {/* Interactive 3D Spatial Radar Visualizer & HUD */}
          <div className="spatial-radar-card">
            <div className="spatial-radar-header">
              <div className="spatial-radar-hud">
                <Radio size={18} className="text-cyan" />
                <span className="radar-title">Interactive 3D Acoustic Radar</span>
                <span className="radar-coords">
                  Angle: {Math.round(radarAngle)}° • Dist: {radarDist.toFixed(1)}m
                </span>
              </div>

              <button
                className={`radar-orbit-toggle-btn ${autoOrbit ? 'active' : ''}`}
                onClick={() => toggleAutoOrbit()}
              >
                <Compass size={14} className={autoOrbit ? 'spin-icon' : ''} />
                <span>Auto-Orbit {autoOrbit ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Canvas */}
            <div className="radar-canvas-container">
              <canvas
                ref={radarCanvasRef}
                className="radar-canvas"
                height={260}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              />
              <p className="radar-instruction">
                Drag the glowing sound source orb to reposition virtual 3D coordinates in real-time
              </p>
            </div>
          </div>

          {/* Spatial Fine-Tuning Parameters */}
          <div className="spatial-sliders-grid">
            {/* Auto Orbit Speed */}
            <div className="spatial-slider-box">
              <div className="spatial-slider-meta">
                <span className="slider-label">Auto-Orbit Speed</span>
                <span className="slider-val">{orbitSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={3.0}
                step={0.1}
                value={orbitSpeed}
                onChange={(e) => setOrbitSpeed(parseFloat(e.target.value))}
                className="spatial-param-range"
              />
            </div>

            {/* Soundstage Width */}
            <div className="spatial-slider-box">
              <div className="spatial-slider-meta">
                <span className="slider-label">Soundstage Width</span>
                <span className="slider-val">{soundstageWidth}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={soundstageWidth}
                onChange={(e) => setSoundstageWidth(parseInt(e.target.value, 10))}
                className="spatial-param-range"
              />
            </div>

            {/* Room Reverb Size */}
            <div className="spatial-slider-box">
              <div className="spatial-slider-meta">
                <span className="slider-label">Concert Reverb Size</span>
                <span className="slider-val">{reverbSize}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={reverbSize}
                onChange={(e) => setReverbSize(parseInt(e.target.value, 10))}
                className="spatial-param-range"
              />
            </div>

            {/* Sub-Bass Immersion */}
            <div className="spatial-slider-box">
              <div className="spatial-slider-meta">
                <span className="slider-label">Sub-Bass Immersion</span>
                <span className="slider-val">+{subBass} dB</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={subBass}
                onChange={(e) => setSubBass(parseFloat(e.target.value))}
                className="spatial-param-range"
              />
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: AUDIO STREAMING QUALITY                                      */}
      {/* =================================================================== */}
      {activeTab === 'quality' && (
        <div className="eq-tab-panel">
          <div className="quality-settings-hero">
            <Zap size={24} className="text-orange" />
            <div>
              <h3>Audio Streaming Quality & Bitrate Settings</h3>
              <p>
                Seamless real-time bitrate switching. Automatically saves preference and updates
                cover artwork badges throughout the application.
              </p>
            </div>
          </div>

          <div className="quality-cards-grid">
            {/* 320kbps HD */}
            <div
              className={`quality-option-card ${streamQuality === '320' ? 'active' : ''}`}
              onClick={() => setStreamQuality('320')}
            >
              <div className="quality-card-top">
                <span className="quality-badge quality-badge-lg quality-badge-hd">
                  <span className="quality-badge-text">HD</span>
                </span>
                <span className="quality-bitrate-title">320kbps Ultra HD</span>
                {streamQuality === '320' && (
                  <CheckCircle2 size={20} className="quality-check-icon" />
                )}
              </div>
              <p className="quality-card-desc">
                Studio master bitrate. Maximum dynamic range, crisp high frequencies, and full
                acoustic clarity.
              </p>
              <div className="quality-card-foot">
                <span className="quality-spec">Stereo • AAC 320 kbps</span>
                <span className="quality-label-tag hd-tag">Badge: HD</span>
              </div>
            </div>

            {/* 160kbps HQ */}
            <div
              className={`quality-option-card ${streamQuality === '160' ? 'active' : ''}`}
              onClick={() => setStreamQuality('160')}
            >
              <div className="quality-card-top">
                <span className="quality-badge quality-badge-lg quality-badge-hq">
                  <span className="quality-badge-text">HQ</span>
                </span>
                <span className="quality-bitrate-title">160kbps High Quality</span>
                {streamQuality === '160' && (
                  <CheckCircle2 size={20} className="quality-check-icon" />
                )}
              </div>
              <p className="quality-card-desc">
                High-definition balanced profile. Rich stereo sound with optimized data consumption
                for cellular streaming.
              </p>
              <div className="quality-card-foot">
                <span className="quality-spec">Stereo • AAC 160 kbps</span>
                <span className="quality-label-tag hq-tag">Badge: HQ</span>
              </div>
            </div>

            {/* 96kbps SD */}
            <div
              className={`quality-option-card ${streamQuality === '96' ? 'active' : ''}`}
              onClick={() => setStreamQuality('96')}
            >
              <div className="quality-card-top">
                <span className="quality-badge quality-badge-lg quality-badge-sd">
                  <span className="quality-badge-text">SD</span>
                </span>
                <span className="quality-bitrate-title">96kbps Data Saver</span>
                {streamQuality === '96' && (
                  <CheckCircle2 size={20} className="quality-check-icon" />
                )}
              </div>
              <p className="quality-card-desc">
                Standard definition bandwidth-friendly profile. Fastest buffer times on low
                connectivity networks.
              </p>
              <div className="quality-card-foot">
                <span className="quality-spec">Stereo • AAC 96 kbps</span>
                <span className="quality-label-tag sd-tag">Badge: SD</span>
              </div>
            </div>
          </div>

          {/* Now Playing Quality Preview */}
          {currentSong && (
            <div className="current-quality-preview-card">
              <div className="current-preview-cover-box">
                <img
                  src={currentSong.image}
                  alt={currentSong.name}
                  className="current-preview-cover"
                />
                <QualityBadge
                  song={currentSong}
                  size="md"
                  className="current-preview-badge-overlay"
                />
              </div>

              <div className="current-preview-details">
                <span className="preview-label">Currently Playing Stream</span>
                <h4 className="preview-song-name">{currentSong.name}</h4>
                <p className="preview-song-artist">{currentSong.artist} • {currentSong.album}</p>
                <div className="preview-meta-row">
                  <span className="preview-stream-tag">
                    Active Quality: {currentSong.quality || `${streamQuality}kbps`}
                  </span>
                  <span className="preview-url-tag">
                    {currentSong.url?.includes('_320') ? '320kbps Master Stream' : currentSong.url?.includes('_160') ? '160kbps High Quality Stream' : 'Standard Stream'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

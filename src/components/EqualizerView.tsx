'use client';

import React from 'react';
import { useMusic } from '../context/MusicContext';
import { Visualizer } from './Visualizer';
import { Sliders, Volume2, Sparkles, RotateCcw, Maximize2 } from 'lucide-react';

interface Preset {
  name: string;
  gains: number[];
}

const PRESETS: Preset[] = [
  { name: 'Flat', gains: [0, 0, 0, 0, 0] },
  { name: 'Bass Boost', gains: [7, 5, 0, 1, 3] },
  { name: 'Vocal Pop', gains: [-2, 2, 6, 4, 1] },
  { name: 'Electronic', gains: [6, 4, 1, 4, 5] },
  { name: 'Rock', gains: [5, 2, -1, 3, 5] },
  { name: 'Acoustic', gains: [3, 2, 1, 3, 2] }
];

const BAND_LABELS = ['60 Hz', '250 Hz', '1 kHz', '4 kHz', '12 kHz'];

export const EqualizerView: React.FC = () => {
  const {
    eqGains,
    setEqBand,
    applyEqPreset,
    bassBoost,
    setBassBoost,
    spatial3D,
    setSpatial3D,
    openFullscreenVisualizer
  } = useMusic();

  const handleReset = () => {
    applyEqPreset([0, 0, 0, 0, 0]);
    setBassBoost(0);
    setSpatial3D(false);
  };

  return (
    <div className="equalizer-view-container">
      <div className="eq-header">
        <div className="eq-title-wrap">
          <Sliders size={26} className="text-pink" />
          <div>
            <h1 className="eq-main-title">Audio Studio & Equalizer</h1>
            <p className="eq-subtitle">Hardware-accelerated Web Audio API sound processing</p>
          </div>
        </div>

        <button className="eq-reset-btn" onClick={handleReset} title="Reset to Flat">
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
      </div>

      {/* Visualizer Hero card */}
      <div className="eq-visualizer-card">
        <div className="eq-visualizer-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={16} className="text-orange sparkle-icon" />
            <span>Live Frequency Spectrum</span>
          </div>
          <button
            className="eq-open-fs-btn"
            onClick={openFullscreenVisualizer}
            title="Launch Fullscreen Particle Visualizer"
          >
            <Maximize2 size={13} />
            <span>Fullscreen Visualizer</span>
          </button>
        </div>
        <div
          className="eq-visualizer-frame"
          onClick={openFullscreenVisualizer}
          title="Click to launch Fullscreen Visualizer"
          style={{ cursor: 'pointer' }}
        >
          <Visualizer height={70} barColor="rgba(238, 9, 121, 0.95)" />
        </div>
      </div>

      {/* Presets Grid */}
      <div className="eq-section-block">
        <h2 className="eq-block-title">Sound Presets</h2>
        <div className="eq-presets-grid">
          {PRESETS.map((preset) => {
            const isSelected =
              JSON.stringify(eqGains) === JSON.stringify(preset.gains);

            return (
              <button
                key={preset.name}
                className={`eq-preset-chip ${isSelected ? 'active' : ''}`}
                onClick={() => applyEqPreset(preset.gains)}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5-Band Slider Faders */}
      <div className="eq-section-block">
        <h2 className="eq-block-title">5-Band Equalizer (-12dB to +12dB)</h2>
        <div className="eq-faders-grid">
          {eqGains.map((gain, index) => (
            <div key={BAND_LABELS[index]} className="fader-column">
              <span className="fader-db">
                {gain > 0 ? `+${gain}` : gain} dB
              </span>
              <div className="fader-track">
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={1}
                  value={gain}
                  onChange={(e) => setEqBand(index, parseInt(e.target.value, 10))}
                  className="vertical-fader-input"
                  aria-label={BAND_LABELS[index]}
                />
              </div>
              <span className="fader-label">{BAND_LABELS[index]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Enhancements: Bass Boost & 3D Spatial Audio */}
      <div className="eq-enhancements-grid">
        <div className="enhancement-card">
          <div className="enhancement-header">
            <Volume2 size={20} className="text-pink" />
            <div>
              <h3>Bass Boost</h3>
              <p>Sub-woofer gain enhancement</p>
            </div>
            <span className="enhancement-val">+{bassBoost} dB</span>
          </div>
          <input
            type="range"
            min={0}
            max={15}
            step={1}
            value={bassBoost}
            onChange={(e) => setBassBoost(parseInt(e.target.value, 10))}
            className="enhancement-slider"
            aria-label="Bass boost"
          />
        </div>

        <div className="enhancement-card">
          <div className="enhancement-header">
            <Sparkles size={20} className="text-orange" />
            <div>
              <h3>3D Spatial Audio</h3>
              <p>Surround stereo soundstage</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={spatial3D}
                onChange={(e) => setSpatial3D(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

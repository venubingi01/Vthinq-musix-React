'use client';

import React, { useState } from 'react';
import { useMusic } from '../../context/MusicContext';
import { RotateCcw, ArrowLeft, Volume2, Sparkles, Check } from 'lucide-react';

export interface CarEqPreset {
  name: string;
  gains: number[];
  bassBoost?: number;
}

export const CAR_EQ_PRESETS: CarEqPreset[] = [
  { name: 'Normal', gains: [0, 0, 0, 0, 0], bassBoost: 0 },
  { name: 'Rock', gains: [5, 2, -1, 3, 5], bassBoost: 3 },
  { name: 'Pop', gains: [-2, 2, 6, 4, 1], bassBoost: 2 },
  { name: 'Jazz', gains: [3, 2, 0, 2, 4], bassBoost: 1 },
  { name: 'Classical', gains: [4, 2, 0, 2, 5], bassBoost: 0 },
  { name: 'Bass Boost', gains: [8, 6, 1, 1, 3], bassBoost: 8 }
];

// Display 10 frequency bands matching Screen 5: 32, 64, 125, 250, 500, 1K, 2K, 4K, 8K, 16K
const DISPLAY_BANDS = [
  { label: '32', hardwareIdx: 0 },
  { label: '64', hardwareIdx: 0 },
  { label: '125', hardwareIdx: 1 },
  { label: '250', hardwareIdx: 1 },
  { label: '500', hardwareIdx: 2 },
  { label: '1K', hardwareIdx: 2 },
  { label: '2K', hardwareIdx: 3 },
  { label: '4K', hardwareIdx: 3 },
  { label: '8K', hardwareIdx: 4 },
  { label: '16K', hardwareIdx: 4 }
];

interface CarEqualizerProps {
  onBack?: () => void;
  isEmbedded?: boolean;
}

export const CarEqualizerModal: React.FC<CarEqualizerProps> = ({ onBack, isEmbedded = false }) => {
  const {
    eqGains,
    setEqBand,
    applyEqPreset,
    bassBoost,
    setBassBoost,
    spatial3D,
    setSpatial3D
  } = useMusic();

  const [isEqOn, setIsEqOn] = useState<boolean>(true);
  const [tenBandGains, setTenBandGains] = useState<number[]>([
    4, 3, 1, -2, -1, 0, 2, 4, 3, 1
  ]);

  const handleReset = () => {
    applyEqPreset([0, 0, 0, 0, 0]);
    setTenBandGains([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setBassBoost(0);
    setSpatial3D(false);
  };

  const handlePresetSelect = (preset: CarEqPreset) => {
    applyEqPreset(preset.gains);
    if (preset.bassBoost !== undefined) {
      setBassBoost(preset.bassBoost);
    }
    // Interpolate 5 hardware bands to 10 visual bands
    setTenBandGains([
      preset.gains[0],
      preset.gains[0],
      preset.gains[1],
      preset.gains[1],
      preset.gains[2],
      preset.gains[2],
      preset.gains[3],
      preset.gains[3],
      preset.gains[4],
      preset.gains[4]
    ]);
  };

  const handleSliderChange = (displayIdx: number, val: number) => {
    const next = [...tenBandGains];
    next[displayIdx] = val;
    setTenBandGains(next);

    // Map to underlying 5 hardware filter nodes
    const hwIdx = DISPLAY_BANDS[displayIdx].hardwareIdx;
    setEqBand(hwIdx, val);
  };

  return (
    <div className={`car-eq-view-screen5 ${isEmbedded ? 'embedded' : ''}`}>
      {/* Top Header Row matching Screen 5: ← Equalizer | EQ On [toggle] */}
      <div className="car-eq-header-screen5">
        <div className="car-eq-header-left">
          {onBack && (
            <button className="car-back-arrow-btn" onClick={onBack} aria-label="Go back to player">
              <ArrowLeft size={24} />
            </button>
          )}
          <h2 className="car-eq-screen5-title">Equalizer</h2>
        </div>

        <div className="car-eq-header-right">
          <div className="car-eq-toggle-wrap">
            <span className="car-eq-toggle-text">EQ On</span>
            <button
              className={`car-switch-pill ${isEqOn ? 'active' : ''}`}
              onClick={() => setIsEqOn(!isEqOn)}
              role="switch"
              aria-checked={isEqOn}
              aria-label="Toggle Equalizer On/Off"
            >
              <div className="car-switch-handle" />
            </button>
          </div>
        </div>
      </div>

      {/* Preset Chips Row: Normal, Rock, Pop, Jazz, Classical, Bass Boost */}
      <div className="car-eq-presets-screen5" role="radiogroup" aria-label="Equalizer Presets">
        {CAR_EQ_PRESETS.map((preset) => {
          const isSelected = JSON.stringify(eqGains) === JSON.stringify(preset.gains);
          return (
            <button
              key={preset.name}
              className={`car-eq-preset-chip-screen5 ${isSelected ? 'active' : ''}`}
              onClick={() => handlePresetSelect(preset)}
              role="radio"
              aria-checked={isSelected}
            >
              {preset.name}
            </button>
          );
        })}
      </div>

      {/* 10-Band Sliders Grid matching Screen 5 */}
      <div className="car-eq-faders-screen5">
        <div className="car-eq-sliders-row-screen5">
          {DISPLAY_BANDS.map((band, idx) => {
            const gain = tenBandGains[idx] ?? 0;
            return (
              <div key={`${band.label}-${idx}`} className="car-fader-col-screen5">
                <span className="car-fader-label-top">{band.label}</span>
                <div className="car-fader-track-screen5">
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={gain}
                    onChange={(e) => handleSliderChange(idx, parseInt(e.target.value, 10))}
                    className="car-v-slider-screen5"
                    aria-label={`${band.label} Hz gain`}
                  />
                </div>
                <span className="car-fader-db-screen5">
                  {gain > 0 ? `+${gain}` : gain}
                </span>
              </div>
            );
          })}
        </div>

        {/* Reset Button on the right (Screen 5) */}
        <div className="car-eq-reset-col-screen5">
          <button
            className="car-eq-reset-btn-screen5"
            onClick={handleReset}
            title="Reset Equalizer to Flat"
            aria-label="Reset Equalizer"
          >
            <RotateCcw size={22} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Subwoofer & Spatial Audio Enhancements */}
      <div className="car-eq-enhancements-subrow">
        <div className="car-enhancement-chip">
          <Volume2 size={18} className="text-electric-blue" />
          <span>Subwoofer Bass Boost: +{bassBoost} dB</span>
          <input
            type="range"
            min={0}
            max={15}
            step={1}
            value={bassBoost}
            onChange={(e) => setBassBoost(parseInt(e.target.value, 10))}
            className="car-h-slider-mini"
            aria-label="Subwoofer Bass Boost"
          />
        </div>

        <div className="car-enhancement-chip">
          <Sparkles size={18} className="text-neon-purple" />
          <span>3D Cockpit Surround:</span>
          <button
            className={`car-spatial-toggle ${spatial3D ? 'on' : 'off'}`}
            onClick={() => setSpatial3D(!spatial3D)}
            role="switch"
            aria-checked={spatial3D}
          >
            {spatial3D ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};

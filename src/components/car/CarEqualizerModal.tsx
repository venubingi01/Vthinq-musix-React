'use client';

import React from 'react';
import { EqualizerView } from '../EqualizerView';

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

export interface CarEqualizerProps {
  onBack?: () => void;
  isEmbedded?: boolean;
}

export const CarEqualizerModal: React.FC<CarEqualizerProps> = ({ onBack, isEmbedded = false }) => {
  return (
    <div className={`car-eq-view-screen5 ${isEmbedded ? 'embedded' : ''}`}>
      <EqualizerView carMode={true} isEmbedded={true} onBack={onBack} />
    </div>
  );
};

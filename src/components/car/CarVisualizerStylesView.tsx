'use client';

import React from 'react';
import type { CarVisualizerStyle } from './CarVisualizer';
import { BarChart3, Activity, Disc, Sparkles, Check } from 'lucide-react';

interface CarVisualizerStylesViewProps {
  currentStyle: CarVisualizerStyle;
  onStyleSelect: (style: CarVisualizerStyle) => void;
  isVisualizerOn: boolean;
  onToggleVisualizer: () => void;
}

interface StyleCardItem {
  id: CarVisualizerStyle;
  name: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  gradient: string;
}

const STYLES: StyleCardItem[] = [
  {
    id: 'bars',
    name: 'Bars',
    desc: 'Sunset pink to orange frequency bars',
    icon: BarChart3,
    gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)'
  },
  {
    id: 'waveform',
    name: 'Waveform',
    desc: 'Sunset ribbon oscilloscope wave',
    icon: Activity,
    gradient: 'linear-gradient(135deg, #ee0979 0%, #ff2d55 50%, #ff6a00 100%)'
  },
  {
    id: 'circular',
    name: 'Circle',
    desc: 'Glowing radial spectrum ring',
    icon: Disc,
    gradient: 'radial-gradient(circle, #ee0979 0%, #ff6a00 70%, transparent 100%)'
  },
  {
    id: 'particles',
    name: 'Particles',
    desc: 'Sunset glowing particle burst',
    icon: Sparkles,
    gradient: 'radial-gradient(circle, #ff2d55 0%, #ee0979 60%, #ff6a00 100%)'
  }
];

export const CarVisualizerStylesView: React.FC<CarVisualizerStylesViewProps> = ({
  currentStyle,
  onStyleSelect,
  isVisualizerOn,
  onToggleVisualizer
}) => {
  return (
    <div className="car-viz-styles-view">
      {/* Header with Visualizer On toggle switch (Screen 4) */}
      <div className="car-viz-header-row">
        <h2 className="car-viz-main-title">Visualizer Style</h2>

        <div className="car-viz-toggle-wrap">
          <span className="car-viz-toggle-label">Visualizer On</span>
          <button
            className={`car-switch-pill ${isVisualizerOn ? 'active' : ''}`}
            onClick={onToggleVisualizer}
            role="switch"
            aria-checked={isVisualizerOn}
            aria-label="Toggle visualizer on or off"
          >
            <div className="car-switch-handle" />
          </button>
        </div>
      </div>

      {/* 4 Visualizer Style Cards */}
      <div className="car-viz-cards-grid">
        {STYLES.map((style) => {
          const isSelected = currentStyle === style.id;
          const Icon = style.icon;

          return (
            <div
              key={style.id}
              className={`car-viz-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onStyleSelect(style.id)}
              role="button"
              tabIndex={0}
              aria-label={`Select ${style.name} visualizer`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onStyleSelect(style.id);
                }
              }}
            >
              <div className="car-viz-card-preview" style={{ background: 'rgba(10, 15, 26, 0.8)' }}>
                {/* Visualizer Style Preview Graphics */}
                {style.id === 'bars' && (
                  <div className="preview-bars-wrap">
                    <div className="pb-bar b1" />
                    <div className="pb-bar b2" />
                    <div className="pb-bar b3" />
                    <div className="pb-bar b4" />
                    <div className="pb-bar b5" />
                    <div className="pb-bar b6" />
                    <div className="pb-bar b7" />
                  </div>
                )}

                {style.id === 'waveform' && (
                  <div className="preview-wave-wrap">
                    <svg viewBox="0 0 160 60" className="preview-wave-svg">
                      <path
                        d="M 10 30 Q 40 5, 80 30 T 150 30"
                        fill="none"
                        stroke="url(#previewGrad)"
                        strokeWidth="4"
                      />
                      <defs>
                        <linearGradient id="previewGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ee0979" />
                          <stop offset="50%" stopColor="#ff2d55" />
                          <stop offset="100%" stopColor="#ff6a00" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )}

                {style.id === 'circular' && (
                  <div className="preview-circle-wrap">
                    <div className="preview-circle-core" />
                  </div>
                )}

                {style.id === 'particles' && (
                  <div className="preview-particles-wrap">
                    <div className="p-dot d1" />
                    <div className="p-dot d2" />
                    <div className="p-dot d3" />
                    <div className="p-dot d4" />
                    <div className="p-dot d5" />
                    <div className="p-dot d6" />
                  </div>
                )}

                {isSelected && (
                  <div className="car-viz-check-badge">
                    <Check size={16} />
                  </div>
                )}
              </div>

              <div className="car-viz-card-info">
                <div className="car-viz-card-header">
                  <Icon size={18} className="car-viz-card-icon" />
                  <span className="car-viz-card-name">{style.name}</span>
                </div>
                <span className="car-viz-card-desc">{style.desc}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

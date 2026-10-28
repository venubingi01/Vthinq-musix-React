'use client';

import React from 'react';
import { Mic, X, ChevronRight } from 'lucide-react';
import type { VoiceStatus } from '../../services/voiceCommandService';

interface CarVoiceOverlayProps {
  status: VoiceStatus;
  transcript: string;
  onCancel: () => void;
  onQuickCommand?: (cmd: string) => void;
}

const SAMPLE_COMMANDS = [
  'Play Kesariya',
  'Play Arijit Singh songs',
  'Next song',
  'Previous song',
  'Pause music',
  'Show visualizer',
  'Open equalizer'
];

export const CarVoiceOverlay: React.FC<CarVoiceOverlayProps> = ({
  status,
  transcript,
  onCancel,
  onQuickCommand
}) => {
  if (status !== 'listening' && status !== 'processing') return null;

  return (
    <div className="car-voice-screen2-overlay" role="dialog" aria-modal="true" aria-label="Voice Command Active">
      {/* Top right Cancel Button */}
      <button className="car-voice-cancel-top-btn" onClick={onCancel} aria-label="Cancel voice command">
        <X size={18} />
        <span>Cancel</span>
      </button>

      <div className="car-voice-screen2-content">
        {/* Center: Glowing Pulse Orb & Waveform */}
        <div className="car-voice-orb-section">
          <div className="car-voice-giant-orb">
            <div className="car-voice-orb-glow-ring" />
            <div className="car-voice-orb-inner">
              <Mic size={54} className="car-voice-orb-mic-icon" />
            </div>
          </div>

          <h2 className="car-voice-listening-title">
            {status === 'processing' ? 'Processing...' : 'Listening...'}
          </h2>

          {/* Animated Audio Waveform beneath Orb */}
          <div className="car-voice-waveform-bars">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="car-voice-wave-bar"
                style={{
                  animationDelay: `${(i * 0.08) % 1}s`,
                  height: `${Math.sin(i * 0.4) * 20 + 26}px`
                }}
              />
            ))}
          </div>

          {/* Real-time Live Speech Printing as user speaks */}
          <div className="car-voice-live-badge-wrap">
            {transcript ? (
              <div className="car-voice-live-transcript">
                <span className="car-voice-live-label">{status === 'processing' ? 'Command:' : 'Heard:'}</span>
                <span className="car-voice-live-text">&ldquo;{transcript}&rdquo;</span>
                {status === 'listening' && <span className="car-voice-live-cursor" />}
              </div>
            ) : (
              <div className="car-voice-waiting-pill">
                <span className="car-voice-waiting-pulse" />
                <span>Listening for speech... (Say song, artist, or command)</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Try saying suggestions (Screen 2) */}
        <div className="car-voice-suggestions-panel">
          <h3 className="car-voice-sugg-title">Try saying:</h3>
          <div className="car-voice-sugg-list">
            {SAMPLE_COMMANDS.map((cmd) => (
              <button
                key={cmd}
                className="car-voice-sugg-item"
                onClick={() => onQuickCommand && onQuickCommand(cmd)}
                title={`Try saying: ${cmd}`}
              >
                <ChevronRight size={16} className="text-electric-blue" />
                <span>{cmd}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

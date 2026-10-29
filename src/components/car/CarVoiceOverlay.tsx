'use client';

import React from 'react';
import { Mic, X } from 'lucide-react';
import type { VoiceStatus } from '../../services/voiceCommandService';

interface CarVoiceOverlayProps {
  status: VoiceStatus;
  transcript: string;
  onCancel: () => void;
  onQuickCommand?: (cmd: string) => void;
}

const SAMPLE_COMMANDS_SCREEN8 = [
  'Play Nuvvunte Naa Jathaga',
  'Who composed this song?',
  '1-hour driving playlist',
  'Play Telugu love songs',
  'Play devotional songs'
];

export const CarVoiceOverlay: React.FC<CarVoiceOverlayProps> = ({
  status,
  transcript,
  onCancel,
  onQuickCommand
}) => {
  if (status !== 'listening' && status !== 'processing') return null;

  return (
    <div
      className="car-voice-screen8-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Voice Command Active"
    >
      {/* Top right Close Button matching Screen 8 */}
      <button
        className="car-voice-screen8-close-btn"
        onClick={onCancel}
        aria-label="Close voice search"
      >
        <X size={26} />
      </button>

      <div className="car-voice-screen8-body">
        {/* Giant Glowing Pulsing Pink Microphone Orb */}
        <div className="car-voice-screen8-orb-wrapper">
          <div className="car-voice-screen8-pulse-ring-outer" />
          <div className="car-voice-screen8-pulse-ring-inner" />
          <div className="car-voice-screen8-mic-circle">
            <div className="car-voice-soundbars-cluster">
              <span className="car-voice-bar b1" />
              <span className="car-voice-bar b2" />
              <span className="car-voice-bar b3" />
              <span className="car-voice-bar b4" />
              <span className="car-voice-bar b5" />
            </div>
            <Mic size={36} className="car-voice-screen8-mic-icon" />
          </div>
        </div>

        {/* Listening... Title */}
        <h2 className="car-voice-screen8-title">
          {status === 'processing' ? 'Processing...' : 'Listening...'}
        </h2>

        {/* Live speech transcript if available */}
        {transcript && (
          <div className="car-voice-screen8-transcript">
            &ldquo;{transcript}&rdquo;
          </div>
        )}

        {/* Suggested Voice Commands matching Screen 8 */}
        <div className="car-voice-screen8-commands-box">
          {SAMPLE_COMMANDS_SCREEN8.map((cmd) => (
            <button
              key={cmd}
              className="car-voice-screen8-cmd-btn"
              onClick={() => onQuickCommand && onQuickCommand(cmd)}
              title={`Try saying: ${cmd}`}
            >
              &ldquo;{cmd}&rdquo;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

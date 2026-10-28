'use client';

import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import type { VoiceStatus } from '../../services/voiceCommandService';

interface CarVoiceButtonProps {
  status: VoiceStatus;
  onClick: () => void;
  className?: string;
}

export const CarVoiceButton: React.FC<CarVoiceButtonProps> = ({
  status,
  onClick,
  className = ''
}) => {
  const isListening = status === 'listening';
  const isProcessing = status === 'processing';
  const isUnsupported = status === 'unsupported' || status === 'permission_denied';

  return (
    <button
      className={`car-voice-hero-btn ${isListening ? 'listening' : ''} ${
        isProcessing ? 'processing' : ''
      } ${className}`}
      onClick={onClick}
      disabled={isProcessing}
      title={isListening ? 'Listening for command...' : 'Tap to Speak a voice command'}
      aria-label={isListening ? 'Listening for command' : 'Tap to Speak'}
    >
      <div className="car-voice-icon-container">
        {isProcessing ? (
          <Loader2 size={28} className="car-voice-spinner" />
        ) : isUnsupported ? (
          <MicOff size={28} className="car-voice-icon disabled" />
        ) : (
          <Mic size={28} className="car-voice-icon" />
        )}

        {isListening && <div className="car-voice-pulse-ring" />}
      </div>

      <div className="car-voice-label-wrap">
        <span className="car-voice-primary-label">
          {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Tap to Speak'}
        </span>
        <span className="car-voice-sub-label">
          {isListening ? 'Say "Play Kesariya"' : 'Voice Command'}
        </span>
      </div>
    </button>
  );
};

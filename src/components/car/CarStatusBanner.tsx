'use client';

import React from 'react';
import {
  Mic,
  AlertCircle,
  CheckCircle2,
  Music,
  X,
  Loader2
} from 'lucide-react';
import type { VoiceStatus } from '../../services/voiceCommandService';

interface CarStatusBannerProps {
  status: VoiceStatus;
  message: string | null;
  transcript?: string;
  onDismiss: () => void;
  onCancelListening?: () => void;
}

export const CarStatusBanner: React.FC<CarStatusBannerProps> = ({
  status,
  message,
  transcript,
  onDismiss,
  onCancelListening
}) => {
  // If actively listening, show an immersive automotive voice listening HUD
  if (status === 'listening') {
    return (
      <div className="car-voice-hud-overlay" role="status" aria-live="polite">
        <div className="car-voice-hud-card">
          <div className="car-voice-hud-pulse-ring">
            <Mic size={44} className="car-voice-hud-mic" />
          </div>

          <h3 className="car-voice-hud-title">Listening...</h3>
          <p className="car-voice-hud-prompt">
            Say <span className="car-voice-keyword">&quot;Play Kesariya&quot;</span>,{' '}
            <span className="car-voice-keyword">&quot;Next&quot;</span>, or{' '}
            <span className="car-voice-keyword">&quot;Show visualizer&quot;</span>
          </p>

          {transcript && (
            <div className="car-voice-hud-transcript">
              &quot;{transcript}&quot;
            </div>
          )}

          <button
            className="car-voice-hud-cancel"
            onClick={onCancelListening}
            aria-label="Cancel listening"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // If no message to display, don't show the banner
  if (!message) return null;

  const isError =
    status === 'error' ||
    status === 'permission_denied' ||
    status === 'unsupported' ||
    message.toLowerCase().includes('failed') ||
    message.toLowerCase().includes('error') ||
    message.toLowerCase().includes('denied');

  const isSuccess =
    status === 'success' ||
    message.toLowerCase().includes('playing') ||
    message.toLowerCase().includes('applied') ||
    message.toLowerCase().includes('switched') ||
    message.toLowerCase().includes('reset');

  const isSearching =
    status === 'processing' ||
    message.toLowerCase().includes('searching') ||
    message.toLowerCase().includes('looking');

  return (
    <aside
      className={`car-status-banner ${isError ? 'error' : isSuccess ? 'success' : isSearching ? 'searching' : 'info'}`}
      role="status"
      aria-live="assertive"
    >
      <div className="car-status-content">
        <div className="car-status-icon-wrap">
          {isSearching ? (
            <Loader2 size={20} className="car-status-icon spin" />
          ) : isError ? (
            <AlertCircle size={20} className="car-status-icon" />
          ) : isSuccess ? (
            <CheckCircle2 size={20} className="car-status-icon" />
          ) : (
            <Music size={20} className="car-status-icon" />
          )}
        </div>

        <div className="car-status-text-wrap">
          <span className="car-status-main-msg">{message}</span>
          {transcript && transcript.trim() !== '' && (
            <span className="car-status-transcript">Heard: &quot;{transcript}&quot;</span>
          )}
        </div>
      </div>

      <button
        className="car-status-close-btn"
        onClick={onDismiss}
        title="Dismiss message"
        aria-label="Dismiss message"
      >
        <X size={18} />
      </button>
    </aside>
  );
};

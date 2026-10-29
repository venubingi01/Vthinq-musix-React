'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMusic } from '../context/MusicContext';
import { searchSongs } from '../services/sangeethamApi';
import { processAIChatMessage } from '../services/aiOrchestratorService';
import {
  Mic,
  X,
  Sparkles,
  Volume2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

const QUICK_COMMAND_HINTS = [
  'Play Kesariya',
  'Arijit Singh Hits',
  'Telugu Workout',
  'Lofi Chill Beats',
  'Who composed this song?'
];

type VoiceState = 'idle' | 'listening' | 'speech' | 'processing' | 'success' | 'error';

export const VoiceSearchModal: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isVoiceSearchOpen,
    closeVoiceSearch,
    playSong,
    pauseSong,
    resumeSong,
    isPlaying,
    currentSong,
    showToast,
    setIsAiChatOpen
  } = useMusic();

  const [voiceState, setVoiceState] = useState<VoiceState>('listening');
  const [transcript, setTranscript] = useState<string>('');
  const [statusText, setStatusText] = useState<string>('Listening...');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const wasPlayingRef = useRef<boolean>(false);
  const soundBarsRef = useRef<number[]>([18, 35, 52, 28, 42]);
  const [soundBars, setSoundBars] = useState<number[]>([18, 35, 52, 28, 42]);
  const animationFrameRef = useRef<number | null>(null);

  // Simulated fluid audio-reactive animation for ChatGPT orb equalizer
  useEffect(() => {
    if (!isVoiceSearchOpen) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    let frame = 0;
    const animateBars = () => {
      frame++;
      if (voiceState === 'listening' || voiceState === 'speech') {
        const factor = voiceState === 'speech' ? 1.6 : 0.8;
        const newBars = [
          Math.min(56, Math.max(12, 24 + Math.sin(frame * 0.12) * 14 * factor)),
          Math.min(68, Math.max(14, 38 + Math.cos(frame * 0.15) * 22 * factor)),
          Math.min(74, Math.max(16, 48 + Math.sin(frame * 0.18 + 1) * 24 * factor)),
          Math.min(64, Math.max(12, 34 + Math.cos(frame * 0.14 + 2) * 20 * factor)),
          Math.min(52, Math.max(10, 22 + Math.sin(frame * 0.16 + 3) * 12 * factor))
        ];
        setSoundBars(newBars);
      } else if (voiceState === 'processing') {
        const newBars = [
          16 + Math.sin(frame * 0.2) * 8,
          20 + Math.cos(frame * 0.2) * 8,
          24 + Math.sin(frame * 0.25) * 10,
          20 + Math.cos(frame * 0.2) * 8,
          16 + Math.sin(frame * 0.2) * 8
        ];
        setSoundBars(newBars);
      }
      animationFrameRef.current = requestAnimationFrame(animateBars);
    };

    animationFrameRef.current = requestAnimationFrame(animateBars);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isVoiceSearchOpen, voiceState]);

  // Execute recognized voice prompt
  const handleProcessVoiceInput = useCallback(
    async (rawText: string) => {
      const clean = rawText.trim();
      if (!clean) return;

      setVoiceState('processing');
      setStatusText(`Finding "${clean}"...`);

      // 1. Check if user asked a factual question / AI query
      const isAIQuestion = /^(who|what|why|tell me|explain|recommend|when|compose|sing)/i.test(clean);

      if (isAIQuestion) {
        try {
          const aiRes = await processAIChatMessage({
            message: clean,
            activeTrack: currentSong
              ? {
                  id: currentSong.id,
                  name: currentSong.name,
                  artist: currentSong.artist,
                  album: currentSong.album,
                  language: currentSong.language
                }
              : undefined
          });

          if (aiRes.generatedPlaylist && aiRes.generatedPlaylist.songs.length > 0) {
            setVoiceState('success');
            setStatusText(`Playing: ${aiRes.generatedPlaylist.title} 🎶`);
            playSong(aiRes.generatedPlaylist.songs[0], aiRes.generatedPlaylist.songs);
            showToast(`🎶 Playing ${aiRes.generatedPlaylist.title}`);
            setTimeout(() => closeVoiceSearch(), 1200);
            return;
          }

          if (aiRes.songFactSheet) {
            setVoiceState('success');
            setStatusText(`${aiRes.songFactSheet.songTitle} • ${aiRes.songFactSheet.singers.join(', ')}`);
            showToast(`✨ ${aiRes.songFactSheet.songTitle}: ${aiRes.songFactSheet.singers.join(', ')}`);
            setTimeout(() => closeVoiceSearch(), 2200);
            return;
          }

          // Open full AI companion with this question
          setVoiceState('success');
          setStatusText(`Answered by Sangeetham AI ✨`);
          setTimeout(() => {
            closeVoiceSearch();
            setIsAiChatOpen(true);
          }, 800);
          return;
        } catch (e) {
          console.warn('AI resolution error:', e);
        }
      }

      // 2. Playback / Music Search Request
      const searchQuery = clean.replace(/^(play\s+|listen\s+to\s+|search\s+|find\s+)/i, '').trim();

      try {
        const results = await searchSongs(searchQuery || clean, 1, 20);
        if (results && results.length > 0) {
          setVoiceState('success');
          setStatusText(`Playing "${results[0].name}" 🎵`);
          playSong(results[0], results);
          showToast(`🎶 Now Playing: ${results[0].name}`);

          setTimeout(() => {
            closeVoiceSearch();
          }, 1000);
        } else {
          setVoiceState('error');
          setStatusText(`No tracks found for "${clean}"`);
          setErrorMessage('Try asking for an artist, movie, or song title.');
        }
      } catch (err) {
        console.warn('Voice song search failed:', err);
        setVoiceState('error');
        setStatusText("Couldn't find that song");
        setErrorMessage('Tap the orb to try again, or check your internet connection.');
      }
    },
    [currentSong, playSong, showToast, closeVoiceSearch, setIsAiChatOpen]
  );

  // Start speech recognition
  const startRecognition = useCallback(() => {
    setVoiceState('listening');
    setTranscript('');
    setStatusText('Listening...');
    setErrorMessage('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceState('error');
      setStatusText('Speech Recognition Not Supported');
      setErrorMessage('Your browser does not support speech recognition. Please type your search.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setVoiceState('listening');
        setStatusText('Listening...');
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }

        const currentText = finalText || interimText;
        if (currentText) {
          setTranscript(currentText);
          setVoiceState('speech');
          setStatusText('Listening to you...');
        }

        if (finalText) {
          handleProcessVoiceInput(finalText);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          setVoiceState('error');
          setStatusText("Didn't catch that");
          setErrorMessage('No speech detected. Tap the mic to try again.');
        } else if (event.error === 'not-allowed') {
          setVoiceState('error');
          setStatusText('Microphone Blocked');
          setErrorMessage('Please allow microphone permissions in your browser.');
        } else {
          setVoiceState('error');
          setStatusText('Speech Error');
          setErrorMessage('Could not recognize audio. Tap the mic to retry.');
        }
      };

      recognition.onend = () => {
        // Recognition completed
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech start error:', err);
      setVoiceState('error');
      setStatusText('Microphone Error');
      setErrorMessage('Could not activate microphone. Tap to retry.');
    }
  }, [handleProcessVoiceInput]);

  // Lifecycle: open/close handlers
  useEffect(() => {
    if (isVoiceSearchOpen) {
      wasPlayingRef.current = isPlaying;
      if (isPlaying) {
        pauseSong();
      }
      startRecognition();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [isVoiceSearchOpen]);

  // Keyboard shortcut ESC
  useEffect(() => {
    if (!isVoiceSearchOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeVoiceSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVoiceSearchOpen, closeVoiceSearch]);

  const handleClose = () => {
    closeVoiceSearch();
    if (wasPlayingRef.current && !isPlaying) {
      resumeSong();
    }
  };

  const handleOrbClick = () => {
    if (voiceState === 'listening' || voiceState === 'speech') {
      if (transcript.trim()) {
        handleProcessVoiceInput(transcript);
      } else {
        startRecognition();
      }
    } else {
      startRecognition();
    }
  };

  const handleQuickHintClick = (hint: string) => {
    setTranscript(hint);
    handleProcessVoiceInput(hint);
  };

  if (!isVoiceSearchOpen) return null;

  return (
    <div
      className="voice-search-modal-backdrop active"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Voice Search Active"
    >
      <div className="voice-search-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="voice-modal-close-btn"
          onClick={handleClose}
          title="Close Voice Search (ESC)"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Ambient Top Glow Tag */}
        <div className="voice-modal-brand-tag">
          <Sparkles size={14} className="text-pink animate-pulse" />
          <span>Sangeetham Voice AI</span>
        </div>

        {/* ==============================================================
            Fluid Morphing ChatGPT / Siri Voice Visualizer Orb
            ============================================================== */}
        <div className="voice-chatgpt-visualizer-container">
          {/* Animated concentric outer aura rings */}
          <div className={`voice-aura-ring ring-1 ${voiceState}`} />
          <div className={`voice-aura-ring ring-2 ${voiceState}`} />
          <div className={`voice-aura-ring ring-3 ${voiceState}`} />

          {/* Central Fluid Glowing Orb */}
          <button
            type="button"
            className={`voice-chatgpt-orb ${voiceState}`}
            onClick={handleOrbClick}
            title={
              voiceState === 'listening'
                ? 'Listening... Tap to stop or submit'
                : 'Tap to start speaking'
            }
            aria-label="Microphone Voice Orb"
          >
            {/* Equalizer Waveform Frequency Sound Bars */}
            <div className="voice-soundbars-cluster">
              {soundBars.map((h, i) => (
                <div
                  key={i}
                  className="voice-soundbar"
                  style={{
                    height: `${h}px`
                  }}
                />
              ))}
            </div>

            {/* Glowing Icon Overlay */}
            <div className="voice-orb-icon-badge">
              {voiceState === 'processing' ? (
                <Loader2 size={24} className="spin-loader" />
              ) : voiceState === 'success' ? (
                <CheckCircle2 size={24} className="text-green" />
              ) : voiceState === 'error' ? (
                <RotateCcw size={24} className="text-amber" />
              ) : (
                <Mic size={24} className="voice-mic-center-icon" />
              )}
            </div>
          </button>
        </div>

        {/* Heading & Transcript */}
        <div className="voice-modal-text-content">
          <h2 className="voice-modal-status-heading">{statusText}</h2>

          <div className="voice-modal-transcript-box">
            {transcript ? (
              <p className="voice-transcript-text active-transcript">
                &ldquo;{transcript}&rdquo;
              </p>
            ) : (
              <p className="voice-transcript-placeholder">
                Speak naturally: &ldquo;Play Kesariya&rdquo;, &ldquo;Sid Sriram hits&rdquo;, &ldquo;Telugu workout&rdquo;...
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="voice-error-banner">
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="voice-modal-chips-row">
          <span className="chips-label">Try saying:</span>
          <div className="chips-list">
            {QUICK_COMMAND_HINTS.map((hint) => (
              <button
                key={hint}
                type="button"
                className="voice-suggestion-chip"
                onClick={() => handleQuickHintClick(hint)}
              >
                &ldquo;{hint}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Hint */}
        <div className="voice-modal-bottom-hint">
          <span>Tap orb to pause or restart • Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};

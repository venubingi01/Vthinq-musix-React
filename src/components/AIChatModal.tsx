'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useMusic } from '../context/MusicContext';
import { processAIChatMessage } from '../services/aiOrchestratorService';
import { recordPlaylistSave, recordSongLike } from '../services/aiPreferenceService';
import type { Song, ChatMessage } from '../types/music';
import type {
  AIActiveTrackContext,
  AIChatResponse,
  GeneratedPlaylist,
  PlaylistConstraints,
  SongFactSheet
} from '../types/ai';
import {
  Sparkles,
  X,
  Send,
  Mic,
  Play,
  Shuffle,
  Bookmark,
  Bot,
  User,
  Music,
  Volume2,
  CheckCircle2,
  Car,
  Heart,
  Smile,
  Compass,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const CATEGORY_PROMPTS = [
  { label: '🚗 Driving', prompt: 'Create a 1-hour energetic driving playlist with Telugu and Hindi songs' },
  { label: '✨ Mood', prompt: 'I want relaxing and peaceful melodies for the evening' },
  { label: '🙏 Devotional', prompt: 'Play devotional songs for today' },
  { label: '💪 Workout', prompt: 'Create a high-energy workout playlist' },
  { label: '☕ Relax', prompt: 'Play soothing acoustic melodies' },
  { label: '🎵 Song Info', prompt: 'Who sang and composed this song?' },
  { label: '🚀 2000s Hits', prompt: 'Play popular Telugu and Hindi 2000s classics' }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome',
    sender: 'ai',
    text: "Namaste! I am your **Sangeetham AI Music Companion** 🎵\n\nI can:\n• Generate personalized playlists by mood, language, era, and duration\n• Answer verified facts & credits about songs (composers, singers, lyricists, cast)\n• Devotional music & daily festival observances\n• Hands-free music playback control\n\nWhat would you like to listen to today?",
    timestamp: 'Just now',
    suggestedFollowUps: [
      'Create a 45-min driving playlist',
      'Who composed this song?',
      'Today devotional songs',
      'Play Sid Sriram songs'
    ]
  }
];

export const AIChatModal: React.FC = () => {
  const {
    isAiChatOpen,
    setIsAiChatOpen,
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    pauseSong,
    resumeSong,
    nextSong,
    prevSong,
    setVolume,
    volume,
    toggleShuffle,
    toggleLoop,
    seek,
    setActiveTab,
    openFullscreenVisualizer,
    showToast,
    toggleFavorite
  } = useMusic();

  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeConstraints, setActiveConstraints] = useState<PlaylistConstraints | undefined>(undefined);
  const [expandedFacts, setExpandedFacts] = useState<Record<string, boolean>>({});
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const conversationIdRef = useRef<string>(`conv_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [voiceStatus, setVoiceStatus] = useState<'listening' | 'processing'>('listening');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const wasPlayingBeforeVoiceRef = useRef<boolean>(false);

  // Autoscroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const pathname = usePathname();
  if (!isAiChatOpen) return null;

  // Execute structured playback command safely
  const executePlaybackCommand = (cmd: AIChatResponse['playbackCommand'], playlist?: GeneratedPlaylist) => {
    if (!cmd) return;

    switch (cmd.action) {
      case 'play':
        if (playlist && playlist.songs.length > 0) {
          playSong(playlist.songs[0], playlist.songs);
          showToast(`Playing "${playlist.songs[0].name}"`);
        } else if (cmd.targetSong && playlist?.songs) {
          const match = playlist.songs.find(
            (s) => s.name.toLowerCase() === cmd.targetSong?.toLowerCase()
          );
          if (match) playSong(match, playlist.songs);
        } else {
          resumeSong();
        }
        break;
      case 'pause':
        pauseSong();
        showToast('Playback paused');
        break;
      case 'resume':
        resumeSong();
        showToast('Playback resumed');
        break;
      case 'next':
        nextSong();
        showToast('Skipped to next track');
        break;
      case 'prev':
        prevSong();
        showToast('Playing previous track');
        break;
      case 'replay':
        seek(0);
        resumeSong();
        showToast('Replaying track');
        break;
      case 'shuffle':
        toggleShuffle();
        showToast('Queue shuffled');
        break;
      case 'loop':
        toggleLoop();
        showToast('Track repeat toggled');
        break;
      case 'volume_up':
        setVolume(Math.min(1, volume + 0.15));
        showToast(`Volume: ${Math.round(Math.min(1, volume + 0.15) * 100)}%`);
        break;
      case 'volume_down':
        setVolume(Math.max(0, volume - 0.15));
        showToast(`Volume: ${Math.round(Math.max(0, volume - 0.15) * 100)}%`);
        break;
      case 'show_visualizer':
        openFullscreenVisualizer();
        setIsAiChatOpen(false);
        break;
      case 'open_equalizer':
        setActiveTab('equalizer');
        setIsAiChatOpen(false);
        break;
    }
  };

  // Text to Speech
  const speakText = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown asterisks and emojis for speech
    const cleanText = text
      .replace(/[*_#`]/g, '')
      .replace(/[^\w\s.,?!'-]/g, ' ')
      .slice(0, 250);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-IN';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Main Message Handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Active track context
    const activeTrackContext: AIActiveTrackContext | undefined = currentSong
      ? {
          id: currentSong.id,
          name: currentSong.name,
          artist: currentSong.artist,
          album: currentSong.album,
          language: currentSong.language,
          duration: currentSong.duration
        }
      : undefined;

    try {
      const response = await processAIChatMessage({
        message: query,
        conversationId: conversationIdRef.current,
        activeTrack: activeTrackContext,
        activeConstraints
      });

      if (response.activeConstraints) {
        setActiveConstraints(response.activeConstraints);
      }

      // Execute any direct playback actions
      if (response.playbackCommand) {
        executePlaybackCommand(response.playbackCommand, response.generatedPlaylist);
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        generatedPlaylist: response.generatedPlaylist,
        songFactSheet: response.songFactSheet,
        suggestedFollowUps: response.suggestedFollowUps,
        recommendedSongs: response.generatedPlaylist?.songs || []
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error processing AI query:', err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: 'I ran into a temporary glitch communicating with the music intelligence server. Please try again.',
          timestamp: 'Just now'
        }
      ]);
    }
  };

  // Voice Recognition Handler with Fullscreen Animation
  const handleVoice = () => {
    wasPlayingBeforeVoiceRef.current = isPlaying;
    pauseSong();

    setIsVoiceActive(true);
    setVoiceStatus('listening');
    setVoiceTranscript('');

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setVoiceTranscript('Voice recognition is unavailable in this environment. Tap any suggestion below:');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'en-IN';
      rec.interimResults = true;
      recognitionRef.current = rec;

      rec.onstart = () => {
        setIsVoiceActive(true);
        setVoiceStatus('listening');
      };

      rec.onresult = (event: any) => {
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
          setVoiceTranscript(currentText);
        }

        if (finalText) {
          setVoiceStatus('processing');
          setTimeout(() => {
            setIsVoiceActive(false);
            handleSendMessage(finalText);
          }, 350);
        }
      };

      rec.onerror = (e: any) => {
        console.warn('Voice recognition error:', e);
        setVoiceStatus('listening');
      };

      rec.onend = () => {
        // Voice ended
      };

      rec.start();
    } catch (err) {
      console.warn('Voice activation failed:', err);
    }
  };

  const handleCancelVoice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setIsVoiceActive(false);
    setVoiceTranscript('');
    if (wasPlayingBeforeVoiceRef.current && !isPlaying) {
      resumeSong();
    }
  };

  const handleVoiceQuickCommand = (cmdText: string) => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setIsVoiceActive(false);
    handleSendMessage(cmdText);
  };

  // Play All tracks from generated playlist
  const handlePlayAll = (playlist: GeneratedPlaylist) => {
    if (playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
      showToast(`Playing playlist: "${playlist.title}"`);
    }
  };

  // Shuffle playlist
  const handleShufflePlaylist = (playlist: GeneratedPlaylist) => {
    if (playlist.songs.length > 0) {
      const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
      showToast(`Shuffled and playing: "${playlist.title}"`);
    }
  };

  // Save playlist
  const handleSavePlaylist = (playlist: GeneratedPlaylist) => {
    recordPlaylistSave(playlist.title);
    playlist.songs.forEach((s) => toggleFavorite(s));
    showToast(`Saved "${playlist.title}" with ${playlist.songs.length} songs!`);
  };

  const toggleFactExpansion = (id: string) => {
    setExpandedFacts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <div className="ai-modal-backdrop" onClick={() => setIsAiChatOpen(false)}>
        <div className="ai-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-modal-header">
          <div className="ai-title-wrap">
            <div className="ai-avatar-badge">
              <Sparkles size={18} className="text-orange" />
            </div>
            <div>
              <h2 className="ai-title">Sangeetham Companion</h2>
              <span className="ai-status-online">
                {currentSong ? `Listening to: ${currentSong.name}` : 'AI Intelligence Ready'}
              </span>
            </div>
          </div>

          <button
            className="ai-close-btn"
            onClick={() => setIsAiChatOpen(false)}
            title="Close Assistant"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Category Bar */}
        <div className="ai-categories-bar">
          {CATEGORY_PROMPTS.map((cat, idx) => (
            <button
              key={idx}
              className="ai-category-pill"
              onClick={() => handleSendMessage(cat.prompt)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Messages Flow */}
        <div className="ai-messages-flow">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`ai-message-row ${msg.sender === 'user' ? 'msg-user' : 'msg-ai'}`}
            >
              <div className="msg-avatar">
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div className="msg-bubble">
                <div className="msg-text-content">{msg.text}</div>

                {/* AI Generated Playlist Card */}
                {msg.generatedPlaylist && (
                  <div className="ai-playlist-card">
                    <div className="ai-playlist-card-header">
                      <div>
                        <div className="ai-playlist-title">
                          <Music size={16} className="text-orange" />
                          <span>{msg.generatedPlaylist.title}</span>
                        </div>
                        <div className="ai-playlist-desc">
                          {msg.generatedPlaylist.songs.length} songs • ~
                          {Math.round(msg.generatedPlaylist.totalDurationSeconds / 60)} mins
                        </div>
                      </div>
                      <span className="ai-playlist-badge">AI Curated</span>
                    </div>

                    {/* Actions: Play All, Shuffle, Save */}
                    <div className="ai-playlist-actions">
                      <button
                        className="ai-action-btn-primary"
                        onClick={() => handlePlayAll(msg.generatedPlaylist!)}
                      >
                        <Play size={13} fill="#fff" /> Play All
                      </button>
                      <button
                        className="ai-action-btn-secondary"
                        onClick={() => handleShufflePlaylist(msg.generatedPlaylist!)}
                      >
                        <Shuffle size={13} /> Shuffle
                      </button>
                      <button
                        className="ai-action-btn-secondary"
                        onClick={() => handleSavePlaylist(msg.generatedPlaylist!)}
                      >
                        <Bookmark size={13} /> Save
                      </button>
                    </div>

                    {/* Track List */}
                    <div className="ai-playlist-tracks">
                      {msg.generatedPlaylist.songs.map((song, idx) => (
                        <div
                          key={`${song.id}-${idx}`}
                          className="ai-track-row"
                          onClick={() => playSong(song, msg.generatedPlaylist!.songs)}
                        >
                          <span className="ai-track-num">{idx + 1}</span>
                          <img
                            src={song.image || '/icon-192.png'}
                            alt={song.name}
                            className="ai-track-thumb"
                          />
                          <div className="ai-track-info">
                            <span className="ai-track-title">{song.name}</span>
                            <span className="ai-track-sub">{song.artist}</span>
                          </div>
                          <span className="ai-track-dur">
                            {song.duration
                              ? `${Math.floor(song.duration / 60)}:${String(
                                  song.duration % 60
                                ).padStart(2, '0')}`
                              : '3:45'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Song Knowledge / Fact Sheet Card */}
                {msg.songFactSheet && (
                  <div className="ai-fact-card">
                    <div className="ai-fact-header">
                      <div className="ai-fact-title-wrap">
                        <CheckCircle2 size={16} color="#00e676" />
                        <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>
                          {msg.songFactSheet.songTitle}
                        </span>
                      </div>
                      <span className="ai-verified-badge">
                        {msg.songFactSheet.verificationStatus === 'verified'
                          ? '✓ Verified Official'
                          : 'Partial Match'}
                      </span>
                    </div>

                    {/* Credits Grid */}
                    <div className="ai-credits-grid">
                      <div className="ai-credit-item">
                        <span className="ai-credit-label">Singers</span>
                        <span className="ai-credit-val">
                          {msg.songFactSheet.singers.join(', ') || 'N/A'}
                        </span>
                      </div>
                      <div className="ai-credit-item">
                        <span className="ai-credit-label">Music Director</span>
                        <span className="ai-credit-val">
                          {msg.songFactSheet.musicDirectors.join(', ') || 'N/A'}
                        </span>
                      </div>
                      <div className="ai-credit-item">
                        <span className="ai-credit-label">Lyricist</span>
                        <span className="ai-credit-val">
                          {msg.songFactSheet.lyricists.join(', ') || 'N/A'}
                        </span>
                      </div>
                      <div className="ai-credit-item">
                        <span className="ai-credit-label">Movie / Album</span>
                        <span className="ai-credit-val">
                          {msg.songFactSheet.movieOrAlbum || 'Single'}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Extended Credits */}
                    {expandedFacts[msg.id] && (
                      <div className="ai-credits-grid" style={{ marginTop: '4px' }}>
                        {msg.songFactSheet.cast && msg.songFactSheet.cast.length > 0 && (
                          <div className="ai-credit-item">
                            <span className="ai-credit-label">Star Cast</span>
                            <span className="ai-credit-val">
                              {msg.songFactSheet.cast.join(', ')}
                            </span>
                          </div>
                        )}
                        {msg.songFactSheet.filmDirector && (
                          <div className="ai-credit-item">
                            <span className="ai-credit-label">Film Director</span>
                            <span className="ai-credit-val">
                              {msg.songFactSheet.filmDirector}
                            </span>
                          </div>
                        )}
                        {msg.songFactSheet.musicLabel && (
                          <div className="ai-credit-item">
                            <span className="ai-credit-label">Record Label</span>
                            <span className="ai-credit-val">
                              {msg.songFactSheet.musicLabel}
                            </span>
                          </div>
                        )}
                        {msg.songFactSheet.releaseYear && (
                          <div className="ai-credit-item">
                            <span className="ai-credit-label">Release Year</span>
                            <span className="ai-credit-val">
                              {msg.songFactSheet.releaseYear}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Trivia Quote */}
                    {msg.songFactSheet.trivia && (
                      <div className="ai-fact-trivia">
                        💡 {msg.songFactSheet.trivia}
                      </div>
                    )}

                    {/* Sources */}
                    <div className="ai-sources-row">
                      <span>Sources:</span>
                      {msg.songFactSheet.sources.map((s, idx) => (
                        <span key={idx} className="ai-source-chip">
                          {s}
                        </span>
                      ))}
                      <button
                        style={{
                          marginLeft: 'auto',
                          background: 'none',
                          border: 'none',
                          color: '#ff5252',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          fontSize: '0.68rem'
                        }}
                        onClick={() => toggleFactExpansion(msg.id)}
                      >
                        {expandedFacts[msg.id] ? (
                          <>Less <ChevronUp size={12} /></>
                        ) : (
                          <>All Credits <ChevronDown size={12} /></>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Follow-up Suggested Chips */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="ai-followup-chips">
                    {msg.suggestedFollowUps.map((chip, idx) => (
                      <button
                        key={idx}
                        className="ai-followup-chip"
                        onClick={() => handleSendMessage(chip)}
                      >
                        <Sparkles size={11} className="text-orange" /> {chip}
                      </button>
                    ))}
                  </div>
                )}

                {/* Text to Speech & Action Footer */}
                {msg.sender === 'ai' && (
                  <div className="ai-msg-actions">
                    <button
                      className="ai-tts-btn"
                      onClick={() => speakText(msg.id, msg.text)}
                      title="Read out loud"
                    >
                      <Volume2
                        size={13}
                        color={speakingMsgId === msg.id ? '#ff5252' : undefined}
                      />
                      <span>{speakingMsgId === msg.id ? 'Stop' : 'Speak'}</span>
                    </button>
                    <span className="msg-time" style={{ marginLeft: 'auto' }}>
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {msg.sender === 'user' && (
                  <span className="msg-time">{msg.timestamp}</span>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="ai-message-row msg-ai">
              <div className="msg-avatar">
                <Bot size={16} />
              </div>
              <div className="msg-bubble typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          className="ai-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            className="ai-input-field"
            placeholder="Ask Sangeetham: play songs, facts, mood playlists..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            className={`ai-mic-btn ${isListening || isVoiceActive ? 'listening-active' : ''}`}
            onClick={handleVoice}
            title={isListening || isVoiceActive ? 'Listening... click to stop' : 'Voice command'}
          >
            <Mic size={18} color={isListening || isVoiceActive ? '#ff1744' : undefined} />
          </button>
          <button
            type="submit"
            className="ai-send-btn"
            disabled={!input.trim()}
            title="Send Message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>

    {/* Fullscreen Voice Search Animation (Matching Car Mode) */}
    {isVoiceActive && (
      <div
        className="car-voice-screen8-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Voice Command Active"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top right Close Button */}
        <button
          className="car-voice-screen8-close-btn"
          onClick={handleCancelVoice}
          aria-label="Close voice search"
        >
          <X size={26} />
        </button>

        <div className="car-voice-screen8-body">
          {/* Giant Glowing Pulsing Pink/Cyan Orb with Soundbars */}
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

          {/* Listening... / Processing... Title */}
          <h2 className="car-voice-screen8-title">
            {voiceStatus === 'processing' ? 'Processing...' : 'Listening...'}
          </h2>

          {/* Live speech transcript if available */}
          {voiceTranscript ? (
            <div className="car-voice-screen8-transcript">
              &ldquo;{voiceTranscript}&rdquo;
            </div>
          ) : (
            <div className="car-voice-screen8-transcript" style={{ opacity: 0.7, fontSize: '1.05rem' }}>
              Speak now: &ldquo;Play driving songs&rdquo;, &ldquo;Who composed this?&rdquo;...
            </div>
          )}

          {/* Suggested Voice Commands */}
          <div className="car-voice-screen8-commands-box">
            {[
              'Create a 45-min driving playlist',
              'Who composed this song?',
              'Play Sid Sriram melody hits',
              'Play devotional songs for today',
              'Telugu upbeat workout tracks'
            ].map((cmd) => (
              <button
                key={cmd}
                className="car-voice-screen8-cmd-btn"
                onClick={() => handleVoiceQuickCommand(cmd)}
                title={`Tap to ask: ${cmd}`}
              >
                &ldquo;{cmd}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
  </>
);
};

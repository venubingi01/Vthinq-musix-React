'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMusic } from '../context/MusicContext';
import { searchSongs, STARTER_SONGS } from '../services/saavnApi';
import type { ChatMessage, Song } from '../types/music';
import {
  Sparkles,
  X,
  Send,
  Mic,
  Play,
  Bot,
  User,
  Music
} from 'lucide-react';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome',
    sender: 'ai',
    text: "Hello! I am your Sangeetham AI Music Assistant. Try asking me:\n• 'Play trending telugu songs'\n• 'Play Kesariya'\n• 'Next track' or 'Pause'\n• 'Suggest peaceful Lo-Fi study music'",
    timestamp: 'Just now'
  }
];

export const AIChatModal: React.FC = () => {
  const {
    isAiChatOpen,
    setIsAiChatOpen,
    playSong,
    togglePlay,
    nextSong,
    prevSong,
    setVolume,
    volume
  } = useMusic();

  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Autoscroll to latest chat message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  if (!isAiChatOpen) return null;

  // AI Command & Query Engine
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

    const qLower = query.toLowerCase();

    // 1. Player control commands
    if (qLower === 'next' || qLower.includes('skip') || qLower.includes('next song')) {
      setTimeout(() => {
        nextSong();
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: '⏭️ Skipping to the next track in the queue.',
            timestamp: 'Just now'
          }
        ]);
      }, 500);
      return;
    }

    if (qLower === 'previous' || qLower.includes('prev') || qLower.includes('last song')) {
      setTimeout(() => {
        prevSong();
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: '⏮️ Playing previous track.',
            timestamp: 'Just now'
          }
        ]);
      }, 500);
      return;
    }

    if (qLower.includes('pause') || qLower.includes('stop')) {
      setTimeout(() => {
        togglePlay();
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: '⏸️ Playback paused.',
            timestamp: 'Just now'
          }
        ]);
      }, 400);
      return;
    }

    if (qLower.includes('volume up') || qLower.includes('louder')) {
      const newVol = Math.min(1, volume + 0.2);
      setVolume(newVol);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: `🔊 Volume increased to ${Math.round(newVol * 100)}%.`,
            timestamp: 'Just now'
          }
        ]);
      }, 400);
      return;
    }

    // 2. Play specific query
    let songSearchQuery = '';
    if (qLower.startsWith('play ')) {
      songSearchQuery = query.substring(5).trim();
    } else {
      songSearchQuery = query;
    }

    try {
      const results = await searchSongs(songSearchQuery, 1, 5);

      setTimeout(() => {
        setIsTyping(false);

        if (results.length > 0) {
          // If explicitly asked to "play ...", start first song immediately
          if (qLower.startsWith('play ')) {
            playSong(results[0], results);
            setMessages((prev) => [
              ...prev,
              {
                id: `ai_${Date.now()}`,
                sender: 'ai',
                text: `🎶 Now playing "${results[0].name}" by ${results[0].artist}! Here are related recommendations:`,
                timestamp: 'Just now',
                recommendedSongs: results
              }
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: `ai_${Date.now()}`,
                sender: 'ai',
                text: `Here are the top tracks matching "${query}":`,
                timestamp: 'Just now',
                recommendedSongs: results
              }
            ]);
          }
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              sender: 'ai',
              text: `I couldn't find exact matches for "${query}". Here are some popular hits you might like:`,
              timestamp: 'Just now',
              recommendedSongs: STARTER_SONGS.slice(0, 3)
            }
          ]);
        }
      }, 600);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: 'Oops! Had a slight issue reaching the music servers. Please try again.',
          timestamp: 'Just now'
        }
      ]);
    }
  };

  const handleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'en-IN';
      rec.interimResults = false;

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          handleSendMessage(text);
        }
      };

      rec.start();
    } catch (err) {
      console.warn('Voice recognition error:', err);
      setIsListening(false);
    }
  };

  return (
    <div className="ai-modal-backdrop" onClick={() => setIsAiChatOpen(false)}>
      <div className="ai-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-modal-header">
          <div className="ai-title-wrap">
            <div className="ai-avatar-badge">
              <Sparkles size={18} className="text-orange" />
            </div>
            <div>
              <h2 className="ai-title">Sangeetham AI</h2>
              <span className="ai-status-online">Online & Ready</span>
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

        {/* Message Flow */}
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

                {/* Song Recommendations if returned */}
                {msg.recommendedSongs && msg.recommendedSongs.length > 0 && (
                  <div className="msg-song-cards">
                    {msg.recommendedSongs.map((song: Song) => (
                      <div
                        key={song.id}
                        className="msg-song-card"
                        onClick={() => playSong(song, msg.recommendedSongs)}
                      >
                        <img src={song.image} alt={song.name} className="msg-song-img" />
                        <div className="msg-song-meta">
                          <span className="msg-song-name">{song.name}</span>
                          <span className="msg-song-artist">{song.artist}</span>
                        </div>
                        <button className="msg-play-chip" title="Play song">
                          <Play size={14} fill="#fff" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <span className="msg-time">{msg.timestamp}</span>
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

        {/* Quick prompt suggestions */}
        <div className="ai-quick-prompts">
          <button onClick={() => handleSendMessage('Play trending telugu songs')}>
            <Music size={12} /> Play Telugu Hits
          </button>
          <button onClick={() => handleSendMessage('Suggest romantic Hindi songs')}>
            <Sparkles size={12} /> Romantic Hits
          </button>
          <button onClick={() => handleSendMessage('Play Lo-Fi Study Beats')}>
            ☕ Lo-Fi Beats
          </button>
        </div>

        {/* Chat Input Bar */}
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
            placeholder="Ask AI to play songs, artists, or adjust player..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            className={`ai-mic-btn ${isListening ? 'listening-active' : ''}`}
            onClick={handleVoice}
            title="Voice input"
          >
            <Mic size={18} />
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
  );
};

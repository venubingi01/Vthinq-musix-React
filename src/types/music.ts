export interface Song {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  url: string;
  fallbackUrls?: string[];
  duration?: number; // duration in seconds
  quality?: string;
  year?: string;
  language?: string;
}

export interface Album {
  id: string;
  title: string;
  artists: string;
  year?: string;
  language?: string;
  songCount?: number | string;
  cover: string;
  songs?: Song[];
}

export interface TimedLyric {
  time: number; // time in seconds
  text: string;
  isPlain?: boolean;
}

export type TabType = 'home' | 'search' | 'favorites' | 'player' | 'lyrics' | 'equalizer' | 'album';

export interface EqualizerPreset {
  name: string;
  gains: number[]; // 5 band values in dB (-12 to +12)
}

import type { GeneratedPlaylist, SongFactSheet } from './ai';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  recommendedSongs?: Song[];
  generatedPlaylist?: GeneratedPlaylist;
  songFactSheet?: SongFactSheet;
  suggestedFollowUps?: string[];
}

export interface ShareData {
  title: string;
  subtitle?: string;
  url: string;
  image?: string;
  type?: 'song' | 'album' | 'lyrics';
}


export interface SongDownloadUrl {
  quality: string;
  url: string;
}

export interface Song {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumId?: string;
  image: string;
  url: string;
  downloadUrls?: SongDownloadUrl[];
  fallbackUrls?: string[];
  duration?: number; // duration in seconds
  quality?: string;
  year?: string;
  language?: string;
  raw?: any;
}

export interface UserPlaylist {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  cover?: string;
  songs: Song[];
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

export type SpatialMode = 'orbit' | 'wide' | 'hall' | 'cinema' | 'vocal';

export type AudioQuality = '320' | '160' | '96';

export interface EqualizerBandConfig {
  freq: number;
  type: BiquadFilterType;
  label: string;
  q?: number;
}

export interface EqualizerPreset {
  name: string;
  key?: string;
  gains: number[]; // 7 band values in dB (-12 to +12)
  preamp?: number;
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


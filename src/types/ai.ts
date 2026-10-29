import type { Song } from './music';

export type AIIntentType =
  | 'playback_control'
  | 'playlist_generate'
  | 'playlist_refine'
  | 'song_info'
  | 'recommendation'
  | 'devotional_occasion'
  | 'general_chat'
  | 'clarification';

export type PlaybackAction =
  | 'play'
  | 'pause'
  | 'resume'
  | 'next'
  | 'prev'
  | 'replay'
  | 'shuffle'
  | 'loop'
  | 'volume_up'
  | 'volume_down'
  | 'set_volume'
  | 'seek'
  | 'queue_add'
  | 'queue_remove'
  | 'show_visualizer'
  | 'open_equalizer';

export interface PlaybackCommand {
  action: PlaybackAction;
  targetSong?: string;
  volumeValue?: number;
  seekSeconds?: number;
}

export interface PlaylistConstraints {
  languages: string[];
  moods: string[];
  genres: string[];
  activities: string[];
  eras: string[];
  artists: string[];
  targetDurationMinutes?: number;
  tempo?: 'slow' | 'medium' | 'fast' | 'upbeat';
  occasion?: string;
  isDevotional?: boolean;
  deity?: string;
  popularity?: 'hits_only' | 'mixed' | 'discovery';
}

export interface GeneratedPlaylist {
  id: string;
  title: string;
  description: string;
  songs: Song[];
  totalDurationSeconds: number;
  constraints: PlaylistConstraints;
  explanation: string;
}

export interface SongFactSheet {
  title: string;
  songTitle?: string;
  movieOrAlbum: string;
  language: string;
  singers: string[];
  musicDirectors: string[];
  lyricists: string[];
  cast: string[];
  director?: string | null;
  filmDirector?: string | null;
  producer?: string | null;
  releaseYear?: string | null;
  songReleaseDate?: string | null;
  filmReleaseDate?: string | null;
  musicLabel?: string | null;
  trivia?: string[];
  sources: string[];
  verificationStatus: 'verified' | 'partial' | 'unverified';
}

export interface DevotionalOccasion {
  id: string;
  title: string;
  deity: string;
  dayOfWeek?: string;
  dateStr?: string;
  description: string;
  suggestedLanguages: string[];
  sampleQueries: string[];
}

export interface AIActiveTrackContext {
  id: string;
  name: string;
  artist: string;
  album: string;
  year?: string;
  language?: string;
  duration?: number;
}

export interface AIConversationTurn {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  intent?: AIIntentType;
  playbackCommand?: PlaybackCommand;
  generatedPlaylist?: GeneratedPlaylist;
  songFactSheet?: SongFactSheet;
  suggestedActions?: string[];
}

export interface AIChatRequest {
  message: string;
  conversationId?: string;
  activeTrack?: AIActiveTrackContext | null;
  recentHistory?: { role: 'user' | 'assistant'; content: string }[];
  activeConstraints?: PlaylistConstraints | null;
  preferences?: {
    preferredLanguages?: string[];
    dislikedArtists?: string[];
  };
}

export interface AIChatResponse {
  conversationId: string;
  intent: AIIntentType;
  replyText: string;
  playbackCommand?: PlaybackCommand | null;
  generatedPlaylist?: GeneratedPlaylist | null;
  songFactSheet?: SongFactSheet | null;
  suggestedFollowUps?: string[];
  activeConstraints?: PlaylistConstraints | null;
}

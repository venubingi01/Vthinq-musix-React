'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import { useRouter } from 'next/navigation';
import type {
  Song,
  TabType,
  ShareData,
  TimedLyric,
  UserPlaylist,
  SpatialMode,
  AudioQuality,
  EqualizerBandConfig,
  EqualizerPreset
} from '../types/music';
import { STARTER_SONGS } from '../services/saavnApi';
import { fetchLyrics } from '../services/lyricsService';

export const EQ_BANDS_CONFIG: EqualizerBandConfig[] = [
  { freq: 60, type: 'lowshelf', label: '60Hz' },
  { freq: 170, type: 'peaking', label: '170Hz', q: 1.2 },
  { freq: 350, type: 'peaking', label: '350Hz', q: 1.2 },
  { freq: 1000, type: 'peaking', label: '1kHz', q: 1.2 },
  { freq: 3500, type: 'peaking', label: '3.5kHz', q: 1.2 },
  { freq: 10000, type: 'peaking', label: '10kHz', q: 1.2 },
  { freq: 14000, type: 'highshelf', label: '14kHz' }
];

export const EQ_PRESETS: Record<string, EqualizerPreset> = {
  flat: { name: 'Flat', key: 'flat', gains: [0, 0, 0, 0, 0, 0, 0], preamp: 0 },
  bass_boost: { name: 'Bass Booster', key: 'bass_boost', gains: [7, 6, 3, 0, 0, 0, 0], preamp: -1 },
  bass_reduce: { name: 'Bass Reducer', key: 'bass_reduce', gains: [-7, -5, -3, 0, 0, 0, 0], preamp: 1 },
  treble_boost: { name: 'Treble Booster', key: 'treble_boost', gains: [0, 0, 0, 2, 4, 7, 8], preamp: -1 },
  vocal_boost: { name: 'Vocal Booster', key: 'vocal_boost', gains: [-2, -1, 2, 6, 5, 2, 0], preamp: 0 },
  rock: { name: 'Rock', key: 'rock', gains: [5, 4, -1, 1, 4, 6, 6], preamp: 0 },
  pop: { name: 'Pop', key: 'pop', gains: [-1, 2, 5, 5, 3, -1, 2], preamp: 0 },
  jazz: { name: 'Jazz', key: 'jazz', gains: [3, 3, 1, 3, 1, 2, 3], preamp: 0 },
  electronic: { name: 'Electronic / EDM', key: 'electronic', gains: [6, 5, 0, -2, 3, 5, 6], preamp: -1 },
  classical: { name: 'Classical', key: 'classical', gains: [4, 3, 2, 2, -1, 3, 4], preamp: 0 },
  acoustic: { name: 'Acoustic', key: 'acoustic', gains: [3, 2, 1, 2, 4, 4, 3], preamp: 0 },
  hiphop: { name: 'Hip Hop', key: 'hiphop', gains: [7, 6, 1, 2, -1, 3, 4], preamp: -1 },
  cinema: { name: 'Dolby Cinema', key: 'cinema', gains: [6, 4, 1, 3, 5, 6, 7], preamp: -1 },
  deep: { name: 'Deep Lounge', key: 'deep', gains: [5, 4, 2, 0, -2, -3, -4], preamp: 0 },
  custom: { name: 'Custom', key: 'custom', gains: [0, 0, 0, 0, 0, 0, 0], preamp: 0 }
};

export const EQ_FREQUENCIES = [60, 170, 350, 1000, 3500, 10000, 14000];

interface MusicContextType {
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  lyrics: TimedLyric[];
  isLyricsLoading: boolean;
  isMuted: boolean;
  isLoop: boolean;
  isShuffle: boolean;
  favorites: Song[];
  activeTab: TabType;
  isAiChatOpen: boolean;
  isFullscreenVisualizerOpen: boolean;
  openFullscreenVisualizer: () => void;
  closeFullscreenVisualizer: () => void;

  // Equalizer & Preamp (AudioFXEngine from vthinqweb-player)
  eqEnabled: boolean;
  toggleEQ: (enabled?: boolean) => void;
  currentPreset: string;
  preamp: number;
  setPreamp: (gain: number) => void;
  eqGains: number[]; // 7 band values
  setEqBand: (bandIndex: number, gain: number) => void;
  applyEqPreset: (preset: string | number[]) => void;
  resetEQ: () => void;

  // 3D Surround Spatial Audio Engine
  spatialEnabled: boolean;
  toggleSpatial: (enabled?: boolean) => void;
  spatialMode: SpatialMode;
  setSpatialMode: (mode: SpatialMode) => void;
  autoOrbit: boolean;
  toggleAutoOrbit: (active?: boolean) => void;
  orbitSpeed: number;
  setOrbitSpeed: (speed: number) => void;
  soundstageWidth: number;
  setSoundstageWidth: (width: number) => void;
  reverbSize: number;
  setReverbSize: (size: number) => void;
  subBass: number;
  setSubBass: (bass: number) => void;
  radarAngle: number;
  radarDist: number;
  setSoundPosition: (angleDeg: number, distance?: number) => void;
  resetSpatial: () => void;

  // Audio Streaming Bitrate Quality
  streamQuality: AudioQuality;
  setStreamQuality: (quality: AudioQuality) => void;

  // Backward-compatible properties & methods
  bassBoost: number;
  spatial3D: boolean;
  analyserNode: AnalyserNode | null;
  setBassBoost: (gain: number) => void;
  setSpatial3D: (active: boolean) => void;

  // User Playlists & Navigation
  userPlaylists: UserPlaylist[];
  createPlaylist: (name: string, initialSong?: Song) => UserPlaylist;
  deletePlaylist: (playlistId: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  addToPlaylistSong: Song | null;
  openAddToPlaylistModal: (song: Song) => void;
  closeAddToPlaylistModal: () => void;
  goToAlbum: (song?: Song | null) => void;

  // Sharing & Toast Notifications
  shareModalData: ShareData | null;
  openShareModal: (data: ShareData) => void;
  closeShareModal: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Voice Search Overlay
  isVoiceSearchOpen: boolean;
  openVoiceSearch: () => void;
  closeVoiceSearch: () => void;

  // Actions
  playSong: (song: Song, newPlaylist?: Song[]) => void;
  togglePlay: () => void;
  pauseSong: () => void;
  resumeSong: () => void;
  seek: (seconds: number) => void;
  nextSong: () => void;
  prevSong: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  toggleFavorite: (song: Song) => void;
  isFavorite: (songId: string) => boolean;
  setActiveTab: (tab: TabType) => void;
  setIsAiChatOpen: (open: boolean) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  // Audio playback state
  const [currentSong, setCurrentSong] = useState<Song | null>(() => {
    return STARTER_SONGS[0];
  });
  const [playlist, setPlaylist] = useState<Song[]>(STARTER_SONGS);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoop, setIsLoop] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);

  // Synchronized Lyrics State
  const [lyrics, setLyrics] = useState<TimedLyric[]>([]);
  const [isLyricsLoading, setIsLyricsLoading] = useState<boolean>(false);
  const currentSongRef = useRef<Song | null>(STARTER_SONGS[0]);

  // Favorites stored in state with starter seed
  const [favorites, setFavorites] = useState<Song[]>([STARTER_SONGS[0], STARTER_SONGS[1]]);

  // UI Navigation state
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  const [isFullscreenVisualizerOpen, setIsFullscreenVisualizerOpen] = useState<boolean>(false);

  const openFullscreenVisualizer = useCallback(() => {
    setIsFullscreenVisualizerOpen(true);
  }, []);

  const closeFullscreenVisualizer = useCallback(() => {
    setIsFullscreenVisualizerOpen(false);
  }, []);

  // Sharing & Toast Notification state
  const [shareModalData, setShareModalData] = useState<ShareData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const openShareModal = useCallback((data: ShareData) => {
    setShareModalData(data);
  }, []);

  const closeShareModal = useCallback(() => {
    setShareModalData(null);
  }, []);

  // Voice Search Overlay state
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState<boolean>(false);

  const openVoiceSearch = useCallback(() => {
    setIsVoiceSearchOpen(true);
  }, []);

  const closeVoiceSearch = useCallback(() => {
    setIsVoiceSearchOpen(false);
  }, []);

  // User Playlists state (persisted to localStorage)
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sangeetham_user_playlists');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse user playlists:', e);
      }
    }
    return [
      {
        id: 'pl_favorites_mix',
        name: 'My Special Hits',
        description: 'Personal favorite curated playlist',
        createdAt: Date.now(),
        songs: []
      }
    ];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sangeetham_user_playlists', JSON.stringify(userPlaylists));
      } catch (e) {
        console.warn('Failed to save user playlists:', e);
      }
    }
  }, [userPlaylists]);

  const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);

  const openAddToPlaylistModal = useCallback((song: Song) => {
    setAddToPlaylistSong(song);
  }, []);

  const closeAddToPlaylistModal = useCallback(() => {
    setAddToPlaylistSong(null);
  }, []);

  const createPlaylist = useCallback((name: string, initialSong?: Song): UserPlaylist => {
    const trimmed = name.trim() || 'New Playlist';
    const newPl: UserPlaylist = {
      id: 'pl_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      name: trimmed,
      createdAt: Date.now(),
      cover: initialSong?.image,
      songs: initialSong ? [initialSong] : []
    };
    setUserPlaylists((prev) => [newPl, ...prev]);
    showToast(`✨ Created playlist "${trimmed}"!`);
    return newPl;
  }, [showToast]);

  const deletePlaylist = useCallback((playlistId: string) => {
    setUserPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    showToast('🗑️ Playlist removed');
  }, [showToast]);

  const addSongToPlaylist = useCallback((playlistId: string, song: Song) => {
    setUserPlaylists((prev) => {
      return prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        if (pl.songs.some((s) => s.id === song.id)) {
          showToast(`ℹ️ Already in "${pl.name}"`);
          return pl;
        }
        showToast(`🎶 Added to "${pl.name}"`);
        return {
          ...pl,
          cover: pl.cover || song.image,
          songs: [...pl.songs, song]
        };
      });
    });
  }, [showToast]);

  const removeSongFromPlaylist = useCallback((playlistId: string, songId: string) => {
    setUserPlaylists((prev) => {
      return prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return {
          ...pl,
          songs: pl.songs.filter((s) => s.id !== songId)
        };
      });
    });
    showToast('Removed from playlist');
  }, [showToast]);

  const goToAlbum = useCallback((song?: Song | null) => {
    const target = song || currentSong;
    if (!target) return;
    if (target.albumId) {
      router.push(`/album?id=${encodeURIComponent(target.albumId)}&title=${encodeURIComponent(target.album)}&from=player`);
    } else if (target.album) {
      router.push(`/search?q=${encodeURIComponent(target.album)}&tab=albums`);
    }
  }, [currentSong, router]);

  // AudioFX Engine & Spatial State (persisted to localStorage)
  const [eqEnabled, setEqEnabled] = useState<boolean>(true);
  const [currentPreset, setCurrentPreset] = useState<string>('flat');
  const [preamp, setPreampState] = useState<number>(0);
  const [eqGains, setEqGains] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  // 3D Spatial Audio State
  const [spatialEnabled, setSpatialEnabled] = useState<boolean>(false);
  const [spatialMode, setSpatialModeState] = useState<SpatialMode>('orbit');
  const [autoOrbit, setAutoOrbitState] = useState<boolean>(true);
  const [orbitSpeed, setOrbitSpeedState] = useState<number>(1.0);
  const [soundstageWidth, setSoundstageWidthState] = useState<number>(120);
  const [reverbSize, setReverbSizeState] = useState<number>(35);
  const [subBass, setSubBassState] = useState<number>(3);
  const [radarAngle, setRadarAngle] = useState<number>(0);
  const [radarDist, setRadarDist] = useState<number>(1.5);

  // Audio Streaming Quality state (persisted via sangeetham_stream_quality)
  const [streamQuality, setStreamQualityState] = useState<AudioQuality>('320');
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Core Audio References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const preampGainRef = useRef<GainNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);

  // Spatial Subgraph Nodes
  const spatialInputRef = useRef<GainNode | null>(null);
  const spatialDryGainRef = useRef<GainNode | null>(null);
  const spatialOutputGainRef = useRef<GainNode | null>(null);
  const pannerNodeRef = useRef<PannerNode | null>(null);
  const pannerGainRef = useRef<GainNode | null>(null);
  const splitterRef = useRef<ChannelSplitterNode | null>(null);
  const mergerRef = useRef<ChannelMergerNode | null>(null);
  const haasLRef = useRef<DelayNode | null>(null);
  const haasRRef = useRef<DelayNode | null>(null);
  const crossGainLRef = useRef<GainNode | null>(null);
  const crossGainRRef = useRef<GainNode | null>(null);
  const wideGainRef = useRef<GainNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const reverbWetGainRef = useRef<GainNode | null>(null);
  const subBassFilterRef = useRef<BiquadFilterNode | null>(null);
  const subBassGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const fallbackIndexRef = useRef<number>(0);

  // Synthetic impulse response for concert hall convolver
  const createImpulseResponse = useCallback((ctx: AudioContext, duration = 2.4, decay = 2.2): AudioBuffer => {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * (duration || 2.0));
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const factor = Math.pow(1 - i / length, decay);
      const earlyReflect = i < sampleRate * 0.06 && i % 400 === 0 ? 0.4 : 0;
      left[i] = (Math.random() * 2 - 1) * factor + earlyReflect * factor;
      right[i] = (Math.random() * 2 - 1) * factor + earlyReflect * factor;
    }
    return impulse;
  }, []);

  // Synchronized Central Lyrics Fetcher
  useEffect(() => {
    currentSongRef.current = currentSong;
    setLyrics([]);
    if (!currentSong) {
      setIsLyricsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLyricsLoading(true);
    const targetSongId = currentSong.id;

    fetchLyrics(currentSong.name, currentSong.artist, currentSong.album, currentSong.language)
      .then((data) => {
        if (isMounted && currentSongRef.current?.id === targetSongId) {
          setLyrics(data || []);
          setIsLyricsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted && currentSongRef.current?.id === targetSongId) {
          setLyrics([]);
          setIsLyricsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentSong?.id]);

  // Hydrate volume, favorites, audio FX, and quality safely on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedVol = localStorage.getItem('sangeetham_volume');
      if (savedVol !== null) setVolumeState(parseFloat(savedVol));

      const savedFavs = localStorage.getItem('sangeetham_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedQ = localStorage.getItem('sangeetham_stream_quality');
      if (savedQ === '320' || savedQ === '160' || savedQ === '96') {
        setStreamQualityState(savedQ as AudioQuality);
      }

      const savedFx = localStorage.getItem('sangeetham_audio_fx_v2');
      if (savedFx) {
        const parsed = JSON.parse(savedFx);
        if (typeof parsed.eqEnabled === 'boolean') setEqEnabled(parsed.eqEnabled);
        if (parsed.currentPreset) setCurrentPreset(parsed.currentPreset);
        if (typeof parsed.preamp === 'number') setPreampState(parsed.preamp);
        if (Array.isArray(parsed.gains) && parsed.gains.length === 7) setEqGains(parsed.gains);
        if (typeof parsed.spatialEnabled === 'boolean') setSpatialEnabled(parsed.spatialEnabled);
        if (parsed.spatialMode) setSpatialModeState(parsed.spatialMode);
        if (typeof parsed.autoOrbit === 'boolean') setAutoOrbitState(parsed.autoOrbit);
        if (typeof parsed.orbitSpeed === 'number') setOrbitSpeedState(parsed.orbitSpeed);
        if (typeof parsed.soundstageWidth === 'number') setSoundstageWidthState(parsed.soundstageWidth);
        if (typeof parsed.reverbSize === 'number') setReverbSizeState(parsed.reverbSize);
        if (typeof parsed.subBass === 'number') setSubBassState(parsed.subBass);
        if (typeof parsed.radarAngle === 'number') setRadarAngle(parsed.radarAngle);
        if (typeof parsed.radarDist === 'number') setRadarDist(parsed.radarDist);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save favorites to localStorage when modified (client only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sangeetham_favorites', JSON.stringify(favorites));
      } catch {
        // ignore
      }
    }
  }, [favorites]);

  // Save volume to localStorage (client only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sangeetham_volume', volume.toString());
      } catch {
        // ignore
      }
    }
  }, [volume]);

  // Save AudioFX settings to localStorage when modified
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload = {
        eqEnabled,
        currentPreset,
        preamp,
        gains: eqGains,
        spatialEnabled,
        spatialMode,
        autoOrbit,
        orbitSpeed,
        soundstageWidth,
        reverbSize,
        subBass,
        radarAngle,
        radarDist
      };
      localStorage.setItem('sangeetham_audio_fx_v2', JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [
    eqEnabled,
    currentPreset,
    preamp,
    eqGains,
    spatialEnabled,
    spatialMode,
    autoOrbit,
    orbitSpeed,
    soundstageWidth,
    reverbSize,
    subBass,
    radarAngle,
    radarDist
  ]);

  // Apply AudioFX parameter updates to Web Audio API graph
  const applyAudioGraphSettings = useCallback(
    (
      isEq: boolean,
      preampDb: number,
      gains: number[],
      isSpatial: boolean,
      mode: SpatialMode,
      width: number,
      reverb: number,
      bass: number,
      angle: number,
      dist: number
    ) => {
      const ctx = audioContextRef.current;
      if (!ctx) return;
      const now = ctx.currentTime;

      // 1. Preamp Gain
      if (preampGainRef.current) {
        const pLinear = isEq ? Math.pow(10, preampDb / 20) : 1.0;
        if (preampGainRef.current.gain.setTargetAtTime) {
          preampGainRef.current.gain.setTargetAtTime(pLinear, now, 0.04);
        } else {
          preampGainRef.current.gain.value = pLinear;
        }
      }

      // 2. 7-Band Equalizer Filters
      filtersRef.current.forEach((filter, idx) => {
        if (filter && filter.gain) {
          const target = isEq ? (gains[idx] ?? 0) : 0;
          if (filter.gain.setTargetAtTime) {
            filter.gain.setTargetAtTime(target, now, 0.04);
          } else {
            filter.gain.value = target;
          }
        }
      });

      // 3. Spatial Audio Subgraph Gains
      let dryVal = 1.0;
      let pannerVal = 0.0;
      let wideVal = 0.0;
      let reverbVal = 0.0;
      let subBassVal = 0.0;

      if (isSpatial) {
        const widthRatio = width / 100;
        const reverbRatio = reverb / 100;
        const bassRatio = Math.pow(10, bass / 20) - 1.0;

        if (mode === 'orbit') {
          dryVal = 0.15;
          pannerVal = 0.95;
          reverbVal = 0.18 * reverbRatio;
          subBassVal = 0.25 * bassRatio;
        } else if (mode === 'wide') {
          dryVal = 0.25;
          wideVal = 0.85 * widthRatio;
          reverbVal = 0.12 * reverbRatio;
          subBassVal = 0.3 * bassRatio;
        } else if (mode === 'hall') {
          dryVal = 0.45;
          reverbVal = 0.65 * reverbRatio;
          wideVal = 0.4 * widthRatio;
          subBassVal = 0.3 * bassRatio;
        } else if (mode === 'cinema') {
          dryVal = 0.4;
          wideVal = 0.6 * widthRatio;
          reverbVal = 0.3 * reverbRatio;
          subBassVal = 0.75 * Math.max(0.3, bassRatio);
        } else if (mode === 'vocal') {
          dryVal = 0.6;
          wideVal = 0.5 * widthRatio;
          reverbVal = 0.15 * reverbRatio;
          subBassVal = 0.1 * bassRatio;
        }
      }

      const setNodeGain = (node: GainNode | null, val: number) => {
        if (!node) return;
        if (node.gain.setTargetAtTime) {
          node.gain.setTargetAtTime(val, now, 0.05);
        } else {
          node.gain.value = val;
        }
      };

      setNodeGain(spatialDryGainRef.current, dryVal);
      setNodeGain(pannerGainRef.current, pannerVal);
      setNodeGain(wideGainRef.current, wideVal);
      setNodeGain(reverbWetGainRef.current, reverbVal);
      setNodeGain(subBassGainRef.current, subBassVal);

      // 4. 3D HRTF Panner Position
      const panner = pannerNodeRef.current;
      if (panner) {
        const rad = (angle - 90) * (Math.PI / 180);
        const x = Math.cos(rad) * dist;
        const y = 0;
        const z = Math.sin(rad) * dist;

        if (panner.positionX && panner.positionX.setTargetAtTime) {
          panner.positionX.setTargetAtTime(x, now, 0.04);
          panner.positionY.setTargetAtTime(y, now, 0.04);
          panner.positionZ.setTargetAtTime(z, now, 0.04);
        } else if ((panner as any).setPosition) {
          (panner as any).setPosition(x, y, z);
        }
      }
    },
    []
  );

  // Sync graph whenever AudioFX parameters change
  useEffect(() => {
    applyAudioGraphSettings(
      eqEnabled,
      preamp,
      eqGains,
      spatialEnabled,
      spatialMode,
      soundstageWidth,
      reverbSize,
      subBass,
      radarAngle,
      radarDist
    );
  }, [
    eqEnabled,
    preamp,
    eqGains,
    spatialEnabled,
    spatialMode,
    soundstageWidth,
    reverbSize,
    subBass,
    radarAngle,
    radarDist,
    applyAudioGraphSettings
  ]);

  // 360° Auto-Orbit loop
  useEffect(() => {
    if (!spatialEnabled || !autoOrbit) return;
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      setRadarAngle((prev) => (prev + 45 * orbitSpeed * dt) % 360);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [spatialEnabled, autoOrbit, orbitSpeed]);

  // Setup Web Audio API Graph (Lazily initialized on first user interaction)
  const initWebAudio = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // 1. Source node from HTMLAudioElement
      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      // 2. Preamp Gain (-12dB to +12dB)
      const preampNode = ctx.createGain();
      preampGainRef.current = preampNode;
      source.connect(preampNode);

      // 3. 7-Band Equalizer Filters
      let lastNode: AudioNode = preampNode;
      const filters = EQ_BANDS_CONFIG.map((conf, idx) => {
        const filter = ctx.createBiquadFilter();
        filter.type = conf.type;
        filter.frequency.value = conf.freq;
        if (conf.q) filter.Q.value = conf.q;
        filter.gain.value = eqEnabled ? (eqGains[idx] || 0) : 0;

        lastNode.connect(filter);
        lastNode = filter;
        return filter;
      });
      filtersRef.current = filters;

      // 4. Spatial Hub: Split to dry and spatial branches
      const spatialInput = ctx.createGain();
      spatialInputRef.current = spatialInput;
      lastNode.connect(spatialInput);

      const spatialOutput = ctx.createGain();
      spatialOutputGainRef.current = spatialOutput;

      // Dry Branch
      const dryGain = ctx.createGain();
      dryGain.gain.value = spatialEnabled ? 0.15 : 1.0;
      spatialDryGainRef.current = dryGain;
      spatialInput.connect(dryGain);
      dryGain.connect(spatialOutput);

      // 5. 3D HRTF Panner Branch
      try {
        if (ctx.createPanner) {
          const panner = ctx.createPanner();
          panner.panningModel = 'HRTF';
          panner.distanceModel = 'inverse';
          panner.refDistance = 1;
          panner.maxDistance = 10000;
          panner.rolloffFactor = 1;
          panner.coneInnerAngle = 360;
          pannerNodeRef.current = panner;

          const pannerGain = ctx.createGain();
          pannerGain.gain.value = 0;
          pannerGainRef.current = pannerGain;

          spatialInput.connect(panner);
          panner.connect(pannerGain);
          pannerGain.connect(spatialOutput);
        }
      } catch (err) {
        console.warn('Panner HRTF fallback:', err);
      }

      // 6. Holographic Wide Stereo Branch (Binaural Haas delays & crossfeed)
      try {
        const splitter = ctx.createChannelSplitter(2);
        const merger = ctx.createChannelMerger(2);
        splitterRef.current = splitter;
        mergerRef.current = merger;

        const haasL = ctx.createDelay();
        const haasR = ctx.createDelay();
        haasL.delayTime.value = 0.018;
        haasR.delayTime.value = 0.018;
        haasLRef.current = haasL;
        haasRRef.current = haasR;

        const crossGainL = ctx.createGain();
        const crossGainR = ctx.createGain();
        crossGainL.gain.value = -0.35;
        crossGainR.gain.value = -0.35;
        crossGainLRef.current = crossGainL;
        crossGainRRef.current = crossGainR;

        const wideGain = ctx.createGain();
        wideGain.gain.value = 0;
        wideGainRef.current = wideGain;

        spatialInput.connect(splitter);
        splitter.connect(merger, 0, 0);
        splitter.connect(merger, 1, 1);

        splitter.connect(haasL, 0);
        haasL.connect(crossGainL);
        crossGainL.connect(merger, 0, 1);

        splitter.connect(haasR, 1);
        haasR.connect(crossGainR);
        crossGainR.connect(merger, 0, 0);

        merger.connect(wideGain);
        wideGain.connect(spatialOutput);
      } catch (err) {
        console.warn('Wide stereo setup notice:', err);
      }

      // 7. Concert Hall Convolver Reverb Branch
      try {
        const convolver = ctx.createConvolver();
        convolver.buffer = createImpulseResponse(ctx, 2.4, 2.2);
        convolverRef.current = convolver;

        const reverbWetGain = ctx.createGain();
        reverbWetGain.gain.value = 0;
        reverbWetGainRef.current = reverbWetGain;

        spatialInput.connect(convolver);
        convolver.connect(reverbWetGain);
        reverbWetGain.connect(spatialOutput);
      } catch (err) {
        console.warn('Convolver setup notice:', err);
      }

      // 8. Sub-Bass Immersion Filter Branch
      try {
        const subBassFilter = ctx.createBiquadFilter();
        subBassFilter.type = 'lowpass';
        subBassFilter.frequency.value = 90;
        subBassFilter.Q.value = 2.0;
        subBassFilterRef.current = subBassFilter;

        const subBassGain = ctx.createGain();
        subBassGain.gain.value = 0;
        subBassGainRef.current = subBassGain;

        spatialInput.connect(subBassFilter);
        subBassFilter.connect(subBassGain);
        subBassGain.connect(spatialOutput);
      } catch (err) {
        console.warn('Sub-bass setup notice:', err);
      }

      // 9. AnalyserNode for Real-time Visualizer
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.82;
      analyserRef.current = analyserNode;
      setAnalyser(analyserNode);

      // Connect spatial master to Analyser -> Destination
      spatialOutput.connect(analyserNode);
      analyserNode.connect(ctx.destination);

      // Re-apply current parameters immediately
      applyAudioGraphSettings(
        eqEnabled,
        preamp,
        eqGains,
        spatialEnabled,
        spatialMode,
        soundstageWidth,
        reverbSize,
        subBass,
        radarAngle,
        radarDist
      );
    } catch (e) {
      console.warn('Web Audio initialization note:', e);
    }
  }, [
    createImpulseResponse,
    applyAudioGraphSettings,
    eqEnabled,
    preamp,
    eqGains,
    spatialEnabled,
    spatialMode,
    soundstageWidth,
    reverbSize,
    subBass,
    radarAngle,
    radarDist
  ]);

  // Initialize Audio Element & Event Listeners once on mount
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous'; // required for Web Audio API context
    audio.volume = volume;
    audioRef.current = audio;

    // Attach listeners
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const onWaiting = () => {
      setIsLoading(true);
    };

    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onError = () => {
      setIsLoading(false);
      if (currentSong?.fallbackUrls && fallbackIndexRef.current < currentSong.fallbackUrls.length) {
        const fallbackUrl = currentSong.fallbackUrls[fallbackIndexRef.current++];
        console.warn('Audio playback error, attempting fallback URL if present...');
        audio.src = fallbackUrl;
        audio.play().catch(() => {});
        return;
      }

      // If stream failed under crossOrigin restriction, retry without crossOrigin attribute
      if (audio.crossOrigin) {
        console.warn('Retrying audio playback without crossOrigin constraint...');
        audio.removeAttribute('crossOrigin');
        if (currentSong?.url) {
          audio.src = currentSong.url;
          audio.play().catch(() => {});
        }
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    // Initial song src
    if (currentSong?.url) {
      audio.src = currentSong.url;
    }

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, []);

  // Update MediaSession API for OS/Lockscreen controls & notifications
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentSong) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.name,
      artist: currentSong.artist,
      album: currentSong.album,
      artwork: [
        { src: currentSong.image, sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => togglePlay());
    navigator.mediaSession.setActionHandler('previoustrack', () => prevSong());
    navigator.mediaSession.setActionHandler('nexttrack', () => nextSong());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) seek(details.seekTime);
    });
  }, [currentSong]);

  // Handle track ending: Loop vs Next track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (isLoop) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextSong();
      }
    };

    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('ended', onEnded);
    };
  }, [isLoop, playlist, currentSong, isShuffle]);

  // Play a song
  const playSong = useCallback((song: Song, newPlaylist?: Song[]) => {
    try {
      initWebAudio();
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
    } catch {
      // AudioContext state note
    }

    if (newPlaylist && newPlaylist.length > 0) {
      setPlaylist(newPlaylist);
    }

    // Honor preferred streaming bitrate if song offers downloadUrls or alternate bitrates
    let songToPlay = song;
    const targetBitrate = streamQuality ? `${streamQuality}kbps` : '320kbps';
    if (song.downloadUrls && song.downloadUrls.length > 0) {
      const match = song.downloadUrls.find((d) => d.quality === targetBitrate);
      if (match?.url && match.url !== song.url) {
        songToPlay = {
          ...song,
          url: match.url,
          quality: targetBitrate
        };
      }
    } else if (streamQuality === '160') {
      const url160 =
        song.fallbackUrls?.find((u) => u.includes('_160')) ||
        song.url.replace(/_(320|96|48|12)\.(mp4|m4a)/, '_160.$2');
      if (url160) {
        songToPlay = { ...song, url: url160, quality: '160kbps' };
      }
    } else if (streamQuality === '96') {
      const url96 =
        song.fallbackUrls?.find((u) => u.includes('_96')) ||
        song.url.replace(/_(320|160|48|12)\.(mp4|m4a)/, '_96.$2');
      if (url96) {
        songToPlay = { ...song, url: url96, quality: '96kbps' };
      }
    }

    fallbackIndexRef.current = 0;
    setCurrentSong(songToPlay);
    setCurrentTime(0);
    setDuration(songToPlay.duration || 0);
    setLyrics([]);
    setIsLyricsLoading(true);

    if (audioRef.current) {
      setIsLoading(true);
      audioRef.current.crossOrigin = 'anonymous';
      audioRef.current.src = songToPlay.url;
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          if (err.name === 'NotAllowedError') {
            setIsPlaying(false);
          } else {
            console.warn('Playback stream note:', err);
          }
        });
    }
  }, [initWebAudio]);

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    try {
      initWebAudio();
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
    } catch {
      // AudioContext resume catch
    }

    if (audioRef.current.paused) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Play error:', err);
          setIsPlaying(false);
        });
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [initWebAudio]);

  // Explicit Pause function (e.g. for voice commands, searches, and focus interruptions)
  const pauseSong = useCallback(() => {
    if (!audioRef.current) return;
    if (!audioRef.current.paused) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  // Explicit Resume function (e.g. after voice search cancel or interruption)
  const resumeSong = useCallback(() => {
    if (!audioRef.current) return;
    try {
      initWebAudio();
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
    } catch {
      // AudioContext resume catch
    }

    if (audioRef.current.paused) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Resume error:', err);
          setIsPlaying(false);
        });
    }
  }, [initWebAudio]);

  // Seek audio position
  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  // Next Track
  const nextSong = useCallback(() => {
    if (playlist.length === 0) return;

    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      const currentIdx = playlist.findIndex((s) => s.id === currentSong?.id);
      nextIndex = currentIdx === -1 || currentIdx === playlist.length - 1 ? 0 : currentIdx + 1;
    }

    playSong(playlist[nextIndex]);
  }, [playlist, currentSong, isShuffle, playSong]);

  // Previous Track
  const prevSong = useCallback(() => {
    if (playlist.length === 0) return;

    // If more than 3 seconds in, restart track
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const currentIdx = playlist.findIndex((s) => s.id === currentSong?.id);
    const prevIndex = currentIdx <= 0 ? playlist.length - 1 : currentIdx - 1;
    playSong(playlist[prevIndex]);
  }, [playlist, currentSong, playSong]);

  // Volume
  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0) setIsMuted(false);
  }, []);

  // Mute toggle
  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleLoop = useCallback(() => setIsLoop((prev) => !prev), []);
  const toggleShuffle = useCallback(() => setIsShuffle((prev) => !prev), []);

  // Favorites
  const toggleFavorite = useCallback((song: Song) => {
    setFavorites((prev) => {
      const exists = prev.some((s) => s.id === song.id);
      if (exists) {
        return prev.filter((s) => s.id !== song.id);
      } else {
        return [song, ...prev];
      }
    });
  }, []);

  const isFavorite = useCallback(
    (songId: string) => favorites.some((s) => s.id === songId),
    [favorites]
  );

  // Equalizer & Preamp methods
  const toggleEQ = useCallback((enabled?: boolean) => {
    setEqEnabled((prev) => (typeof enabled === 'boolean' ? enabled : !prev));
  }, []);

  const setPreamp = useCallback((gain: number) => {
    const clamped = Math.max(-12, Math.min(12, gain));
    setPreampState(clamped);
  }, []);

  const setEqBand = useCallback((bandIndex: number, gain: number) => {
    setEqGains((prev) => {
      const next = [...prev];
      next[bandIndex] = Math.max(-12, Math.min(12, gain));
      return next;
    });
    setCurrentPreset('custom');
  }, []);

  const applyEqPreset = useCallback((preset: string | number[]) => {
    if (typeof preset === 'string') {
      const p = EQ_PRESETS[preset];
      if (p) {
        setCurrentPreset(preset);
        setEqGains([...p.gains]);
        setPreampState(p.preamp ?? 0);
      }
    } else if (Array.isArray(preset)) {
      if (preset.length === 5) {
        // Map 5-band presets to 7-band graph
        const mapped = [preset[0], preset[0], preset[1], preset[2], preset[3], preset[4], preset[4]];
        setEqGains(mapped);
      } else {
        setEqGains(preset.slice(0, 7));
      }
      setCurrentPreset('custom');
    }
  }, []);

  const resetEQ = useCallback(() => {
    applyEqPreset('flat');
  }, [applyEqPreset]);

  // 3D Spatial Audio methods
  const toggleSpatial = useCallback((enabled?: boolean) => {
    setSpatialEnabled((prev) => (typeof enabled === 'boolean' ? enabled : !prev));
  }, []);

  const setSpatialMode = useCallback((mode: SpatialMode) => {
    setSpatialModeState(mode);
  }, []);

  const toggleAutoOrbit = useCallback((active?: boolean) => {
    setAutoOrbitState((prev) => (typeof active === 'boolean' ? active : !prev));
  }, []);

  const setOrbitSpeed = useCallback((speed: number) => {
    setOrbitSpeedState(Math.max(0.1, Math.min(3.0, speed)));
  }, []);

  const setSoundstageWidth = useCallback((width: number) => {
    setSoundstageWidthState(Math.max(0, Math.min(200, width)));
  }, []);

  const setReverbSize = useCallback((size: number) => {
    setReverbSizeState(Math.max(0, Math.min(100, size)));
  }, []);

  const setSubBass = useCallback((bass: number) => {
    setSubBassState(Math.max(0, Math.min(10, bass)));
  }, []);

  const setSoundPosition = useCallback((angleDeg: number, distance?: number) => {
    setRadarAngle((angleDeg % 360 + 360) % 360);
    if (typeof distance === 'number') {
      setRadarDist(Math.max(0.4, Math.min(2.5, distance)));
    }
  }, []);

  const resetSpatial = useCallback(() => {
    setSpatialModeState('orbit');
    setAutoOrbitState(true);
    setOrbitSpeedState(1.0);
    setSoundstageWidthState(120);
    setReverbSizeState(35);
    setSubBassState(3);
    setRadarAngle(0);
    setRadarDist(1.5);
  }, []);

  // Backward compatibility
  const setBassBoost = useCallback((gain: number) => {
    setSubBass(gain);
  }, [setSubBass]);

  const setSpatial3D = useCallback((active: boolean) => {
    toggleSpatial(active);
  }, [toggleSpatial]);

  // Audio Streaming Quality Switcher
  const setStreamQuality = useCallback((quality: AudioQuality) => {
    setStreamQualityState(quality);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sangeetham_stream_quality', quality);
      } catch (e) {
        console.warn('Failed to save streaming quality:', e);
      }
    }

    const qLabel =
      quality === '320'
        ? '320kbps Ultra HD Studio Quality 🔥'
        : quality === '160'
        ? '160kbps High Quality Audio 🎧'
        : 'Standard Data Saver Quality (96kbps) 📱';
    showToast(`Streaming quality set to ${qLabel}`);

    // If currently playing, seamlessly switch audio stream without losing track position
    if (currentSong && audioRef.current) {
      const audio = audioRef.current;
      const targetQuality = `${quality}kbps`;

      let targetUrl = '';
      if (currentSong.downloadUrls && currentSong.downloadUrls.length > 0) {
        const found = currentSong.downloadUrls.find((d) => d.quality === targetQuality);
        if (found?.url) targetUrl = found.url;
      }

      if (!targetUrl) {
        if (quality === '320') {
          targetUrl =
            currentSong.fallbackUrls?.find((u) => u.includes('_320')) ||
            currentSong.url.replace(/_(160|96|48|12)\.(mp4|m4a)/, '_320.$2');
        } else if (quality === '160') {
          targetUrl =
            currentSong.fallbackUrls?.find((u) => u.includes('_160')) ||
            currentSong.url.replace(/_(320|96|48|12)\.(mp4|m4a)/, '_160.$2');
        } else {
          targetUrl =
            currentSong.fallbackUrls?.find((u) => u.includes('_96')) ||
            currentSong.url.replace(/_(320|160|48|12)\.(mp4|m4a)/, '_96.$2');
        }
      }

      const prevTime = audio.currentTime;
      const wasPlaying = isPlaying && !audio.paused;

      const updatedSong: Song = {
        ...currentSong,
        url: targetUrl || currentSong.url,
        quality: `${quality}kbps`
      };
      setCurrentSong(updatedSong);

      if (targetUrl && targetUrl !== audio.src) {
        audio.src = targetUrl;
        audio.currentTime = prevTime;
        if (wasPlaying) {
          audio.play().catch(() => {});
        }
      }
    }
  }, [currentSong, isPlaying, showToast]);

  // Deep-link support: auto-play shared song when URL has ?songId=... or ?song=...
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const songId = urlParams.get('songId');
      const songTitle = urlParams.get('song');

      if (songId) {
        import('../services/sangeethamApi').then(({ getSongById, searchSongs }) => {
          getSongById(songId).then((found) => {
            if (found) {
              playSong(found);
              showToast(`🎶 Ready to play: ${found.name}`);
            } else if (songTitle) {
              searchSongs(songTitle, 1, 3).then((res) => {
                if (res && res.length > 0) {
                  playSong(res[0]);
                  showToast(`🎶 Ready to play: ${res[0].name}`);
                }
              });
            }
          });
        });
      }
    } catch (e) {
      console.warn('Deep-link check error:', e);
    }
  }, [playSong, showToast]);

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        playlist,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        volume,
        lyrics,
        isLyricsLoading,
        isMuted,
        isLoop,
        isShuffle,
        favorites,
        activeTab,
        isAiChatOpen,
        isFullscreenVisualizerOpen,
        openFullscreenVisualizer,
        closeFullscreenVisualizer,

        // Equalizer & Preamp
        eqEnabled,
        toggleEQ,
        currentPreset,
        preamp,
        setPreamp,
        eqGains,
        setEqBand,
        applyEqPreset,
        resetEQ,

        // 3D Spatial Audio
        spatialEnabled,
        toggleSpatial,
        spatialMode,
        setSpatialMode,
        autoOrbit,
        toggleAutoOrbit,
        orbitSpeed,
        setOrbitSpeed,
        soundstageWidth,
        setSoundstageWidth,
        reverbSize,
        setReverbSize,
        subBass,
        setSubBass,
        radarAngle,
        radarDist,
        setSoundPosition,
        resetSpatial,

        // Audio Streaming Quality
        streamQuality,
        setStreamQuality,

        // Backward compatibility
        bassBoost: subBass,
        spatial3D: spatialEnabled,
        analyserNode: analyser,
        setBassBoost,
        setSpatial3D,

        // Playlists & Navigation
        userPlaylists,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        addToPlaylistSong,
        openAddToPlaylistModal,
        closeAddToPlaylistModal,
        goToAlbum,

        // Sharing & Toasts
        shareModalData,
        openShareModal,
        closeShareModal,
        toastMessage,
        showToast,
        isVoiceSearchOpen,
        openVoiceSearch,
        closeVoiceSearch,

        // Playback Actions
        playSong,
        togglePlay,
        pauseSong,
        resumeSong,
        seek,
        nextSong,
        prevSong,
        setVolume,
        toggleMute,
        toggleLoop,
        toggleShuffle,
        toggleFavorite,
        isFavorite,
        setActiveTab,
        setIsAiChatOpen
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

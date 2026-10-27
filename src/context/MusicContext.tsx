'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import type { Song, TabType, ShareData } from '../types/music';
import { STARTER_SONGS } from '../services/saavnApi';

interface MusicContextType {
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoop: boolean;
  isShuffle: boolean;
  favorites: Song[];
  activeTab: TabType;
  isAiChatOpen: boolean;
  isFullscreenVisualizerOpen: boolean;
  openFullscreenVisualizer: () => void;
  closeFullscreenVisualizer: () => void;
  eqGains: number[];
  bassBoost: number;
  spatial3D: boolean;
  analyserNode: AnalyserNode | null;

  // Sharing & Toast Notifications
  shareModalData: ShareData | null;
  openShareModal: (data: ShareData) => void;
  closeShareModal: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Actions
  playSong: (song: Song, newPlaylist?: Song[]) => void;
  togglePlay: () => void;
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
  setEqBand: (bandIndex: number, gain: number) => void;
  applyEqPreset: (gains: number[]) => void;
  setBassBoost: (gain: number) => void;
  setSpatial3D: (active: boolean) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Frequencies for our 5-Band Equalizer: 60Hz (Sub-bass), 250Hz (Bass), 1kHz (Mid), 4kHz (High-mid), 12kHz (Treble)
const EQ_FREQUENCIES = [60, 250, 1000, 4000, 12000];

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Equalizer & Web Audio states
  const [eqGains, setEqGains] = useState<number[]>([0, 0, 0, 0, 0]);
  const [bassBoost, setBassBoostState] = useState<number>(3);
  const [spatial3D, setSpatial3DState] = useState<boolean>(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Core References: Kept in useRef to survive re-renders without creating new instances
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const fallbackIndexRef = useRef<number>(0);

  // Hydrate volume and favorites safely on client mount (SSR-safe)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedVol = localStorage.getItem('sangeetham_volume');
      if (savedVol !== null) setVolumeState(parseFloat(savedVol));

      const savedFavs = localStorage.getItem('sangeetham_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
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

      // 2. Create 5 BiquadFilterNodes for Equalizer
      const filters = EQ_FREQUENCIES.map((freq, idx) => {
        const filter = ctx.createBiquadFilter();
        if (idx === 0) {
          filter.type = 'lowshelf';
        } else if (idx === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.0;
        }
        filter.frequency.value = freq;
        filter.gain.value = eqGains[idx] || 0;
        return filter;
      });
      filtersRef.current = filters;

      // 3. Bass Boost filter (lowshelf at 80Hz)
      const bassNode = ctx.createBiquadFilter();
      bassNode.type = 'lowshelf';
      bassNode.frequency.value = 80;
      bassNode.gain.value = bassBoost;
      bassFilterRef.current = bassNode;

      // 4. Stereo Panner / Spatial Node
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      pannerRef.current = panner;

      // 5. AnalyserNode for Visualizer (256 FFT size for smooth particle spectrums)
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.82;
      analyserRef.current = analyserNode;
      setAnalyser(analyserNode);

      // Connect nodes in series:
      // Source -> Bass -> EQ[0] -> EQ[1] -> EQ[2] -> EQ[3] -> EQ[4] -> (Panner) -> Analyser -> Destination
      let lastNode: AudioNode = source;
      lastNode.connect(bassNode);
      lastNode = bassNode;

      filters.forEach((f) => {
        lastNode.connect(f);
        lastNode = f;
      });

      if (panner) {
        lastNode.connect(panner);
        lastNode = panner;
      }

      lastNode.connect(analyserNode);
      analyserNode.connect(ctx.destination);
    } catch (e) {
      console.warn('Web Audio initialization note:', e);
    }
  }, [eqGains, bassBoost]);

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

    fallbackIndexRef.current = 0;
    setCurrentSong(song);

    if (audioRef.current) {
      setIsLoading(true);
      audioRef.current.crossOrigin = 'anonymous';
      audioRef.current.src = song.url;
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

  // Equalizer controls
  const setEqBand = useCallback((bandIndex: number, gain: number) => {
    setEqGains((prev) => {
      const next = [...prev];
      next[bandIndex] = gain;
      if (filtersRef.current[bandIndex]) {
        filtersRef.current[bandIndex].gain.value = gain;
      }
      return next;
    });
  }, []);

  const applyEqPreset = useCallback((gains: number[]) => {
    setEqGains(gains);
    gains.forEach((g, idx) => {
      if (filtersRef.current[idx]) {
        filtersRef.current[idx].gain.value = g;
      }
    });
  }, []);

  const setBassBoost = useCallback((gain: number) => {
    setBassBoostState(gain);
    if (bassFilterRef.current) {
      bassFilterRef.current.gain.value = gain;
    }
  }, []);

  const setSpatial3D = useCallback((active: boolean) => {
    setSpatial3DState(active);
    if (pannerRef.current) {
      pannerRef.current.pan.value = active ? 0.3 : 0;
    }
  }, []);

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
        isMuted,
        isLoop,
        isShuffle,
        favorites,
        activeTab,
        isAiChatOpen,
        isFullscreenVisualizerOpen,
        openFullscreenVisualizer,
        closeFullscreenVisualizer,
        eqGains,
        bassBoost,
        spatial3D,
        analyserNode: analyser,
        shareModalData,
        openShareModal,
        closeShareModal,
        toastMessage,
        showToast,
        playSong,
        togglePlay,
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
        setIsAiChatOpen,
        setEqBand,
        applyEqPreset,
        setBassBoost,
        setSpatial3D
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

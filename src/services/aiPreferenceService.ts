export interface UserMusicPreferences {
  preferredLanguages: string[];
  favoriteArtists: string[];
  dislikedArtists: string[];
  preferredGenres: string[];
  recentActivities: string[];
  savedPlaylistsCount: number;
  likedSongIds: string[];
  dislikedSongIds: string[];
  savedPlaylistTitles: string[];
}

const PREF_STORAGE_KEY = 'sangeetham_ai_user_preferences';

const DEFAULT_PREFERENCES: UserMusicPreferences = {
  preferredLanguages: ['Telugu', 'Hindi'],
  favoriteArtists: ['Sid Sriram', 'Arijit Singh', 'A.R. Rahman', 'S.P. Balasubrahmanyam', 'K.S. Chitra'],
  dislikedArtists: [],
  preferredGenres: ['Melody', 'Romantic', 'Folk', 'Devotional'],
  recentActivities: ['driving', 'relaxing'],
  savedPlaylistsCount: 0,
  likedSongIds: [],
  dislikedSongIds: [],
  savedPlaylistTitles: []
};

// In-memory fallback if localStorage is unavailable
let memoryPrefs: UserMusicPreferences = { ...DEFAULT_PREFERENCES };

export function getUserPreferences(): UserMusicPreferences {
  if (typeof window === 'undefined') return memoryPrefs;
  try {
    const raw = localStorage.getItem(PREF_STORAGE_KEY);
    if (!raw) return memoryPrefs;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return memoryPrefs;
  }
}

export function saveUserPreferences(prefs: Partial<UserMusicPreferences>): UserMusicPreferences {
  const current = getUserPreferences();
  const updated = { ...current, ...prefs };
  memoryPrefs = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  return updated;
}

export function recordSongLike(song: { id: string; artist?: string; language?: string }): void {
  if (!song?.id) return;
  const current = getUserPreferences();
  const liked = Array.from(new Set([song.id, ...current.likedSongIds])).slice(0, 50);
  const updates: Partial<UserMusicPreferences> = { likedSongIds: liked };
  if (song.artist) {
    updates.favoriteArtists = Array.from(new Set([song.artist, ...current.favoriteArtists])).slice(0, 20);
  }
  if (song.language) {
    updates.preferredLanguages = Array.from(new Set([song.language, ...current.preferredLanguages])).slice(0, 10);
  }
  saveUserPreferences(updates);
}

export function recordSongDislike(song: { id: string }): void {
  if (!song?.id) return;
  const current = getUserPreferences();
  const disliked = Array.from(new Set([song.id, ...current.dislikedSongIds])).slice(0, 50);
  saveUserPreferences({ dislikedSongIds: disliked });
}

export function recordSongSkip(song: { id: string }): void {
  if (!song?.id) return;
  const current = getUserPreferences();
  const disliked = Array.from(new Set([song.id, ...current.dislikedSongIds])).slice(0, 50);
  saveUserPreferences({ dislikedSongIds: disliked });
}

export function recordPlaylistSave(playlistTitle: string): void {
  if (!playlistTitle) return;
  const current = getUserPreferences();
  const saved = Array.from(new Set([playlistTitle, ...current.savedPlaylistTitles])).slice(0, 30);
  saveUserPreferences({
    savedPlaylistTitles: saved,
    savedPlaylistsCount: current.savedPlaylistsCount + 1
  });
}

export function recordFavoriteArtist(artistName: string): void {
  if (!artistName) return;
  const current = getUserPreferences();
  if (!current.favoriteArtists.includes(artistName)) {
    saveUserPreferences({
      favoriteArtists: [artistName, ...current.favoriteArtists].slice(0, 20)
    });
  }
}

export function recordPreferredLanguage(lang: string): void {
  if (!lang) return;
  const current = getUserPreferences();
  if (!current.preferredLanguages.includes(lang)) {
    saveUserPreferences({
      preferredLanguages: [lang, ...current.preferredLanguages].slice(0, 8)
    });
  }
}

export function resetUserPreferences(): UserMusicPreferences {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(PREF_STORAGE_KEY);
    } catch {}
  }
  return DEFAULT_PREFERENCES;
}

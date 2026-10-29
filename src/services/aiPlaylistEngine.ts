import type { Song } from '../types/music';
import type { PlaylistConstraints, GeneratedPlaylist } from '../types/ai';
import {
  searchSongs,
  fetchTeluguSongs,
  fetchHindiSongs,
  fetchDevotionalSongs,
  STARTER_SONGS
} from './sangeethamApi';
import { detectFestivalOrOccasion } from './occasionService';

// Extract playlist constraints from natural language
export function parsePlaylistConstraints(query: string, currentConstraints?: Partial<PlaylistConstraints> | null): PlaylistConstraints {
  const q = query.toLowerCase();

  const base: PlaylistConstraints = {
    languages: currentConstraints?.languages ? [...currentConstraints.languages] : [],
    moods: currentConstraints?.moods ? [...currentConstraints.moods] : [],
    genres: currentConstraints?.genres ? [...currentConstraints.genres] : [],
    activities: currentConstraints?.activities ? [...currentConstraints.activities] : [],
    eras: currentConstraints?.eras ? [...currentConstraints.eras] : [],
    artists: currentConstraints?.artists ? [...currentConstraints.artists] : [],
    targetDurationMinutes: currentConstraints?.targetDurationMinutes ?? 45,
    isDevotional: currentConstraints?.isDevotional,
    deity: currentConstraints?.deity,
    occasion: currentConstraints?.occasion
  };

  // 1. Languages
  const langPatterns: Record<string, string> = {
    telugu: 'Telugu',
    hindi: 'Hindi',
    tamil: 'Tamil',
    kannada: 'Kannada',
    malayalam: 'Malayalam',
    sanskrit: 'Sanskrit',
    english: 'English'
  };

  for (const [key, langName] of Object.entries(langPatterns)) {
    if (q.includes(key)) {
      if (!base.languages.includes(langName)) {
        base.languages.push(langName);
      }
    }
  }

  // 2. Activities
  const activityPatterns = ['driving', 'drive', 'road trip', 'workout', 'gym', 'running', 'study', 'studying', 'sleep', 'relaxing', 'party'];
  for (const act of activityPatterns) {
    if (q.includes(act)) {
      const canonical = act === 'drive' ? 'driving' : act === 'gym' ? 'workout' : act;
      if (!base.activities.includes(canonical)) {
        base.activities.push(canonical);
      }
    }
  }

  // 3. Moods
  const moodPatterns = ['romantic', 'love', 'happy', 'energetic', 'sad', 'heartbreak', 'peaceful', 'calm', 'nostalgic', 'motivational', 'spiritual', 'devotional'];
  for (const mood of moodPatterns) {
    if (q.includes(mood)) {
      const canonical = mood === 'love' ? 'romantic' : mood === 'calm' ? 'peaceful' : mood === 'devotional' ? 'spiritual' : mood;
      if (!base.moods.includes(canonical)) {
        base.moods.push(canonical);
      }
    }
  }

  // 3b. Genres
  const genrePatterns = ['romantic', 'melody', 'melodies', 'pop', 'folk', 'classical', 'electronic', 'lo-fi', 'lofi'];
  for (const g of genrePatterns) {
    if (q.includes(g)) {
      const canonical = g === 'melodies' ? 'melody' : g === 'lofi' ? 'lo-fi' : g;
      if (!base.genres.includes(canonical)) {
        base.genres.push(canonical);
      }
    }
  }

  // 4. Eras
  if (q.includes('2000s') || q.includes('2000')) base.eras = ['2000s'];
  else if (q.includes('90s') || q.includes('1990s')) base.eras = ['1990s'];
  else if (q.includes('80s') || q.includes('1980s')) base.eras = ['1980s'];
  else if (q.includes('latest') || q.includes('recent') || q.includes('new')) base.eras = ['recent'];

  // 5. Durations (e.g., "45 minutes", "one hour", "30 mins", "1 hr", "60 mins")
  const durationMinMatch = q.match(/(\d+)\s*(?:minutes|mins|min)/i);
  if (durationMinMatch) {
    base.targetDurationMinutes = parseInt(durationMinMatch[1], 10);
  } else if (q.includes('one hour') || q.includes('1 hour') || q.includes('1 hr')) {
    base.targetDurationMinutes = 60;
  } else if (q.includes('two hours') || q.includes('2 hours')) {
    base.targetDurationMinutes = 120;
  }

  // 6. Devotional / Occasion
  const detectedOccasion = detectFestivalOrOccasion(query);
  if (detectedOccasion) {
    base.isDevotional = true;
    base.occasion = detectedOccasion.title;
    base.deity = detectedOccasion.deity;
    if (base.languages.length === 0) {
      base.languages = detectedOccasion.suggestedLanguages.slice(0, 2);
    }
  }

  // Default fallback if no language specified
  if (base.languages.length === 0) {
    base.languages = ['Telugu'];
  }

  return base;
}

// Generate real catalog playlist matching extracted constraints
export async function generateAIPlaylist(constraints: PlaylistConstraints): Promise<GeneratedPlaylist> {
  const songsCollected: Song[] = [];
  const seenIds = new Set<string>();

  const addUniqueSongs = (list: Song[]) => {
    for (const s of list) {
      if (s && s.id && !seenIds.has(s.id) && s.url) {
        seenIds.add(s.id);
        songsCollected.push(s);
      }
    }
  };

  // 1. Fetch tracks based on languages and constraints
  const primaryLang = constraints.languages[0] || 'Telugu';
  const isMultiLang = constraints.languages.length > 1;

  // Build targeted search queries
  const moodTag = constraints.moods[0] || (constraints.activities.includes('driving') ? 'melody' : '');
  const eraTag = constraints.eras[0] ? ` ${constraints.eras[0]}` : '';

  if (constraints.isDevotional) {
    const devHits = await fetchDevotionalSongs();
    addUniqueSongs(devHits);
    if (constraints.deity) {
      const deityHits = await searchSongs(`${constraints.deity} ${primaryLang} devotional`, 1, 10);
      addUniqueSongs(deityHits);
    }
  } else {
    for (const lang of constraints.languages) {
      const term = `${lang} ${moodTag}${eraTag} hits`.trim();
      const results = await searchSongs(term, 1, 12);
      addUniqueSongs(results);
    }
  }

  // 2. Ensure fallback starter songs if network or API results are sparse
  if (songsCollected.length < 5) {
    const starters = STARTER_SONGS.filter((s) => {
      if (constraints.languages.length > 0) {
        return constraints.languages.some((l) => (s.language || '').toLowerCase().includes(l.toLowerCase()));
      }
      return true;
    });
    addUniqueSongs(starters.length > 0 ? starters : STARTER_SONGS);
  }

  // 3. Balance languages if multiple were requested
  let balancedSongs: Song[] = [];
  if (isMultiLang) {
    const buckets: Record<string, Song[]> = {};
    for (const lang of constraints.languages) {
      buckets[lang.toLowerCase()] = [];
    }

    for (const s of songsCollected) {
      const sLang = (s.language || '').toLowerCase();
      const matchedBucket = constraints.languages.find((l) => sLang.includes(l.toLowerCase()));
      if (matchedBucket) {
        buckets[matchedBucket.toLowerCase()].push(s);
      } else {
        // Distribute to first bucket
        buckets[constraints.languages[0].toLowerCase()]?.push(s);
      }
    }

    // Interleave songs evenly across languages
    const maxLen = Math.max(...Object.values(buckets).map((b) => b.length), 0);
    for (let i = 0; i < maxLen; i++) {
      for (const lang of constraints.languages) {
        const item = buckets[lang.toLowerCase()]?.[i];
        if (item) balancedSongs.push(item);
      }
    }
  } else {
    balancedSongs = [...songsCollected];
  }

  // 4. Accumulate tracks up to the target duration (e.g. 45 or 60 mins)
  const targetSeconds = (constraints.targetDurationMinutes || 45) * 60;
  const finalTracks: Song[] = [];
  let accumulatedDuration = 0;

  for (const track of balancedSongs) {
    const trackDuration = track.duration && track.duration > 30 ? track.duration : 270; // 4.5 mins default
    finalTracks.push(track);
    accumulatedDuration += trackDuration;

    // Stop if duration is within 10% of target or exceeded
    if (accumulatedDuration >= targetSeconds - 120 && finalTracks.length >= 4) {
      break;
    }
  }

  // Ensure minimum 4 tracks
  if (finalTracks.length < 4 && balancedSongs.length >= 4) {
    for (let i = finalTracks.length; i < 4; i++) {
      if (balancedSongs[i]) {
        finalTracks.push(balancedSongs[i]);
        accumulatedDuration += balancedSongs[i].duration || 270;
      }
    }
  }

  // 5. Generate human title & contextual explanation
  const langTitle = constraints.languages.join(' & ');
  const moodTitle = constraints.moods.length > 0 ? `${constraints.moods.join(' ')} ` : '';
  const actTitle = constraints.activities.includes('driving') ? 'Drive' : 'Mix';
  const playlistTitle = constraints.isDevotional
    ? `${constraints.deity || 'Devotional'} Sacred Prayers (${langTitle})`
    : `Sangeetham ${langTitle} ${moodTitle}${actTitle}`;

  const durationMin = Math.round(accumulatedDuration / 60);
  const explanation = `Crafted a personalized ${durationMin}-minute playlist featuring **${finalTracks.length} playable tracks** across ${langTitle}${
    constraints.eras.length > 0 ? ` from the ${constraints.eras.join(', ')}` : ''
  }${constraints.moods.length > 0 ? ` with ${constraints.moods.join(', ')} energy` : ''}.`;

  return {
    id: `playlist_ai_${Date.now()}`,
    title: playlistTitle,
    description: `${langTitle} • ${durationMin} mins • ${finalTracks.length} tracks`,
    songs: finalTracks,
    totalDurationSeconds: accumulatedDuration,
    constraints,
    explanation
  };
}

// Conversational refinement of an existing playlist (preserving unchanged dimensions)
export async function refineAIPlaylist(
  existingPlaylist: GeneratedPlaylist,
  refinementQuery: string,
  overrideConstraints?: Partial<PlaylistConstraints>
): Promise<GeneratedPlaylist> {
  let updatedConstraints = parsePlaylistConstraints(refinementQuery, existingPlaylist.constraints);
  if (overrideConstraints) {
    updatedConstraints = { ...updatedConstraints, ...overrideConstraints };
  }
  return generateAIPlaylist(updatedConstraints);
}

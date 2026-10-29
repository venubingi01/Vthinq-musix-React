import { describe, it, expect } from 'vitest';
import {
  classifyIntent,
  processAIChatMessage
} from '../services/aiOrchestratorService';
import {
  parsePlaylistConstraints,
  generateAIPlaylist,
  refineAIPlaylist
} from '../services/aiPlaylistEngine';
import {
  findVerifiedSongKnowledge,
  resolveSongKnowledgeFromContext,
  formatSongKnowledgeReply
} from '../services/songKnowledgeService';
import {
  detectFestivalOrOccasion,
  getTodayDevotionalOccasion,
  WEEKDAY_DEVOTIONAL_MAP,
  WEEKDAY_MAP_BY_NAME
} from '../services/occasionService';
import {
  getUserPreferences,
  recordSongLike,
  recordSongDislike,
  recordPlaylistSave
} from '../services/aiPreferenceService';

describe('Sangeetham AI Companion — Intent Classification', () => {
  it('correctly classifies playback control commands', () => {
    expect(classifyIntent('next')).toBe('playback_control');
    expect(classifyIntent('skip')).toBe('playback_control');
    expect(classifyIntent('pause')).toBe('playback_control');
    expect(classifyIntent('resume')).toBe('playback_control');
    expect(classifyIntent('replay')).toBe('playback_control');
    expect(classifyIntent('shuffle')).toBe('playback_control');
    expect(classifyIntent('volume up')).toBe('playback_control');
    expect(classifyIntent('open equalizer')).toBe('playback_control');
    expect(classifyIntent('show visualizer')).toBe('playback_control');
  });

  it('correctly classifies factual song knowledge questions', () => {
    expect(classifyIntent('Who sang this song?', true)).toBe('song_info');
    expect(classifyIntent('Who is the music director of Kesariya?')).toBe('song_info');
    expect(classifyIntent('Who wrote the lyrics for Manasavacha?')).toBe('song_info');
    expect(classifyIntent('Which movie is this song from?', true)).toBe('song_info');
    expect(classifyIntent('Who is the hero in this song?', true)).toBe('song_info');
    expect(classifyIntent('Tell me interesting facts about this song', true)).toBe('song_info');
  });

  it('correctly classifies devotional and occasion requests', () => {
    expect(classifyIntent('Play Sai Baba songs in Telugu')).toBe('devotional_occasion');
    expect(classifyIntent('Today is Thursday, create a devotional playlist')).toBe('devotional_occasion');
    expect(classifyIntent('Play Hanuman devotional songs')).toBe('devotional_occasion');
    expect(classifyIntent('Create a Shiva playlist for Maha Shivaratri')).toBe('devotional_occasion');
    expect(classifyIntent('Play Ganesh songs for Ganesh Chaturthi')).toBe('devotional_occasion');
  });

  it('correctly classifies playlist generation requests', () => {
    expect(classifyIntent('Create a one-hour driving playlist with Telugu and Hindi songs')).toBe('playlist_generate');
    expect(classifyIntent('Play romantic Telugu melodies')).toBe('playlist_generate');
    expect(classifyIntent('Suggest peaceful Lo-Fi study music')).toBe('playlist_generate');
    expect(classifyIntent('Create high-energy workout music')).toBe('playlist_generate');
  });

  it('correctly classifies multi-turn playlist refinements', () => {
    expect(classifyIntent('Only songs from the 2000s')).toBe('playlist_refine');
    expect(classifyIntent('Add Hindi songs too')).toBe('playlist_refine');
    expect(classifyIntent('Make it 45 minutes')).toBe('playlist_refine');
    expect(classifyIntent('Make it more upbeat')).toBe('playlist_refine');
  });
});

describe('Sangeetham AI Companion — Playlist Engine & Constraints', () => {
  it('extracts activity, mood, languages, era, and duration accurately', () => {
    const prompt = 'Create a 45-minute driving playlist with energetic Telugu and Hindi songs from 2000s';
    const constraints = parsePlaylistConstraints(prompt);

    expect(constraints.activities).toContain('driving');
    expect(constraints.moods).toContain('energetic');
    expect(constraints.languages).toContain('Telugu');
    expect(constraints.languages).toContain('Hindi');
    expect(constraints.eras).toContain('2000s');
    expect(constraints.targetDurationMinutes).toBe(45);
  });

  it('multi-turn refinement preserves previous constraints and only updates modified dimensions', () => {
    const initial = parsePlaylistConstraints('Create a Telugu romantic playlist');
    expect(initial.languages).toEqual(['Telugu']);
    expect(initial.genres).toContain('romantic');

    // Turn 2: "Only songs from the 2000s"
    const refined1 = parsePlaylistConstraints('Only songs from the 2000s', initial);
    expect(refined1.languages).toEqual(['Telugu']);
    expect(refined1.genres).toContain('romantic');
    expect(refined1.eras).toContain('2000s');

    // Turn 3: "Add Hindi songs too"
    const refined2 = parsePlaylistConstraints('Add Hindi songs too', refined1);
    expect(refined2.languages).toContain('Telugu');
    expect(refined2.languages).toContain('Hindi');
    expect(refined2.genres).toContain('romantic');
    expect(refined2.eras).toContain('2000s');

    // Turn 4: "Make it 45 minutes"
    const refined3 = parsePlaylistConstraints('Make it 45 minutes', refined2);
    expect(refined3.targetDurationMinutes).toBe(45);
    expect(refined3.languages).toContain('Telugu');
    expect(refined3.languages).toContain('Hindi');
  });

  it('generates real catalog songs and calculates realistic duration', async () => {
    const constraints = parsePlaylistConstraints('Play Telugu romantic melodies', {
      targetDurationMinutes: 15
    });

    const playlist = await generateAIPlaylist(constraints);
    expect(playlist.songs.length).toBeGreaterThan(0);
    expect(playlist.totalDurationSeconds).toBeGreaterThan(0);
    // Real songs must have valid stream URLs
    playlist.songs.forEach((song) => {
      expect(song.url).toBeTruthy();
      expect(song.name).toBeTruthy();
      expect(song.artist).toBeTruthy();
    });
  });
});

describe('Sangeetham AI Companion — Song Knowledge Assistant', () => {
  it('retrieves verified credits for verified catalog songs', () => {
    const fact = findVerifiedSongKnowledge('Manasavacha');
    expect(fact).not.toBeNull();
    expect(fact?.songTitle).toBe('Manasavacha');
    expect(fact?.movieOrAlbum).toContain('Godavari');
    expect(fact?.singers).toContain('Unni Krishnan');
    expect(fact?.musicDirectors).toContain('K.M. Radha Krishnan');
    expect(fact?.verificationStatus).toBe('verified');
    expect(fact?.sources.length).toBeGreaterThan(0);
  });

  it('retrieves Kesariya credits accurately', () => {
    const fact = findVerifiedSongKnowledge('Kesariya');
    expect(fact).not.toBeNull();
    expect(fact?.movieOrAlbum).toContain('Brahmāstra');
    expect(fact?.singers).toContain('Arijit Singh');
    expect(fact?.musicDirectors).toContain('Pritam');
    expect(fact?.lyricists.some((l) => l.includes('Amitabh Bhattacharya'))).toBe(true);
    expect(fact?.verificationStatus).toBe('verified');
  });

  it('formats natural answers targeting specific question dimension', () => {
    const fact = findVerifiedSongKnowledge('Kesariya');
    expect(fact).not.toBeNull();
    if (!fact) return;

    const singerReply = formatSongKnowledgeReply(fact, 'Who sang this song?');
    expect(singerReply.toLowerCase()).toContain('arijit singh');

    const composerReply = formatSongKnowledgeReply(fact, 'Who composed this song?');
    expect(composerReply.toLowerCase()).toContain('pritam');

    const movieReply = formatSongKnowledgeReply(fact, 'Which movie is this from?');
    expect(movieReply.toLowerCase()).toContain('brahmāstra');
  });

  it('handles unknown songs gracefully without hallucinating', () => {
    const fact = findVerifiedSongKnowledge('CompletelyUnknownSong12345XYZ');
    expect(fact).toBeNull();
  });
});

describe('Sangeetham AI Companion — Devotional & Festival Intelligence', () => {
  it('provides verified deity and occasion for each weekday', () => {
    const thurs = WEEKDAY_MAP_BY_NAME['thursday'];
    expect(thurs.deity).toContain('Sai Baba');
    expect(thurs.suggestedLanguages).toContain('Telugu');

    const monday = WEEKDAY_MAP_BY_NAME['monday'];
    expect(monday.deity).toBe('Lord Shiva');

    const tuesday = WEEKDAY_MAP_BY_NAME['tuesday'];
    expect(tuesday.deity).toContain('Lord Hanuman');
  });

  it('detects major Indian festivals from natural queries', () => {
    const shivaratri = detectFestivalOrOccasion('Create a Shiva playlist for Maha Shivaratri');
    expect(shivaratri?.title).toBe('Maha Shivaratri');
    expect(shivaratri?.deity).toBe('Lord Shiva');

    const ganesh = detectFestivalOrOccasion('Play Ganesh songs for Ganesh Chaturthi');
    expect(ganesh?.title).toContain('Ganesh Chaturthi');
    expect(ganesh?.deity).toBe('Lord Ganesha');

    const ramNavami = detectFestivalOrOccasion('Play Rama bhajans for Sri Rama Navami');
    expect(ramNavami?.title).toBe('Sri Rama Navami');
    expect(ramNavami?.deity).toBe('Lord Rama');
  });

  it('getTodayDevotionalOccasion returns a valid devotional theme', () => {
    const today = getTodayDevotionalOccasion();
    expect(today.title).toBeTruthy();
    expect(today.deity).toBeTruthy();
    expect(today.suggestedLanguages.length).toBeGreaterThan(0);
  });
});

describe('Sangeetham AI Companion — Orchestration & Multi-turn Execution', () => {
  it('processes natural language playback commands', async () => {
    const res = await processAIChatMessage({ message: 'Next song' });
    expect(res.intent).toBe('playback_control');
    expect(res.playbackCommand?.action).toBe('next');
    expect(res.replyText).toContain('Skipping');
  });

  it('processes driving playlist request into playable catalog tracks', async () => {
    const res = await processAIChatMessage({
      message: 'Create a 1-hour driving playlist with Telugu songs'
    });

    expect(res.intent).toBe('playlist_generate');
    expect(res.generatedPlaylist).toBeDefined();
    expect(res.generatedPlaylist?.songs.length).toBeGreaterThan(0);
    expect(res.activeConstraints?.activities).toContain('driving');
  });

  it('handles song info questions with active track context', async () => {
    const res = await processAIChatMessage({
      message: 'Who composed this song?',
      activeTrack: {
        id: 'track_1',
        name: 'Kesariya',
        artist: 'Arijit Singh, Pritam',
        album: 'Brahmāstra',
        language: 'Hindi'
      }
    });

    expect(res.intent).toBe('song_info');
    expect(res.songFactSheet).toBeDefined();
    expect(res.songFactSheet?.musicDirectors).toContain('Pritam');
  });
});

describe('Sangeetham AI Companion — Personalization & Preference Tracking', () => {
  it('stores and retrieves likes and skips respectfully', () => {
    const dummySong = {
      id: 'test_song_1',
      name: 'Test Melody',
      artist: 'Test Singer',
      album: 'Test Album',
      image: '',
      url: 'https://example.com/audio.mp3',
      language: 'Telugu'
    };

    recordSongLike(dummySong);
    const prefsAfterLike = getUserPreferences();
    expect(prefsAfterLike.likedSongIds).toContain('test_song_1');

    recordSongDislike(dummySong);
    const prefsAfterDislike = getUserPreferences();
    expect(prefsAfterDislike.dislikedSongIds).toContain('test_song_1');

    recordPlaylistSave('My Favorite Telugu Mix');
    const prefsAfterSave = getUserPreferences();
    expect(prefsAfterSave.savedPlaylistTitles).toContain('My Favorite Telugu Mix');
  });
});

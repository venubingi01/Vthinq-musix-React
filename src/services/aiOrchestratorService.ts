import type {
  AIChatRequest,
  AIChatResponse,
  AIIntentType,
  PlaybackCommand
} from '../types/ai';
import {
  parsePlaylistConstraints,
  generateAIPlaylist,
  refineAIPlaylist
} from './aiPlaylistEngine';
import {
  resolveSongKnowledgeFromContext,
  findVerifiedSongKnowledge,
  formatSongKnowledgeReply
} from './songKnowledgeService';
import { detectFestivalOrOccasion, getTodayDevotionalOccasion } from './occasionService';
import { searchSongs, STARTER_SONGS } from './sangeethamApi';

// Intent Classifier
export function classifyIntent(query: string, hasActiveTrack = false): AIIntentType {
  const q = query.toLowerCase().trim();

  // 1. Playback controls
  if (
    q === 'next' ||
    q === 'next song' ||
    q === 'skip' ||
    q === 'previous' ||
    q === 'prev' ||
    q === 'pause' ||
    q === 'stop' ||
    q === 'resume' ||
    q === 'play' ||
    q === 'replay' ||
    q.includes('volume up') ||
    q.includes('volume down') ||
    q.includes('louder') ||
    q.includes('quieter') ||
    q.includes('shuffle') ||
    q.includes('repeat') ||
    q.includes('open equalizer') ||
    q.includes('show visualizer')
  ) {
    return 'playback_control';
  }

  // 2. Factual song questions
  if (
    q.includes('who sang') ||
    q.includes('who is the singer') ||
    q.includes('singer of') ||
    q.includes('who composed') ||
    q.includes('music director') ||
    q.includes('who wrote the lyrics') ||
    q.includes('lyricist') ||
    q.includes('which movie') ||
    q.includes('which album') ||
    q.includes('who is the hero') ||
    q.includes('who is the heroine') ||
    q.includes('who directed') ||
    q.includes('cast and crew') ||
    q.includes('tell me about this song') ||
    q.includes('facts about') ||
    q.includes('trivia') ||
    (hasActiveTrack && (q.includes('who is this') || q.includes('when was it released') || q.includes('tell me about the singer')))
  ) {
    return 'song_info';
  }

  // 3. Devotional & festival requests
  if (
    q.includes('devotional') ||
    q.includes('bhajan') ||
    q.includes('aarti') ||
    q.includes('stotram') ||
    q.includes('mantra') ||
    q.includes('shivaratri') ||
    q.includes('hanuman') ||
    q.includes('sai baba') ||
    q.includes('venkateswara') ||
    q.includes('ganesh') ||
    q.includes('krishna') ||
    q.includes('ram navami') ||
    q.includes('today is thursday') ||
    q.includes('morning prayer')
  ) {
    return 'devotional_occasion';
  }

  // 4. Playlist Refinements (e.g. "Only from 2000s", "Add Hindi too", "Make it 45 minutes")
  if (
    q.startsWith('only ') ||
    q.startsWith('add ') ||
    q.startsWith('make it ') ||
    q.includes('too') ||
    q.includes('more upbeat') ||
    q.includes('softer') ||
    q.includes('more energetic') ||
    q.includes('remove ')
  ) {
    return 'playlist_refine';
  }

  // 5. Playlist Generation
  if (
    q.includes('playlist') ||
    q.includes('driving') ||
    q.includes('drive') ||
    q.includes('workout') ||
    q.includes('romantic songs') ||
    q.includes('romantic') ||
    q.includes('melodies') ||
    q.includes('melody') ||
    q.includes('sad songs') ||
    q.includes('happy songs') ||
    q.includes('songs for') ||
    q.includes('study') ||
    q.includes('lo-fi') ||
    q.includes('lofi') ||
    q.includes('relaxing') ||
    q.includes('peaceful') ||
    q.startsWith('create ') ||
    q.startsWith('suggest ')
  ) {
    return 'playlist_generate';
  }

  // 6. Direct song play commands (e.g. "Play Sid Sriram songs", "Play Kesariya")
  if (q.startsWith('play ') || q.startsWith('search ')) {
    return 'recommendation';
  }

  return 'general_chat';
}

// Main Conversational AI Orchestrator
export async function processAIChatMessage(request: AIChatRequest): Promise<AIChatResponse> {
  const { message, activeTrack, activeConstraints, conversationId = `conv_${Date.now()}` } = request;
  const intent = classifyIntent(message, !!activeTrack);
  const qLower = message.toLowerCase().trim();

  // A. PLAYBACK CONTROL
  if (intent === 'playback_control') {
    let action: PlaybackCommand['action'] = 'play';
    let reply = 'Executing playback action.';

    if (qLower.includes('next') || qLower.includes('skip')) {
      action = 'next';
      reply = '⏭️ Skipping to the next track.';
    } else if (qLower.includes('previous') || qLower.includes('prev') || qLower.includes('last song')) {
      action = 'prev';
      reply = '⏮️ Playing previous track.';
    } else if (qLower.includes('pause') || qLower.includes('stop')) {
      action = 'pause';
      reply = '⏸️ Playback paused.';
    } else if (qLower.includes('resume') || qLower === 'play') {
      action = 'resume';
      reply = '▶️ Playback resumed.';
    } else if (qLower.includes('replay') || qLower.includes('same song')) {
      action = 'replay';
      reply = '🔁 Replaying the current track.';
    } else if (qLower.includes('shuffle')) {
      action = 'shuffle';
      reply = '🔀 Toggled queue shuffle.';
    } else if (qLower.includes('repeat') || qLower.includes('loop')) {
      action = 'loop';
      reply = '🔂 Toggled track repeat.';
    } else if (qLower.includes('volume up') || qLower.includes('louder')) {
      action = 'volume_up';
      reply = '🔊 Volume increased.';
    } else if (qLower.includes('volume down') || qLower.includes('quieter')) {
      action = 'volume_down';
      reply = '🔉 Volume decreased.';
    } else if (qLower.includes('visualizer')) {
      action = 'show_visualizer';
      reply = '📊 Visualizer opened.';
    } else if (qLower.includes('equalizer')) {
      action = 'open_equalizer';
      reply = '🎚️ Sound Equalizer opened.';
    }

    return {
      conversationId,
      intent,
      replyText: reply,
      playbackCommand: { action },
      suggestedFollowUps: ['Who sang this song?', 'Make a driving playlist', 'Show visualizer']
    };
  }

  // B. FACTUAL SONG KNOWLEDGE ASSISTANT
  if (intent === 'song_info') {
    // Determine target song title
    let targetTitle = activeTrack?.name || '';
    const ofMatch = message.match(/(?:of|for|about|in)\s+["']?([^"']+)["']?/i);
    if (ofMatch && ofMatch[1].trim()) {
      targetTitle = ofMatch[1].trim();
    }

    let factSheet = findVerifiedSongKnowledge(targetTitle);

    if (!factSheet && activeTrack) {
      factSheet = resolveSongKnowledgeFromContext(activeTrack, message);
    }

    if (factSheet) {
      const formattedReply = formatSongKnowledgeReply(factSheet, message);
      return {
        conversationId,
        intent,
        replyText: formattedReply,
        songFactSheet: factSheet,
        suggestedFollowUps: [
          `More songs by ${factSheet.singers[0] || 'this singer'}`,
          `Who is the music director?`,
          `Play songs from ${factSheet.movieOrAlbum}`
        ]
      };
    }

    return {
      conversationId,
      intent,
      replyText: `I couldn't verify credits for "${targetTitle}". Play a track or ask about popular hits like *Manasavacha*, *Kesariya*, or *Vennelave Vennelave*.`,
      suggestedFollowUps: ['Tell me about Manasavacha', 'Who composed Kesariya?', 'Play Sid Sriram songs']
    };
  }

  // C. DEVOTIONAL & OCCASION INTELLIGENCE
  if (intent === 'devotional_occasion') {
    const detected = detectFestivalOrOccasion(message) || getTodayDevotionalOccasion();
    const constraints = parsePlaylistConstraints(message, {
      languages: detected.suggestedLanguages.slice(0, 2),
      moods: ['spiritual'],
      genres: ['Devotional'],
      activities: ['meditation'],
      eras: [],
      artists: [],
      isDevotional: true,
      deity: detected.deity,
      occasion: detected.title,
      targetDurationMinutes: 30
    });

    const playlist = await generateAIPlaylist(constraints);
    return {
      conversationId,
      intent,
      replyText: `🙏 **${detected.title}**\n${detected.description}\n\nHere is a curated ${Math.round(playlist.totalDurationSeconds / 60)}-minute devotional prayer playlist for you:`,
      generatedPlaylist: playlist,
      activeConstraints: constraints,
      suggestedFollowUps: [
        'Make it 45 minutes',
        'Add Sanskrit mantras too',
        'Play Hanuman Chalisa'
      ]
    };
  }

  // D. PLAYLIST REFINEMENT (MULTI-TURN)
  if (intent === 'playlist_refine') {
    if (request.activeConstraints) {
      const updatedConstraints = parsePlaylistConstraints(message, request.activeConstraints);
      const playlist = await generateAIPlaylist(updatedConstraints);
      return {
        conversationId,
        intent,
        replyText: `✨ Refined your playlist with the updated constraints:\n${playlist.explanation}`,
        generatedPlaylist: playlist,
        activeConstraints: updatedConstraints,
        suggestedFollowUps: ['Play All', 'Add Hindi songs too', 'Make it one hour', 'Save playlist']
      };
    }
  }

  // E. PLAYLIST GENERATION
  if (intent === 'playlist_generate') {
    const constraints = parsePlaylistConstraints(message);
    const playlist = await generateAIPlaylist(constraints);
    return {
      conversationId,
      intent,
      replyText: `🎶 ${playlist.explanation}\nHere is your custom **${playlist.title}**:`,
      generatedPlaylist: playlist,
      activeConstraints: constraints,
      suggestedFollowUps: [
        'Only songs from the 2000s',
        'Add Hindi songs too',
        'Make it one hour',
        'Start playback'
      ]
    };
  }

  // F. DIRECT ARTIST / SONG RECOMMENDATION (e.g. "Play Sid Sriram songs")
  if (intent === 'recommendation') {
    const searchTopic = message.replace(/^play\s+/i, '').replace(/^search\s+/i, '').trim();
    const results = await searchSongs(searchTopic, 1, 8);
    const validSongs = results.length > 0 ? results : STARTER_SONGS.slice(0, 5);

    const isExplicitPlay = qLower.startsWith('play ');
    const firstSong = validSongs[0];

    const playlistPayload = {
      id: `rec_${Date.now()}`,
      title: `${searchTopic} Mix`,
      description: `Curated mix for "${searchTopic}"`,
      songs: validSongs,
      totalDurationSeconds: validSongs.reduce((acc, s) => acc + (s.duration || 260), 0),
      constraints: {
        languages: [firstSong?.language || 'Telugu'],
        moods: [],
        genres: [],
        activities: [],
        eras: [],
        artists: [firstSong?.artist || searchTopic],
        targetDurationMinutes: 30
      },
      explanation: `Loaded top tracks for "${searchTopic}".`
    };

    return {
      conversationId,
      intent,
      replyText: isExplicitPlay
        ? `🎶 Now playing **"${firstSong.name}"** by ${firstSong.artist}! Here are related recommendations:`
        : `Here are the top tracks matching "${searchTopic}":`,
      playbackCommand: isExplicitPlay ? { action: 'play', targetSong: firstSong.name } : null,
      generatedPlaylist: playlistPayload,
      suggestedFollowUps: [
        `Who composed ${firstSong.name}?`,
        `More songs by ${firstSong.artist}`,
        'Create a 45-minute driving mix'
      ]
    };
  }

  // G. GENERAL CHAT / FALLBACK
  return {
    conversationId,
    intent: 'general_chat',
    replyText: `I am your **Sangeetham AI Music Companion**! 🎶\nTry asking me:\n• *"Create a 1-hour driving playlist with Telugu and Hindi songs from 2000s"*\n• *"Who sang Manasavacha and who composed it?"*\n• *"Today is Thursday, play Sai Baba devotional songs"*\n• *"Play relaxing melodies for evening"*`,
    suggestedFollowUps: [
      'Create an evening driving playlist',
      'Who composed Kesariya?',
      'Play Telugu melodies',
      'Today devotional songs'
    ]
  };
}

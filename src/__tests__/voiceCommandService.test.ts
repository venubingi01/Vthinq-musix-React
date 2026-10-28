import { describe, it, expect } from 'vitest';
import { parseVoiceCommand, cleanTranscript } from '../services/voiceCommandService';

describe('Voice Command Service - cleanTranscript', () => {
  it('should clean punctuation and lower case string', () => {
    expect(cleanTranscript('Play Kesariya!')).toBe('play kesariya');
    expect(cleanTranscript('  Next song...  ')).toBe('next song');
    expect(cleanTranscript('Pause music?')).toBe('pause music');
  });
});

describe('Voice Command Service - parseVoiceCommand', () => {
  describe('Playback controls', () => {
    it('should parse next song commands', () => {
      expect(parseVoiceCommand('next')).toEqual({ type: 'next', rawTranscript: 'next' });
      expect(parseVoiceCommand('Next Song')).toEqual({ type: 'next', rawTranscript: 'Next Song' });
      expect(parseVoiceCommand('skip song')).toEqual({ type: 'next', rawTranscript: 'skip song' });
      expect(parseVoiceCommand('play next')).toEqual({ type: 'next', rawTranscript: 'play next' });
    });

    it('should parse previous song commands', () => {
      expect(parseVoiceCommand('previous')).toEqual({ type: 'prev', rawTranscript: 'previous' });
      expect(parseVoiceCommand('previous song')).toEqual({ type: 'prev', rawTranscript: 'previous song' });
      expect(parseVoiceCommand('back')).toEqual({ type: 'prev', rawTranscript: 'back' });
      expect(parseVoiceCommand('play previous')).toEqual({ type: 'prev', rawTranscript: 'play previous' });
    });

    it('should parse pause commands', () => {
      expect(parseVoiceCommand('pause')).toEqual({ type: 'pause', rawTranscript: 'pause' });
      expect(parseVoiceCommand('pause music')).toEqual({ type: 'pause', rawTranscript: 'pause music' });
      expect(parseVoiceCommand('stop')).toEqual({ type: 'pause', rawTranscript: 'stop' });
    });

    it('should parse resume commands', () => {
      expect(parseVoiceCommand('resume')).toEqual({ type: 'resume', rawTranscript: 'resume' });
      expect(parseVoiceCommand('resume music')).toEqual({ type: 'resume', rawTranscript: 'resume music' });
      expect(parseVoiceCommand('play music')).toEqual({ type: 'resume', rawTranscript: 'play music' });
    });
  });

  describe('Visualizer commands', () => {
    it('should parse show and hide visualizer commands', () => {
      expect(parseVoiceCommand('show visualizer')).toEqual({
        type: 'show_visualizer',
        rawTranscript: 'show visualizer'
      });
      expect(parseVoiceCommand('hide visualizer')).toEqual({
        type: 'hide_visualizer',
        rawTranscript: 'hide visualizer'
      });
    });

    it('should parse style change commands', () => {
      expect(parseVoiceCommand('change visualizer to waveform')).toEqual({
        type: 'change_visualizer',
        visualizerStyle: 'waveform',
        rawTranscript: 'change visualizer to waveform'
      });
      expect(parseVoiceCommand('change visualizer to circular')).toEqual({
        type: 'change_visualizer',
        visualizerStyle: 'circular',
        rawTranscript: 'change visualizer to circular'
      });
      expect(parseVoiceCommand('switch visualizer to particles')).toEqual({
        type: 'change_visualizer',
        visualizerStyle: 'particles',
        rawTranscript: 'switch visualizer to particles'
      });
      expect(parseVoiceCommand('change visualizer to bars')).toEqual({
        type: 'change_visualizer',
        visualizerStyle: 'bars',
        rawTranscript: 'change visualizer to bars'
      });
    });
  });

  describe('Equalizer commands', () => {
    it('should parse open/close and reset equalizer', () => {
      expect(parseVoiceCommand('open equalizer')).toEqual({
        type: 'open_equalizer',
        rawTranscript: 'open equalizer'
      });
      expect(parseVoiceCommand('close equalizer')).toEqual({
        type: 'close_equalizer',
        rawTranscript: 'close equalizer'
      });
      expect(parseVoiceCommand('reset equalizer')).toEqual({
        type: 'reset_equalizer',
        rawTranscript: 'reset equalizer'
      });
    });

    it('should parse equalizer presets', () => {
      expect(parseVoiceCommand('set equalizer to Rock')).toEqual({
        type: 'set_eq_preset',
        preset: 'Rock',
        rawTranscript: 'set equalizer to Rock'
      });
      expect(parseVoiceCommand('set equalizer to Pop')).toEqual({
        type: 'set_eq_preset',
        preset: 'Pop',
        rawTranscript: 'set equalizer to Pop'
      });
      expect(parseVoiceCommand('set equalizer to Bass Boost')).toEqual({
        type: 'set_eq_preset',
        preset: 'Bass Boost',
        rawTranscript: 'set equalizer to Bass Boost'
      });
    });
  });

  describe('Music search commands', () => {
    it('should parse "Play Kesariya"', () => {
      expect(parseVoiceCommand('Play Kesariya')).toEqual({
        type: 'play_song',
        query: 'kesariya',
        rawTranscript: 'Play Kesariya'
      });
    });

    it('should parse "Play Shape of You"', () => {
      expect(parseVoiceCommand('Play Shape of You')).toEqual({
        type: 'play_song',
        query: 'shape of you',
        rawTranscript: 'Play Shape of You'
      });
    });

    it('should parse "Play songs by Arijit Singh"', () => {
      expect(parseVoiceCommand('Play songs by Arijit Singh')).toEqual({
        type: 'play_song',
        query: 'arijit singh',
        rawTranscript: 'Play songs by Arijit Singh'
      });
    });

    it('should parse "Search for Telugu melodies"', () => {
      expect(parseVoiceCommand('Search for Telugu melodies')).toEqual({
        type: 'search',
        query: 'telugu melodies',
        rawTranscript: 'Search for Telugu melodies'
      });
    });
  });
});

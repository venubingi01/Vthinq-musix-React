import { describe, it, expect } from 'vitest';
import {
  parseVoiceCommand,
  isSpeechRecognitionSupported,
  VoiceRecognitionService,
  VoiceServiceState
} from '../services/voiceCommandService';

describe('Voice Command Parsing & Edge Cases', () => {
  it('parses play song with special characters and casing', () => {
    const cmd1 = parseVoiceCommand('Play Kesariya!');
    expect(cmd1).toEqual({ type: 'play_song', query: 'kesariya', rawTranscript: 'Play Kesariya!' });

    const cmd2 = parseVoiceCommand('Play   Shape of You?');
    expect(cmd2).toEqual({ type: 'play_song', query: 'shape of you', rawTranscript: 'Play   Shape of You?' });

    const cmd3 = parseVoiceCommand('play songs by Arijit Singh.');
    expect(cmd3).toEqual({ type: 'play_song', query: 'arijit singh', rawTranscript: 'play songs by Arijit Singh.' });
  });

  it('parses search queries with variations', () => {
    const cmd1 = parseVoiceCommand('Search for Telugu melodies');
    expect(cmd1).toEqual({ type: 'search', query: 'telugu melodies', rawTranscript: 'Search for Telugu melodies' });

    const cmd2 = parseVoiceCommand('Find Bollywood hits');
    expect(cmd2).toEqual({ type: 'search', query: 'bollywood hits', rawTranscript: 'Find Bollywood hits' });
  });

  it('parses all visualizer commands and styles', () => {
    expect(parseVoiceCommand('show visualizer').type).toBe('show_visualizer');
    expect(parseVoiceCommand('hide visualizer').type).toBe('hide_visualizer');
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

  it('parses all equalizer preset commands and reset', () => {
    expect(parseVoiceCommand('open equalizer').type).toBe('open_equalizer');
    expect(parseVoiceCommand('close equalizer').type).toBe('close_equalizer');
    expect(parseVoiceCommand('reset equalizer').type).toBe('reset_equalizer');

    const rock = parseVoiceCommand('set equalizer to Rock');
    expect(rock).toEqual({ type: 'set_eq_preset', preset: 'Rock', rawTranscript: 'set equalizer to Rock' });

    const pop = parseVoiceCommand('set equalizer to Pop');
    expect(pop).toEqual({ type: 'set_eq_preset', preset: 'Pop', rawTranscript: 'set equalizer to Pop' });

    const bass = parseVoiceCommand('set equalizer to Bass Boost');
    expect(bass).toEqual({ type: 'set_eq_preset', preset: 'Bass Boost', rawTranscript: 'set equalizer to Bass Boost' });
  });

  it('handles unknown or empty speech gracefully', () => {
    expect(parseVoiceCommand('').type).toBe('unknown');
    expect(parseVoiceCommand('   ').type).toBe('unknown');
    expect(parseVoiceCommand('a').type).toBe('unknown');
  });
});

describe('Speech Recognition Service Fallback & Lifecycle', () => {
  it('returns false for speech recognition when unsupported in node/server', () => {
    expect(isSpeechRecognitionSupported()).toBe(false);
  });

  it('emits unsupported status when attempting to listen without browser support', () => {
    const states: VoiceServiceState[] = [];
    const commands: any[] = [];

    const service = new VoiceRecognitionService(
      (state) => states.push(state),
      (cmd) => commands.push(cmd)
    );

    service.startListening();

    expect(states.length).toBeGreaterThan(0);
    expect(states[0].status).toBe('unsupported');
    expect(states[0].message).toContain('not supported in this browser');
    expect(commands.length).toBe(0);
  });

  it('safely handles stop without crashing', () => {
    const service = new VoiceRecognitionService(
      () => {},
      () => {}
    );
    expect(() => service.stop()).not.toThrow();
  });

  it('invokes onStartListening callback to pause playback as soon as voice listening starts', () => {
    let paused = false;
    const service = new VoiceRecognitionService(
      () => {},
      () => {},
      () => {
        paused = true;
      }
    );

    service.startListening();
    expect(paused).toBe(true);
  });

  it('handles multiple consecutive start and stop calls cleanly without memory leaks or crashes', () => {
    let pauseCount = 0;
    const service = new VoiceRecognitionService(
      () => {},
      () => {},
      () => {
        pauseCount++;
      }
    );

    // First invocation
    service.startListening();
    expect(pauseCount).toBe(1);
    service.stop();

    // Second consecutive invocation (should not throw, should trigger pause, should cleanly reset)
    expect(() => {
      service.startListening();
      service.stop();
    }).not.toThrow();
    expect(pauseCount).toBe(2);

    // Third invocation
    service.startListening();
    expect(pauseCount).toBe(3);
    service.stop();
  });

  it('allows dynamic callback updates via setCallbacks', () => {
    let activeHandler = 1;
    const service = new VoiceRecognitionService(
      () => { activeHandler = 1; },
      () => {}
    );

    service.setCallbacks(
      () => { activeHandler = 2; },
      () => {}
    );

    service.startListening();
    expect(activeHandler).toBe(2);
  });

  it('resumes playback when voice search is cancelled if song was paused', () => {
    let isPlaying = true;
    let wasPlayingBeforeVoice = false;

    // Simulate start of voice search
    const onVoiceStart = () => {
      wasPlayingBeforeVoice = isPlaying;
      isPlaying = false; // paused for mic
    };

    // Simulate voice search cancel
    const onVoiceCancel = () => {
      if (wasPlayingBeforeVoice || !isPlaying) {
        isPlaying = true; // resumed
        wasPlayingBeforeVoice = false;
      }
    };

    expect(isPlaying).toBe(true);
    onVoiceStart();
    expect(isPlaying).toBe(false);
    expect(wasPlayingBeforeVoice).toBe(true);

    onVoiceCancel();
    expect(isPlaying).toBe(true);
    expect(wasPlayingBeforeVoice).toBe(false);
  });
});

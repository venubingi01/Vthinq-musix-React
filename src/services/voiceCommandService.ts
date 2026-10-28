// Sangeetham Car Mode - Voice Command Service & Parser
// Handles speech recognition, microphone permission, and explicit command matching

export type VoiceActionType =
  | 'play_song'
  | 'search'
  | 'next'
  | 'prev'
  | 'pause'
  | 'resume'
  | 'toggle_play'
  | 'show_visualizer'
  | 'hide_visualizer'
  | 'change_visualizer'
  | 'open_equalizer'
  | 'close_equalizer'
  | 'set_eq_preset'
  | 'reset_equalizer'
  | 'unknown';

export interface ParsedVoiceCommand {
  type: VoiceActionType;
  query?: string;
  preset?: string;
  visualizerStyle?: 'bars' | 'waveform' | 'circular' | 'particles';
  rawTranscript: string;
}

export type VoiceStatus =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'success'
  | 'error'
  | 'unsupported'
  | 'permission_denied';

export interface VoiceServiceState {
  status: VoiceStatus;
  transcript: string;
  message: string;
}

// Clean and normalize spoken input
export function cleanTranscript(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
    .trim();
}

// Explicit command matching function (pure, testable)
export function parseVoiceCommand(raw: string): ParsedVoiceCommand {
  const text = cleanTranscript(raw);

  // 1. Playback controls
  if (
    text === 'next' ||
    text === 'next song' ||
    text === 'skip' ||
    text === 'skip song' ||
    text === 'play next'
  ) {
    return { type: 'next', rawTranscript: raw };
  }

  if (
    text === 'previous' ||
    text === 'previous song' ||
    text === 'prev' ||
    text === 'prev song' ||
    text === 'back' ||
    text === 'play previous'
  ) {
    return { type: 'prev', rawTranscript: raw };
  }

  if (
    text === 'pause' ||
    text === 'pause music' ||
    text === 'pause song' ||
    text === 'stop' ||
    text === 'stop music' ||
    text === 'hold'
  ) {
    return { type: 'pause', rawTranscript: raw };
  }

  if (
    text === 'resume' ||
    text === 'resume music' ||
    text === 'resume song' ||
    text === 'unpause' ||
    text === 'continue music'
  ) {
    return { type: 'resume', rawTranscript: raw };
  }

  if (text === 'play music' || text === 'play' || text === 'start music') {
    return { type: 'resume', rawTranscript: raw };
  }

  // 2. Visualizer commands
  if (
    text === 'show visualizer' ||
    text === 'open visualizer' ||
    text === 'turn on visualizer' ||
    text === 'enable visualizer'
  ) {
    return { type: 'show_visualizer', rawTranscript: raw };
  }

  if (
    text === 'hide visualizer' ||
    text === 'close visualizer' ||
    text === 'turn off visualizer' ||
    text === 'disable visualizer'
  ) {
    return { type: 'hide_visualizer', rawTranscript: raw };
  }

  const vizMatch = text.match(/(?:change visualizer to|switch visualizer to|set visualizer to|visualizer style)\s+(bars|waveform|circular|particles)/i);
  if (vizMatch && vizMatch[1]) {
    const style = vizMatch[1].toLowerCase() as 'bars' | 'waveform' | 'circular' | 'particles';
    return { type: 'change_visualizer', visualizerStyle: style, rawTranscript: raw };
  }

  if (text.includes('waveform visualizer') || text === 'waveform') {
    return { type: 'change_visualizer', visualizerStyle: 'waveform', rawTranscript: raw };
  }
  if (text.includes('circular visualizer') || text === 'circular spectrum') {
    return { type: 'change_visualizer', visualizerStyle: 'circular', rawTranscript: raw };
  }
  if (text.includes('particle visualizer') || text === 'particles') {
    return { type: 'change_visualizer', visualizerStyle: 'particles', rawTranscript: raw };
  }
  if (text.includes('bars visualizer') || text === 'frequency bars') {
    return { type: 'change_visualizer', visualizerStyle: 'bars', rawTranscript: raw };
  }

  // 3. Equalizer commands
  if (
    text === 'open equalizer' ||
    text === 'show equalizer' ||
    text === 'open eq' ||
    text === 'show eq'
  ) {
    return { type: 'open_equalizer', rawTranscript: raw };
  }

  if (
    text === 'close equalizer' ||
    text === 'hide equalizer' ||
    text === 'close eq' ||
    text === 'hide eq'
  ) {
    return { type: 'close_equalizer', rawTranscript: raw };
  }

  if (
    text === 'reset equalizer' ||
    text === 'reset eq' ||
    text === 'equalizer flat' ||
    text === 'set equalizer to flat' ||
    text === 'flat eq'
  ) {
    return { type: 'reset_equalizer', rawTranscript: raw };
  }

  const eqMatch = text.match(/(?:set equalizer to|equalizer preset|set eq to|apply eq)\s+(rock|pop|jazz|classical|bass boost|flat|normal)/i);
  if (eqMatch && eqMatch[1]) {
    let presetName = eqMatch[1].trim();
    if (presetName.toLowerCase() === 'normal') presetName = 'Flat';
    // Title case
    presetName = presetName.charAt(0).toUpperCase() + presetName.slice(1);
    if (presetName.toLowerCase() === 'bass boost') presetName = 'Bass Boost';
    return { type: 'set_eq_preset', preset: presetName, rawTranscript: raw };
  }

  // 4. Music search & direct play commands
  // E.g. "play songs by Arijit Singh"
  const artistMatch = text.match(/play songs by\s+(.+)/i);
  if (artistMatch && artistMatch[1]) {
    return { type: 'play_song', query: artistMatch[1].trim(), rawTranscript: raw };
  }

  // E.g. "search for Telugu melodies" / "search Telugu songs"
  const searchMatch = text.match(/(?:search for|search|find songs for|find)\s+(.+)/i);
  if (searchMatch && searchMatch[1]) {
    return { type: 'search', query: searchMatch[1].trim(), rawTranscript: raw };
  }

  // E.g. "play Kesariya" / "play Shape of You"
  const playMatch = text.match(/^play\s+(.+)/i);
  if (playMatch && playMatch[1]) {
    return { type: 'play_song', query: playMatch[1].trim(), rawTranscript: raw };
  }

  // If text is not empty and didn't match specific commands, treat as direct search query if longer than 1 word
  if (text.length > 2) {
    return { type: 'play_song', query: text, rawTranscript: raw };
  }

  return { type: 'unknown', rawTranscript: raw };
}

// Check if browser supports Web Speech API
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

// Single-shot Voice Recognition Controller with robust lifecycle management
export class VoiceRecognitionService {
  private recognition: any = null;
  private onStateChange: (state: VoiceServiceState) => void;
  private onCommandParsed: (command: ParsedVoiceCommand) => void;
  private onStartListening?: () => void;
  private active = false;
  private watchdogTimer: any = null;

  constructor(
    onStateChange: (state: VoiceServiceState) => void,
    onCommandParsed: (command: ParsedVoiceCommand) => void,
    onStartListening?: () => void
  ) {
    this.onStateChange = onStateChange;
    this.onCommandParsed = onCommandParsed;
    this.onStartListening = onStartListening;
  }

  public setCallbacks(
    onStateChange: (state: VoiceServiceState) => void,
    onCommandParsed: (command: ParsedVoiceCommand) => void,
    onStartListening?: () => void
  ): void {
    this.onStateChange = onStateChange;
    this.onCommandParsed = onCommandParsed;
    this.onStartListening = onStartListening;
  }

  private clearWatchdog(): void {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  private cleanupRecognition(rec: any): void {
    if (!rec) return;
    try {
      rec.onstart = null;
      rec.onresult = null;
      rec.onerror = null;
      rec.onnomatch = null;
      rec.onspeechend = null;
      rec.onaudioend = null;
      rec.onsoundend = null;
      rec.onend = null;
      rec.abort();
    } catch {
      // ignore abort errors
    }
  }

  public startListening(): void {
    this.clearWatchdog();

    // 1. Immediately cancel active SpeechSynthesis so OS microphone ducking/audio locking is released
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    // 2. Notify listener immediately to pause music
    if (this.onStartListening) {
      try {
        this.onStartListening();
      } catch {}
    }

    if (!isSpeechRecognitionSupported()) {
      this.onStateChange({
        status: 'unsupported',
        transcript: '',
        message: 'Voice recognition is not supported in this browser. Please use touch search.'
      });
      return;
    }

    // 3. Clean up any existing recognition instance completely before starting fresh
    if (this.recognition) {
      this.cleanupRecognition(this.recognition);
      this.recognition = null;
    }
    this.active = false;

    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognitionClass();
      this.recognition = rec;
      this.active = true;

      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = 'en-IN'; // Indian English for Telugu, Bollywood, Hindi & English recognition

      rec.onstart = () => {
        this.clearWatchdog();
        // 12s safety watchdog so listening orb never hangs indefinitely
        this.watchdogTimer = setTimeout(() => {
          if (this.active) {
            this.stop();
            this.onStateChange({
              status: 'error',
              transcript: '',
              message: 'No results found. Try again.'
            });
          }
        }, 12000);

        if (this.onStartListening) {
          try {
            this.onStartListening();
          } catch {}
        }
        this.onStateChange({
          status: 'listening',
          transcript: '',
          message: 'Listening... Speak now'
        });
      };

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item?.isFinal) {
            finalTranscript += item[0]?.transcript || '';
          } else {
            interimTranscript += item[0]?.transcript || '';
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();

        if (currentText) {
          this.onStateChange({
            status: finalTranscript ? 'processing' : 'listening',
            transcript: currentText,
            message: finalTranscript ? `Recognized: "${currentText}"` : `Speaking: "${currentText}"`
          });
        }

        if (finalTranscript.trim()) {
          this.clearWatchdog();
          // Cleanly stop recognition immediately to free mic hardware pipeline
          try {
            rec.stop();
          } catch {}
          this.active = false;
          this.recognition = null;

          const parsed = parseVoiceCommand(finalTranscript);
          this.onCommandParsed(parsed);
        }
      };

      rec.onnomatch = () => {
        this.clearWatchdog();
        this.active = false;
        this.recognition = null;
        this.onStateChange({
          status: 'error',
          transcript: '',
          message: 'No results found. Try again.'
        });
      };

      rec.onerror = (event: any) => {
        this.clearWatchdog();
        const err = event.error;

        // Intentional abort or stop should NOT trigger an error notification
        if (err === 'aborted') {
          this.active = false;
          return;
        }

        this.active = false;
        this.recognition = null;

        if (err === 'not-allowed') {
          this.onStateChange({
            status: 'permission_denied',
            transcript: '',
            message: 'Microphone permission was denied. Please allow microphone in browser settings.'
          });
        } else if (err === 'no-speech') {
          this.onStateChange({
            status: 'error',
            transcript: '',
            message: 'No speech was detected. Try again.'
          });
        } else {
          this.onStateChange({
            status: 'error',
            transcript: '',
            message: 'No results found. Try again.'
          });
        }
      };

      rec.onend = () => {
        this.clearWatchdog();
        this.active = false;
        this.recognition = null;
      };

      rec.start();
    } catch (_err) {
      this.clearWatchdog();
      this.active = false;
      this.recognition = null;
      this.onStateChange({
        status: 'error',
        transcript: '',
        message: 'Could not access microphone. Try again.'
      });
    }
  }

  public stop(): void {
    this.clearWatchdog();
    if (this.recognition) {
      this.cleanupRecognition(this.recognition);
      this.recognition = null;
    }
    this.active = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

// Audible speech feedback for driver assistance
export function speakVoiceFeedback(text: string): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = 'en-IN';
      utterance.onend = () => {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      };
      utterance.onerror = () => {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      };
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis feedback note:', e);
    }
  }
}

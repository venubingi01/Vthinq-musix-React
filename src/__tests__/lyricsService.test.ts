import { describe, it, expect } from 'vitest';
import {
  cleanTitle,
  parseLrc,
  isConflictingLyrics,
  hasExpectedScript,
  fetchLyrics
} from '../services/lyricsService';

describe('Lyrics Service Language-Aware Matching & Parsing', () => {
  it('correctly cleans song titles by removing parentheses and version tags', () => {
    expect(cleanTitle('Beast Mode (From "Beast")')).toBe('Beast Mode');
    expect(cleanTitle('Naatu Naatu (Telugu)')).toBe('Naatu Naatu (Telugu)');
    expect(cleanTitle('Song Title (feat. Artist)')).toBe('Song Title');
  });

  it('parses standard LRC lyrics string with timestamps into seconds', () => {
    const lrc = `[00:05.62] Meaner leaner stronger\n[00:16.91] తెరపై ప్రకాశం`;
    const parsed = parseLrc(lrc);
    expect(parsed.length).toBe(2);
    expect(parsed[0].time).toBeCloseTo(5.62, 1);
    expect(parsed[0].text).toBe('Meaner leaner stronger');
    expect(parsed[1].time).toBeCloseTo(16.91, 1);
    expect(parsed[1].text).toBe('తెరపై ప్రకాశం');
  });

  it('detects when lyrics text conflicts with expected language script', () => {
    const tamilText = 'திரை தீ பிடிக்கும் வெடிக்கும்';
    const teluguText = 'తెరపై ప్రకాశం జగతికి సందేశం';
    const hindiText = 'केसरिया तेरा इश्क है पिया';

    // When expecting Telugu, Tamil and Hindi text must be flagged as conflicting
    expect(isConflictingLyrics(tamilText, 'telugu')).toBe(true);
    expect(isConflictingLyrics(hindiText, 'telugu')).toBe(true);
    expect(isConflictingLyrics(teluguText, 'telugu')).toBe(false);

    // When expecting Tamil, Telugu and Hindi text must be flagged as conflicting
    expect(isConflictingLyrics(teluguText, 'tamil')).toBe(true);
    expect(isConflictingLyrics(hindiText, 'tamil')).toBe(true);
    expect(isConflictingLyrics(tamilText, 'tamil')).toBe(false);

    // When expecting Hindi, South Indian scripts must be flagged as conflicting
    expect(isConflictingLyrics(teluguText, 'hindi')).toBe(true);
    expect(isConflictingLyrics(tamilText, 'hindi')).toBe(true);
    expect(isConflictingLyrics(hindiText, 'hindi')).toBe(false);
  });

  it('verifies native script detection for Indian languages', () => {
    expect(hasExpectedScript('తెరపై ప్రకాశం', 'telugu')).toBe(true);
    expect(hasExpectedScript('திரை தீ பிடிக்கும்', 'telugu')).toBe(false);
    expect(hasExpectedScript('திரை தீ பிடிக்கும்', 'tamil')).toBe(true);
    expect(hasExpectedScript('केसरिया', 'hindi')).toBe(true);
  });

  it('fetches correct Telugu lyrics for Beast Mode when language is telugu', async () => {
    const lyrics = await fetchLyrics(
      'Beast Mode',
      'Anirudh Ravichander, Sreerama Chandra',
      'Beast',
      'telugu'
    );
    expect(lyrics.length).toBeGreaterThan(0);

    // Confirm the returned lyrics do NOT contain Tamil script characters
    const fullText = lyrics.map((l) => l.text).join(' ');
    expect(/[\u0B80-\u0BFF]/.test(fullText)).toBe(false);
  });
});

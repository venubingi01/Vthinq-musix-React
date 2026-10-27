import type { TimedLyric } from '../types/music';

// Clean artist & song titles for better search accuracy
export function cleanTitle(str: string): string {
  if (!str) return '';
  return str
    .replace(/\(From "[^"]*"\)/gi, '')
    .replace(/\(feat\.[^)]*\)/gi, '')
    .replace(/-\s*New Version/gi, '')
    .replace(/-\s*Original/gi, '')
    .replace(/\s*\(From\s+.*?\)/gi, '')
    .replace(/•.*/gi, '')
    .trim();
}

// Parse standard LRC format string into an array of { time (in seconds), text }
export function parseLrc(lrcText: string): TimedLyric[] {
  if (!lrcText) return [];

  const lines = lrcText.split('\n');
  const result: TimedLyric[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let match: RegExpExecArray | null;
    timeRegex.lastIndex = 0;

    // A line might have multiple timestamps, e.g. [00:12.30][00:45.10] Chorus
    const timestamps: number[] = [];
    while ((match = timeRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const millis = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
      const totalSeconds = minutes * 60 + seconds + millis / 1000;
      timestamps.push(totalSeconds);
    }

    const cleanText = trimmed.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim();

    if (cleanText) {
      timestamps.forEach((time) => {
        result.push({ time, text: cleanText });
      });
    }
  }

  // Sort chronologically
  return result.sort((a, b) => a.time - b.time);
}

// Cache for lyrics to avoid redundant network calls
const lyricsCache = new Map<string, TimedLyric[]>();

// Fetch synced lyrics from LRCLIB with abort timeout
export async function fetchLyrics(trackName: string, artistName: string): Promise<TimedLyric[]> {
  const cTitle = cleanTitle(trackName);
  const cArtist = cleanTitle(artistName.split(/[,&/]/)[0]);
  const cacheKey = `${cTitle}___${cArtist}`.toLowerCase();

  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cTitle)}&artist_name=${encodeURIComponent(cArtist)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.syncedLyrics) {
        const parsed = parseLrc(data.syncedLyrics);
        if (parsed.length > 0) {
          lyricsCache.set(cacheKey, parsed);
          return parsed;
        }
      } else if (data.plainLyrics) {
        // Fallback plain lyrics split by line with simulated timing
        const lines = data.plainLyrics.split('\n').filter((l: string) => l.trim().length > 0);
        const simulated: TimedLyric[] = lines.map((text: string, idx: number) => ({
          time: idx * 4,
          text
        }));
        lyricsCache.set(cacheKey, simulated);
        return simulated;
      }
    }
  } catch (err) {
    // Ignore timeout / network errors
  }

  // Fallback demo lyrics when offline or not found
  const fallbackLyrics: TimedLyric[] = [
    { time: 0, text: '🎵 ' + trackName },
    { time: 4, text: 'Performed by ' + artistName },
    { time: 8, text: 'Enjoy high-fidelity streaming on Sangeetham' },
    { time: 14, text: '✨ Feel the rhythm and bass ✨' },
    { time: 20, text: 'Synced lyrics will auto-update as the track plays...' }
  ];
  return fallbackLyrics;
}

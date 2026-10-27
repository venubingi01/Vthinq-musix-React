import type { TimedLyric } from "../types/music";

// Clean artist & song titles for better search accuracy
export function cleanTitle(str: string): string {
  if (!str) return "";
  return str
    .replace(/\(From "[^"]*"\)/gi, "")
    .replace(/\(feat\.[^)]*\)/gi, "")
    .replace(/-\s*New Version/gi, "")
    .replace(/-\s*Original/gi, "")
    .replace(/\s*\(From\s+.*?\)/gi, "")
    .replace(/•.*/gi, "")
    .trim();
}

// Parse standard LRC format string into an array of { time (in seconds), text }
export function parseLrc(lrcText: string): TimedLyric[] {
  if (!lrcText) return [];

  const lines = lrcText.split("\n");
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
      const millis = match[3] ? parseInt(match[3].padEnd(3, "0").slice(0, 3), 10) : 0;
      const totalSeconds = minutes * 60 + seconds + millis / 1000;
      timestamps.push(totalSeconds);
    }

    const cleanText = trimmed.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, "").trim();

    if (cleanText) {
      timestamps.forEach((time) => {
        result.push({ time, text: cleanText });
      });
    }
  }

  // Sort chronologically
  return result.sort((a, b) => a.time - b.time);
}

// Safe fetch with AbortController timeout
async function fetchWithTimeout(url: string, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    try { controller.abort(); } catch {}
  }, timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// Cache for lyrics and in-flight request deduplication
const lyricsCache = new Map<string, TimedLyric[]>();
const inFlightRequests = new Map<string, Promise<TimedLyric[]>>();

const RENDER_BASE_URL = "https://test-0k.onrender.com/lyrics/";

// 1. High-speed LRCLIB Provider with primary & secondary artist fallback
async function fetchFromLrcLib(cleanTitleStr: string, primaryArtist: string, secondaryArtist: string): Promise<TimedLyric[] | null> {
  if (!cleanTitleStr) return null;

  // 1a. Direct query with primary artist
  let queryParams = `?track_name=${encodeURIComponent(cleanTitleStr)}`;
  if (primaryArtist) {
    queryParams += `&artist_name=${encodeURIComponent(primaryArtist)}`;
  }
  try {
    const res = await fetchWithTimeout(`https://lrclib.net/api/get${queryParams}`, 2800);
    if (res.ok) {
      const data = await res.json();
      if (data?.syncedLyrics) {
        const parsed = parseLrc(data.syncedLyrics);
        if (parsed.length > 0) return parsed;
      } else if (data?.plainLyrics) {
        const lines = data.plainLyrics.split("\n").filter((l: string) => l.trim().length > 0);
        return lines.map((text: string, idx: number) => ({ time: idx * 4, text, isPlain: true }));
      }
    }
  } catch {}

  // 1b. Direct query with secondary artist (e.g. singer in "Pritam, Arijit Singh")
  if (secondaryArtist) {
    try {
      const res2 = await fetchWithTimeout(
        `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitleStr)}&artist_name=${encodeURIComponent(secondaryArtist)}`,
        2200
      );
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2?.syncedLyrics) {
          const parsed = parseLrc(data2.syncedLyrics);
          if (parsed.length > 0) return parsed;
        } else if (data2?.plainLyrics) {
          const lines = data2.plainLyrics.split("\n").filter((l: string) => l.trim().length > 0);
          return lines.map((text: string, idx: number) => ({ time: idx * 4, text, isPlain: true }));
        }
      }
    } catch {}
  }

  // 1c. Fast search query on LRCLIB (title + primary artist)
  try {
    const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitleStr + (primaryArtist ? " " + primaryArtist : ""))}`;
    const searchRes = await fetchWithTimeout(searchUrl, 2500);
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (Array.isArray(searchData) && searchData.length > 0) {
        const best = searchData.find((item) => item?.syncedLyrics) || searchData[0];
        if (best?.syncedLyrics) {
          const parsed = parseLrc(best.syncedLyrics);
          if (parsed.length > 0) return parsed;
        } else if (best?.plainLyrics) {
          const lines = best.plainLyrics.split("\n").filter((l: string) => l.trim().length > 0);
          return lines.map((text: string, idx: number) => ({ time: idx * 4, text, isPlain: true }));
        }
      }
    }
  } catch {}

  return null;
}

// 2. Secondary fallback on Render backend
async function fetchFromRender(cleanTitleStr: string, artistStr: string): Promise<TimedLyric[] | null> {
  try {
    const url = `${RENDER_BASE_URL}?artist=${encodeURIComponent(artistStr)}&song=${encodeURIComponent(cleanTitleStr)}&timestamps=true`;
    const res = await fetchWithTimeout(url, 3800);
    if (res.ok) {
      const data = await res.json();
      if (data?.status === "success" && data.data) {
        if (data.data.lyrics && /\[\d{2}:\d{2}\.\d{2,3}\]/.test(data.data.lyrics)) {
          const parsed = parseLrc(data.data.lyrics);
          if (parsed.length > 0) return parsed;
        } else if (Array.isArray(data.data.timed_lyrics) && data.data.timed_lyrics.length > 0) {
          return data.data.timed_lyrics.map((item: any) => ({
            time: typeof item.start_time === "number" && item.start_time > 1000 ? item.start_time / 1000 : (item.start_time || 0),
            text: item.text || ""
          }));
        } else if (data.data.lyrics) {
          const parsed = parseLrc(data.data.lyrics);
          if (parsed.length > 0) return parsed;
          const lines = data.data.lyrics.split("\n").filter((l: string) => l.trim().length > 0);
          if (lines.length > 0) {
            return lines.map((text: string, idx: number) => ({ time: idx * 4, text, isPlain: true }));
          }
        }
      }
    }
  } catch {}

  // Plain text fallback on Render
  try {
    const urlPlain = `${RENDER_BASE_URL}?artist=${encodeURIComponent(artistStr)}&song=${encodeURIComponent(cleanTitleStr)}&timestamps=false`;
    const resPlain = await fetchWithTimeout(urlPlain, 2500);
    if (resPlain.ok) {
      const dataPlain = await resPlain.json();
      if (dataPlain?.status === "success" && dataPlain.data?.lyrics) {
        const lines = dataPlain.data.lyrics.split("\n").filter((l: string) => l.trim().length > 0);
        return lines.map((text: string, idx: number) => ({ time: idx * 4, text, isPlain: true }));
      }
    }
  } catch {}

  return null;
}

// Fetch synced lyrics with multi-tier fallback (LRCLIB -> Render -> Broad Search)
export async function fetchLyrics(trackName: string, artistName: string): Promise<TimedLyric[]> {
  const cTitle = cleanTitle(trackName);
  const rawArtists = (artistName || "").split(/[,&/]/).map((s) => cleanTitle(s)).filter(Boolean);
  const primaryArtist = rawArtists[0] || cleanTitle(artistName) || "";
  const secondaryArtist = rawArtists[1] || "";
  const cacheKey = `${cTitle}___${primaryArtist}`.toLowerCase();

  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)!;
  }

  // Deduplicate in-flight requests from multiple UI components
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const fetchPromise = (async (): Promise<TimedLyric[]> => {
    try {
      // 1. High-speed LRCLIB (< 700ms, primary + secondary artist + search)
      const lrcResult = await fetchFromLrcLib(cTitle, primaryArtist, secondaryArtist);
      if (lrcResult && lrcResult.length > 0) {
        lyricsCache.set(cacheKey, lrcResult);
        return lrcResult;
      }

      // 2. Render backend fallback (with timestamps=true/false)
      const renderResult = await fetchFromRender(cTitle, primaryArtist || artistName);
      if (renderResult && renderResult.length > 0) {
        lyricsCache.set(cacheKey, renderResult);
        return renderResult;
      }

      // 3. Broad LRCLIB track search without artist constraint
      try {
        const broadRes = await fetchWithTimeout(`https://lrclib.net/api/search?q=${encodeURIComponent(cTitle)}`, 2200);
        if (broadRes.ok) {
          const broadData = await broadRes.json();
          if (Array.isArray(broadData) && broadData.length > 0) {
            const matched = broadData.find((item: any) => item?.syncedLyrics) || broadData[0];
            if (matched?.syncedLyrics) {
              const parsed = parseLrc(matched.syncedLyrics);
              if (parsed.length > 0) {
                lyricsCache.set(cacheKey, parsed);
                return parsed;
              }
            } else if (matched?.plainLyrics) {
              const lines = matched.plainLyrics.split("\n").filter((l: string) => l.trim().length > 0);
              const mapped = lines.map((text: string, idx: number) => ({ time: idx * 4, text, isPlain: true }));
              lyricsCache.set(cacheKey, mapped);
              return mapped;
            }
          }
        }
      } catch {}

      // Fallback demo lyrics when offline or not found
      const fallbackLyrics: TimedLyric[] = [
        { time: 0, text: "🎵 " + trackName },
        { time: 4, text: "Performed by " + artistName },
        { time: 8, text: "Enjoy high-fidelity streaming on Sangeetham" },
        { time: 14, text: "✨ Feel the rhythm and bass ✨" },
        { time: 20, text: "Synced lyrics will auto-update as the track plays..." }
      ];
      return fallbackLyrics;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

// Helper to determine if a lyrics list is plain unsynced text
export function isPlainLyrics(lyrics?: TimedLyric[] | null): boolean {
  if (!lyrics || lyrics.length === 0) return false;
  return lyrics.some((line) => line.isPlain === true);
}

// Video service to find YouTube music video IDs for any song

const PIPED_ENDPOINTS = [
  'https://api.piped.private.coffee/search',
  'https://pipedapi.kavin.rocks/search',
  'https://pipedapi.leptons.xyz/search'
];

// Fallback high-res music video IDs for starter songs to ensure instant zero-downtime video playback
const STARTER_VIDEO_MAP: Record<string, string> = {
  starter_1: 'BddP6PYo2gs', // Kesariya Official Video
  starter_2: 'mevbq1cZpQk', // Samajavaragamana Video
  starter_3: '2mDCVzruYzQ', // Butta Bomma Video
  starter_4: 'VAdGW7QDJhU', // Chaleya Official Video
  starter_5: '1F3hm636S2k'  // Hukum Jailer Video
};

const videoCache = new Map<string, string>();

/**
 * Searches for a YouTube video ID matching the song title & artist.
 * Uses Piped open API with fallback to popular song video mapping.
 */
export async function searchMusicVideo(
  songId: string,
  songName: string,
  artistName: string
): Promise<string | null> {
  // 1. Check starter songs map
  if (STARTER_VIDEO_MAP[songId]) {
    return STARTER_VIDEO_MAP[songId];
  }

  // 2. Check cache
  const cacheKey = `${songName}_${artistName}`.toLowerCase();
  if (videoCache.has(cacheKey)) {
    return videoCache.get(cacheKey)!;
  }

  const query = `${songName} ${artistName.split(',')[0]} official video`;

  // 3. Search via Piped endpoints
  for (const endpoint of PIPED_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const url = `${endpoint}?q=${encodeURIComponent(query)}&filter=videos`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const items = data.items || data;
        if (Array.isArray(items) && items.length > 0) {
          for (const item of items) {
            const vUrl = item.url || '';
            const match = vUrl.match(/\/watch\?v=([\w-]{11})/);
            if (match && match[1]) {
              videoCache.set(cacheKey, match[1]);
              return match[1];
            }
            if (item.id && typeof item.id === 'string' && item.id.length === 11) {
              videoCache.set(cacheKey, item.id);
              return item.id;
            }
          }
        }
      }
    } catch {
      // Try next endpoint
      continue;
    }
  }

  // Fallback to default high aesthetic video loop
  return 'BddP6PYo2gs';
}

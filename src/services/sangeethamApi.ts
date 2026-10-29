import type { Song, Album } from '../types/music';

// Primary Sangeetham API endpoint
export const SANGEETHAM_API_BASE = 'https://sangeetham-api.onrender.com/api';

// Helper to decode HTML entities like &quot;, &#039;, &amp;
export function decodeHTMLEntities(text: string): string {
  if (!text) return '';
  if (typeof document === 'undefined') return text.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

// 1. Verified Core / Starter Songs from Sangeetham API with active 320kbps & 160kbps streams
export const STARTER_SONGS: Song[] = [
  {
    id: 'CdncOYcw',
    name: 'Darkhaast',
    artist: 'Mithoon, Arijit Singh, Sunidhi Chauhan',
    album: 'Shivaay',
    image: 'https://c.saavncdn.com/550/Shivaay4-Hindi-2016-500x500.jpg',
    url: 'https://aac.saavncdn.com/550/0aa1d08ce795857251c8cdb28fc2f998_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/550/0aa1d08ce795857251c8cdb28fc2f998_160.mp4'
    ],
    duration: 375,
    quality: '320kbps',
    year: '2016',
    language: 'Hindi'
  },
  {
    id: 'rjkrTnma',
    name: 'Kesariya',
    artist: 'Pritam, Arijit Singh, Amitabh Bhattacharya',
    album: 'Brahmastra',
    image: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    url: 'https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_160.mp4'
    ],
    duration: 268,
    quality: '320kbps',
    year: '2022',
    language: 'Hindi'
  },
  {
    id: 'gZsIAUmO',
    name: 'Samajavaragamana',
    artist: 'Sid Sriram',
    album: 'Ala Vaikunthapurramuloo',
    image: 'https://c.saavncdn.com/517/Ala-Vaikunthapurramuloo-Telugu-2019-20200116144338-500x500.jpg',
    url: 'https://aac.saavncdn.com/517/339d76dce4db4f43f4721eec2d8f03ef_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/517/339d76dce4db4f43f4721eec2d8f03ef_160.mp4'
    ],
    duration: 219,
    quality: '320kbps',
    year: '2019',
    language: 'Telugu'
  },
  {
    id: '1UqsPO7u',
    name: 'Buttabomma',
    artist: 'Armaan Malik',
    album: 'Ala Vaikunthapurramuloo',
    image: 'https://c.saavncdn.com/517/Ala-Vaikunthapurramuloo-Telugu-2019-20200116144338-500x500.jpg',
    url: 'https://aac.saavncdn.com/517/68cc88035f2fbcd5772e6551bf64c111_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/517/68cc88035f2fbcd5772e6551bf64c111_160.mp4'
    ],
    duration: 198,
    quality: '320kbps',
    year: '2019',
    language: 'Telugu'
  },
  {
    id: 'faloMmjX',
    name: 'Chaleya',
    artist: 'Anirudh Ravichander, Arijit Singh, Shilpa Rao',
    album: 'Jawan',
    image: 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg',
    url: 'https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_160.mp4'
    ],
    duration: 200,
    quality: '320kbps',
    year: '2023',
    language: 'Hindi'
  },
  {
    id: 'rtIe2EtQ',
    name: 'Hukum',
    artist: 'Dinker kalvala, Anirudh Ravichander',
    album: 'Jailer',
    image: 'https://c.saavncdn.com/435/Jailer-Telugu-2023-20230810132954-500x500.jpg',
    url: 'https://aac.saavncdn.com/435/4161a58e6cff0010c02431e6c21728d9_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/435/4161a58e6cff0010c02431e6c21728d9_160.mp4'
    ],
    duration: 207,
    quality: '320kbps',
    year: '2023',
    language: 'Telugu'
  }
];

// 2. Verified Telugu Hits
export const TELUGU_SONGS: Song[] = [
  {
    id: 'WrGU-iqE',
    name: 'Ramuloo Ramulaa',
    artist: 'Anurag Kulkarni, Mangli',
    album: 'Ala Vaikunthapurramuloo',
    image: 'https://c.saavncdn.com/517/Ala-Vaikunthapurramuloo-Telugu-2019-20200116144338-500x500.jpg',
    url: 'https://aac.saavncdn.com/517/5702757c42c1ad44b3224a339817c8b0_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/517/5702757c42c1ad44b3224a339817c8b0_160.mp4'
    ],
    duration: 245,
    language: 'Telugu',
    year: '2019'
  },
  {
    id: 'hIMaVuLz',
    name: 'Inkem Inkem Inkem Kaavaale',
    artist: 'Sid Sriram',
    album: 'Geetha Govindam',
    image: 'https://c.saavncdn.com/237/Geetha-Govindam-Telugu-2018-20180921-500x500.jpg',
    url: 'https://aac.saavncdn.com/237/7942edb73e64d4e35e488337e14753b7_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/237/7942edb73e64d4e35e488337e14753b7_160.mp4'
    ],
    duration: 266,
    language: 'Telugu',
    year: '2018'
  },
  {
    id: 'e1PxinO-',
    name: 'Sittharala Sirapadu',
    artist: 'Sooranna, Saketh Komanduri',
    album: 'Ala Vaikunthapurramuloo',
    image: 'https://c.saavncdn.com/517/Ala-Vaikunthapurramuloo-Telugu-2019-20200116144338-500x500.jpg',
    url: 'https://aac.saavncdn.com/517/52e38ccb523a02ce05b95bd831f3c53e_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/517/52e38ccb523a02ce05b95bd831f3c53e_160.mp4'
    ],
    duration: 186,
    language: 'Telugu',
    year: '2019'
  },
  {
    id: '-JkPBIE7',
    name: 'Naatu Naatu',
    artist: 'Rahul Sipligunj, Kaala Bhairava',
    album: 'RRR - Telugu',
    image: 'https://c.saavncdn.com/683/RRR-Telugu-Telugu-2022-20250828171313-500x500.jpg',
    url: 'https://aac.saavncdn.com/683/000ab54759049a8451ffcdc6412a0ef6_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/683/000ab54759049a8451ffcdc6412a0ef6_160.mp4'
    ],
    duration: 214,
    language: 'Telugu',
    year: '2022'
  }
];

// 3. Verified Hindi Hits
export const HINDI_SONGS: Song[] = [
  {
    id: 'aRZbUYD7',
    name: 'Tum Hi Ho',
    artist: 'Mithoon, Arijit Singh',
    album: 'Aashiqui 2',
    image: 'https://c.saavncdn.com/430/Aashiqui-2-Hindi-2013-500x500.jpg',
    url: 'https://aac.saavncdn.com/430/5c5ea5cc00e3bff45616013226f376fe_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/430/5c5ea5cc00e3bff45616013226f376fe_160.mp4'
    ],
    duration: 262,
    language: 'Hindi',
    year: '2013'
  },
  {
    id: 'qZtKBMZ_',
    name: 'Apna Bana Le',
    artist: 'Sachin-Jigar, Arijit Singh',
    album: 'Bhediya',
    image: 'https://c.saavncdn.com/815/Bhediya-Hindi-2023-20230927155213-500x500.jpg',
    url: 'https://aac.saavncdn.com/815/483a6e118e8108cbb3e5cd8701674f32_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/815/483a6e118e8108cbb3e5cd8701674f32_160.mp4'
    ],
    duration: 261,
    language: 'Hindi',
    year: '2023'
  },
  {
    id: '4mHUvJ4u',
    name: 'Satranga',
    artist: 'Arijit Singh, Shreyas Puranik, Siddharth-Garima',
    album: 'ANIMAL',
    image: 'https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20260724191152-500x500.jpg',
    url: 'https://aac.saavncdn.com/092/86b1368e104225e0bfbc69cda4ab8580_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/092/86b1368e104225e0bfbc69cda4ab8580_160.mp4'
    ],
    duration: 271,
    language: 'Hindi',
    year: '2023'
  },
  {
    id: 'mPTrDSun',
    name: 'Raataan Lambiyan',
    artist: 'Tanishk Bagchi, Jubin Nautiyal, Asees Kaur',
    album: 'Shershaah',
    image: 'https://c.saavncdn.com/238/Shershaah-Original-Motion-Picture-Soundtrack--Hindi-2021-20210815181610-500x500.jpg',
    url: 'https://aac.saavncdn.com/238/35726d4394604604e961bf5b846870d0_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/238/35726d4394604604e961bf5b846870d0_160.mp4'
    ],
    duration: 230,
    language: 'Hindi',
    year: '2021'
  }
];

// 4. Verified Devotional Songs
export const DEVOTIONAL_SONGS: Song[] = [
  {
    id: 'KjfHRLhE',
    name: 'Sri Venkateshwara Suprabhatham',
    artist: 'M. S. Subbulakshmi',
    album: 'Sri Venkateshwara Suprabhatham',
    image: 'https://c.saavncdn.com/753/Sri-Venkateshwara-Suprabhatham-Ms-Subbulakshmi-2005-500x500.jpg',
    url: 'https://aac.saavncdn.com/753/f237006c2ddbcfc946cb8405a32fbb1d_sar_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/753/f237006c2ddbcfc946cb8405a32fbb1d_sar_160.mp4'
    ],
    duration: 1245,
    language: 'Telugu/Sanskrit',
    year: '2005'
  },
  {
    id: '7CwLvXc6',
    name: 'Shree Hanuman Chalisa',
    artist: 'Hariharan, Lalit Sen, Chander',
    album: 'Shree Hanuman Chalisa',
    image: 'https://c.saavncdn.com/256/Shree-Hanuman-Chalisa-Hanuman-Ashtak-Hindi-1992-20260324161030-500x500.jpg',
    url: 'https://aac.saavncdn.com/256/254c18ccf39f955649057ed4426aa7f3_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/256/254c18ccf39f955649057ed4426aa7f3_160.mp4'
    ],
    duration: 586,
    language: 'Hindi',
    year: '1992'
  },
  {
    id: 'W8b9Be7N',
    name: 'Shiv Tandav Stotram',
    artist: 'Shankar Mahadevan',
    album: 'Shiv Tandav Stotram',
    image: 'https://c.saavncdn.com/641/Shiv-Tandav-Stotram-Sanskrit-2016-500x500.jpg',
    url: 'https://aac.saavncdn.com/641/5c79c9aa37bb9f6fbec1672cf7fb4e52_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/641/5c79c9aa37bb9f6fbec1672cf7fb4e52_160.mp4'
    ],
    duration: 553,
    language: 'Sanskrit',
    year: '2016'
  },
  {
    id: 'AWSA4opy',
    name: 'Harivarasanam',
    artist: 'K.J. Yesudas',
    album: 'Saranam Ponnayyappa',
    image: 'https://c.saavncdn.com/109/Saranam-Ponnayyappa-Tamil-1996-20200817133120-500x500.jpg',
    url: 'https://aac.saavncdn.com/109/375ae1b02ff41c0e126d6d236fe3f6ff_320.mp4',
    fallbackUrls: [
      'https://aac.saavncdn.com/109/375ae1b02ff41c0e126d6d236fe3f6ff_160.mp4'
    ],
    duration: 306,
    language: 'Malayalam/Tamil',
    year: '2013'
  }
];

// 5. Curated Albums with live tracks
export const STARTER_ALBUMS: Album[] = [
  {
    id: '17435036',
    title: 'Ala Vaikunthapurramuloo',
    artists: 'Thaman S, Sid Sriram, Armaan Malik',
    year: '2019',
    language: 'Telugu',
    songCount: 7,
    cover: 'https://c.saavncdn.com/517/Ala-Vaikunthapurramuloo-Telugu-2019-20200116144338-500x500.jpg',
    songs: [
      STARTER_SONGS[1], // Samajavaragamana
      TELUGU_SONGS[0],  // Ramuloo Ramulaa
      STARTER_SONGS[2], // Buttabomma
      TELUGU_SONGS[2],  // Sittharala Sirapadu
      {
        id: 'EckxG09S',
        name: 'OMG Daddy',
        artist: 'Roll Rida, Rahul Nambiar, Lady Kash, Rahul Sipligunj',
        album: 'Ala Vaikunthapurramuloo',
        image: 'https://c.saavncdn.com/517/Ala-Vaikunthapurramuloo-Telugu-2019-20200116144338-500x500.jpg',
        url: 'https://aac.saavncdn.com/517/46afe3c008cfb859f0759ad174cd1f6a_320.mp4',
        duration: 228,
        year: '2019',
        language: 'Telugu'
      },
      {
        id: 'vvbpF9n6',
        name: 'Samajavaragamana - Female',
        artist: 'Shreya Ghoshal',
        album: 'Ala Vaikunthapurramuloo',
        image: 'https://c.saavncdn.com/517/Ala-Vaikunthapurramuloo-Telugu-2019-20200116144338-500x500.jpg',
        url: 'https://aac.saavncdn.com/517/dab4be47f3e89ee1f7f71ecef1bf72e4_320.mp4',
        duration: 241,
        year: '2019',
        language: 'Telugu'
      },
      {
        id: 'q_SPo3TX',
        name: 'Ala Vaikunthapurramuloo Title Track',
        artist: 'Sri Krishna, Priya Sisters',
        album: 'Ala Vaikunthapurramuloo',
        image: 'https://c.saavncdn.com/517/Ala-Vaikunthapurramuloo-Telugu-2019-20200116144338-500x500.jpg',
        url: 'https://aac.saavncdn.com/517/dce6db6da8e0ec9302d8aa6ac30f973d_320.mp4',
        duration: 193,
        year: '2019',
        language: 'Telugu'
      }
    ]
  },
  {
    id: '38845390',
    title: 'Brahmastra',
    artists: 'Pritam, Arijit Singh, Amitabh Bhattacharya',
    year: '2022',
    language: 'Hindi',
    songCount: 4,
    cover: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    songs: [
      STARTER_SONGS[0] // Kesariya
    ]
  },
  {
    id: '48037104',
    title: 'Jawan',
    artists: 'Anirudh Ravichander, Arijit Singh, Shilpa Rao',
    year: '2023',
    language: 'Hindi',
    songCount: 3,
    cover: 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg',
    songs: [
      STARTER_SONGS[3] // Chaleya
    ]
  },
  {
    id: 'alb_devotional_classics',
    title: 'Divine Chants & Devotional Stotras',
    artists: 'M. S. Subbulakshmi, Shankar Mahadevan, Hariharan',
    year: '2023',
    language: 'Sanskrit/Telugu',
    songCount: 4,
    cover: 'https://c.saavncdn.com/753/Sri-Venkateshwara-Suprabhatham-Ms-Subbulakshmi-2005-500x500.jpg',
    songs: DEVOTIONAL_SONGS
  }
];

// Helper to normalize song payloads from Sangeetham API
export function normalizeSong(raw: any): Song | null {
  if (!raw) return null;

  const id = String(raw.id || raw.albumid || Math.random().toString(36).substring(2));
  const name = decodeHTMLEntities(raw.name || raw.song || raw.title || 'Unknown Track');

  let artist = 'Various Artists';
  if (raw.artists?.primary && Array.isArray(raw.artists.primary) && raw.artists.primary.length > 0) {
    artist = raw.artists.primary.map((a: any) => a.name).join(', ');
  } else if (raw.primaryArtists || raw.primary_artists) {
    artist = raw.primaryArtists || raw.primary_artists;
  } else if (raw.singers) {
    artist = raw.singers;
  } else if (raw.artist) {
    artist = raw.artist;
  }
  artist = decodeHTMLEntities(artist);

  let album = 'Sangeetham Music';
  if (typeof raw.album === 'string') {
    album = raw.album;
  } else if (raw.album && typeof raw.album === 'object' && raw.album.name) {
    album = raw.album.name;
  }
  album = decodeHTMLEntities(album);

  let image = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';
  if (raw.image) {
    if (typeof raw.image === 'string') {
      image = raw.image.replace('150x150', '500x500').replace('50x50', '500x500');
    } else if (Array.isArray(raw.image) && raw.image.length > 0) {
      const highRes = raw.image.find((img: any) => img.quality === '500x500') || raw.image[raw.image.length - 1];
      image = highRes?.url || highRes?.link || image;
    }
  }

  let url = '';
  const fallbackUrls: string[] = [];

  if (Array.isArray(raw.downloadUrl) && raw.downloadUrl.length > 0) {
    const q320 = raw.downloadUrl.find((d: any) => d.quality === '320kbps');
    const q160 = raw.downloadUrl.find((d: any) => d.quality === '160kbps');

    const highest = q320 || q160 || raw.downloadUrl[raw.downloadUrl.length - 1];
    url = highest?.url || highest?.link || '';

    raw.downloadUrl.forEach((d: any) => {
      const u = d.url || d.link;
      if (u && u !== url) fallbackUrls.push(u);
    });
  } else if (raw.media_preview_url || raw.media_url) {
    url = raw.media_url || raw.media_preview_url;
  }

  if (!url) return null;

  return {
    id,
    name,
    artist,
    album,
    image,
    url,
    fallbackUrls,
    duration: typeof raw.duration === 'number' ? raw.duration : parseInt(raw.duration || '200', 10),
    quality: '320kbps',
    year: raw.year ? String(raw.year) : undefined,
    language: raw.language
  };
}

// Helper to normalize Album payloads from Sangeetham API
export function normalizeAlbum(raw: any): Album | null {
  if (!raw) return null;

  const id = String(raw.id || raw.albumid || Math.random().toString(36).substring(2));
  const title = decodeHTMLEntities(raw.name || raw.title || raw.album || 'Featured Album');

  let artists = 'Various Artists';
  if (raw.artists?.primary && Array.isArray(raw.artists.primary) && raw.artists.primary.length > 0) {
    artists = raw.artists.primary.map((a: any) => a.name).join(', ');
  } else if (Array.isArray(raw.artists) && raw.artists.length > 0) {
    artists = raw.artists.map((a: any) => (typeof a === 'string' ? a : a.name)).filter(Boolean).slice(0, 3).join(', ');
  } else if (raw.primaryArtists || raw.primary_artists) {
    artists = raw.primaryArtists || raw.primary_artists;
  } else if (raw.artist) {
    artists = raw.artist;
  } else if (raw.type === 'playlist') {
    artists = 'Curated Playlist • ' + (raw.language ? raw.language.charAt(0).toUpperCase() + raw.language.slice(1) : 'Top Hits');
  }
  artists = decodeHTMLEntities(artists);

  let cover = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';
  if (raw.image) {
    if (typeof raw.image === 'string') {
      cover = raw.image.replace('150x150', '500x500').replace('50x50', '500x500');
    } else if (Array.isArray(raw.image) && raw.image.length > 0) {
      const highRes = raw.image.find((img: any) => img.quality === '500x500') || raw.image[raw.image.length - 1];
      cover = highRes?.url || highRes?.link || cover;
    }
  }

  return {
    id,
    title,
    artists,
    year: raw.year ? String(raw.year) : '2024',
    language: raw.language ? String(raw.language) : 'Indian Music',
    songCount: raw.songCount || raw.song_count || (raw.songs ? raw.songs.length : 5),
    cover,
    songs: Array.isArray(raw.songs) ? raw.songs.map(normalizeSong).filter((s: any): s is Song => s !== null) : undefined
  };
}

// Search songs using Sangeetham API with timeout & verified local fallback
export async function searchSongs(query: string, page = 1, limit = 20): Promise<Song[]> {
  if (!query.trim()) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const url = `${SANGEETHAM_API_BASE}/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const rawList = data?.data?.results || (Array.isArray(data?.data) ? data.data : []);

      if (Array.isArray(rawList)) {
        if (rawList.length > 0) {
          const normalized = rawList.map(normalizeSong).filter((s): s is Song => s !== null);
          if (normalized.length > 0) return normalized;
        }
        return [];
      }
    }
  } catch (err) {
    console.warn('Sangeetham API searchSongs note:', err);
  }

  // If page > 1, do not return starter fallback on failure or exhaustion
  if (page > 1) return [];

  // Filter starter list as offline fallback
  const qLower = query.toLowerCase();
  const allStarter = [...STARTER_SONGS, ...TELUGU_SONGS, ...HINDI_SONGS, ...DEVOTIONAL_SONGS];
  return allStarter.filter(
    (s) => s.name.toLowerCase().includes(qLower) || s.artist.toLowerCase().includes(qLower)
  );
}

// Search albums using Sangeetham API with timeout & verified local fallback
export async function searchAlbums(query: string, page = 1, limit = 20): Promise<Album[]> {
  if (!query.trim()) return page === 1 ? STARTER_ALBUMS : [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const url = `${SANGEETHAM_API_BASE}/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const rawList = data?.data?.results || (Array.isArray(data?.data) ? data.data : []);

      if (Array.isArray(rawList)) {
        if (rawList.length > 0) {
          const normalized = rawList.map(normalizeAlbum).filter((a): a is Album => a !== null);
          if (normalized.length > 0) return normalized;
        }
        return [];
      }
    }
  } catch (err) {
    console.warn('Sangeetham API searchAlbums note:', err);
  }

  // If page > 1, do not return starter fallback on failure or exhaustion
  if (page > 1) return [];

  // Filter starter albums as fallback
  const qLower = query.toLowerCase();
  const matched = STARTER_ALBUMS.filter(
    (a) => a.title.toLowerCase().includes(qLower) || a.artists.toLowerCase().includes(qLower)
  );
  return matched.length > 0 ? matched : STARTER_ALBUMS;
}

// Curated Top Starter Playlists & Charts
export const STARTER_PLAYLISTS: Album[] = [
  {
    id: '1134643225',
    title: 'Telugu: India Superhits Top 50',
    artists: 'Curated Playlist • Telugu Top 50 Chartbusters',
    year: '2024',
    language: 'Telugu',
    songCount: 50,
    cover: 'https://c.saavncdn.com/editorial/Telugu-IndiaSuperhitsTop50_20261016061728_500x500.jpg'
  },
  {
    id: '1134543272',
    title: 'Hindi: India Superhits Top 50',
    artists: 'Curated Playlist • 50 Most Popular Hindi Songs',
    year: '2024',
    language: 'Hindi',
    songCount: 50,
    cover: 'https://c.saavncdn.com/editorial/Hindi-IndiaSuperhitsTop50_20261023044158_500x500.jpg'
  },
  {
    id: '1266560012',
    title: "Let's Play - Anirudh Ravichander",
    artists: 'Curated Playlist • Anirudh Ravichander Hits',
    year: '2024',
    language: 'Tamil / Hindi',
    songCount: 26,
    cover: 'https://c.saavncdn.com/editorial/Let_sPlayAnirudhRavichanderHindi_20250901053835_500x500.jpg'
  },
  {
    id: '81882991',
    title: "Let's Play - S. P. Balasubrahmanyam",
    artists: 'Curated Playlist • SP Balasubrahmanyam Evergreen Hits',
    year: '2024',
    language: 'Telugu / Hindi',
    songCount: 22,
    cover: 'https://c.saavncdn.com/editorial/Let_sPlayS-P-BalasubrahmanyamHindi_20240212054517_500x500.jpg'
  },
  {
    id: '903409848',
    title: 'Sid Sriram - Love Songs & Melodies',
    artists: 'Curated Playlist • Sid Sriram Melody Chartbusters',
    year: '2024',
    language: 'Telugu',
    songCount: 30,
    cover: 'https://c.saavncdn.com/editorial/SidSriramLoveSongsTelugu_20240328074634_500x500.jpg'
  },
  {
    id: '802336660',
    title: 'Arijit Singh Romantic & Melodies',
    artists: 'Curated Playlist • Arijit Singh Romantic Essentials',
    year: '2024',
    language: 'Hindi',
    songCount: 25,
    cover: 'https://c.saavncdn.com/editorial/ArijitSinghSadSongsHindi_20240226083401_500x500.jpg'
  },
  {
    id: '1170578801',
    title: 'Telugu 1990s Chartbusters',
    artists: 'Curated Playlist • Golden Telugu 90s Hits',
    year: '2024',
    language: 'Telugu',
    songCount: 100,
    cover: 'https://c.saavncdn.com/editorial/charts_Telugu1990s_157621_20240408063237_500x500.jpg'
  },
  {
    id: '1170578805',
    title: 'Telugu 2000s Chartbusters',
    artists: 'Curated Playlist • Iconic Telugu 2000s Hits',
    year: '2024',
    language: 'Telugu',
    songCount: 100,
    cover: 'https://c.saavncdn.com/editorial/charts_Telugu2000s_119381_20240408063159_500x500.jpg'
  }
];

// Search playlists using Sangeetham API with timeout & verified local fallback
export async function searchPlaylists(query: string, page = 1, limit = 20): Promise<Album[]> {
  if (!query.trim()) return page === 1 ? STARTER_PLAYLISTS : [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const url = `${SANGEETHAM_API_BASE}/search/playlists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const rawList = data?.data?.results || (Array.isArray(data?.data) ? data.data : []);

      if (Array.isArray(rawList)) {
        if (rawList.length > 0) {
          const normalized = rawList.map(normalizeAlbum).filter((a): a is Album => a !== null);
          if (normalized.length > 0) return normalized;
        }
        return [];
      }
    }
  } catch (err) {
    console.warn('Sangeetham API searchPlaylists note:', err);
  }

  // If page > 1, do not return starter fallback on failure or exhaustion
  if (page > 1) return [];

  // Filter fallback
  const qLower = query.toLowerCase();
  const matched = STARTER_PLAYLISTS.filter(
    (p) => p.title.toLowerCase().includes(qLower) || p.artists.toLowerCase().includes(qLower)
  );
  return matched.length > 0 ? matched : STARTER_PLAYLISTS;
}

// Get Top Charts songs via Sangeetham API
export async function fetchTopCharts(playlistQuery: string): Promise<Song[]> {
  const songs = await searchSongs(playlistQuery, 1, 15);
  return songs.length > 0 ? songs : STARTER_SONGS;
}

// Get Telugu songs via Sangeetham API
export async function fetchTeluguSongs(): Promise<Song[]> {
  const songs = await searchSongs('telugu latest hits', 1, 8);
  return songs.length > 0 ? songs : TELUGU_SONGS;
}

// Get Hindi songs via Sangeetham API
export async function fetchHindiSongs(): Promise<Song[]> {
  const songs = await searchSongs('bollywood top hindi hits', 1, 8);
  return songs.length > 0 ? songs : HINDI_SONGS;
}

// Get Devotional songs via Sangeetham API
export async function fetchDevotionalSongs(): Promise<Song[]> {
  const songs = await searchSongs('popular devotional songs', 1, 8);
  return songs.length > 0 ? songs : DEVOTIONAL_SONGS;
}

// Legacy album ID mapper for seamless compatibility
const ALBUM_ALIAS_MAP: Record<string, string> = {
  'alb_ala_vaikunthapurramuloo': '17435036',
  'alb_merupu_kalalu': '9189182',
  'alb_sita_ramam': '48037104',
  'alb_geetha_govindam': '48037104',
  'alb_telugu_hits': '48037104'
};

// Get Album Details by ID from Sangeetham API (supports both Albums and Playlists)
export async function getAlbumDetails(albumId: string): Promise<Album | null> {
  const targetId = ALBUM_ALIAS_MAP[albumId] || albumId;

  // Check local starter albums & playlists first
  const localMatch = [...STARTER_ALBUMS, ...STARTER_PLAYLISTS].find(
    (a) => a.id === targetId || a.id === albumId
  );
  if (localMatch && localMatch.songs && localMatch.songs.length > 2) return localMatch;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // 1. Try albums endpoint first
    const url = `${SANGEETHAM_API_BASE}/albums?id=${encodeURIComponent(targetId)}`;
    const res = await fetch(url, { signal: controller.signal });

    if (res.ok) {
      const data = await res.json();
      const raw = data?.data || data;
      if (raw && (raw.name || raw.title) && Array.isArray(raw.songs) && raw.songs.length > 0) {
        clearTimeout(timeoutId);
        const norm = normalizeAlbum(raw);
        if (norm) return norm;
      }
    }

    // 2. Fallback to playlists endpoint for chart / playlist collections
    const playlistUrl = `${SANGEETHAM_API_BASE}/playlists?id=${encodeURIComponent(targetId)}`;
    const pRes = await fetch(playlistUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (pRes.ok) {
      const pData = await pRes.json();
      const pRaw = pData?.data || pData;
      if (pRaw && (pRaw.name || pRaw.title)) {
        const norm = normalizeAlbum(pRaw);
        if (norm) return norm;
      }
    }
  } catch (err) {
    console.warn('Sangeetham API getAlbumDetails note:', err);
  }

  return localMatch || STARTER_ALBUMS[0];
}

// Get Song by ID from Sangeetham API (for deep-linking & shared URLs)
export async function getSongById(songId: string): Promise<Song | null> {
  if (!songId) return null;

  // 1. Search in local curated collections first
  const allStarters = [...STARTER_SONGS, ...TELUGU_SONGS, ...HINDI_SONGS, ...DEVOTIONAL_SONGS];
  const local = allStarters.find((s) => s.id === songId);
  if (local) return local;

  // Check starter album tracks
  for (const alb of STARTER_ALBUMS) {
    if (alb.songs) {
      const match = alb.songs.find((s) => s.id === songId);
      if (match) return match;
    }
  }

  // 2. Query Sangeetham API directly: /api/songs/:id
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const url = `${SANGEETHAM_API_BASE}/songs/${encodeURIComponent(songId)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const rawList = data?.data || data?.results || (Array.isArray(data) ? data : [data]);
      const first = Array.isArray(rawList) ? rawList[0] : rawList;
      if (first) {
        const norm = normalizeSong(first);
        if (norm) return norm;
      }
    }
  } catch (err) {
    console.warn('Sangeetham API getSongById note:', err);
  }

  // 3. Fallback query with query parameter /api/songs?ids=:id
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const url = `${SANGEETHAM_API_BASE}/songs?ids=${encodeURIComponent(songId)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const rawList = data?.data || data?.results;
      const first = Array.isArray(rawList) ? rawList[0] : rawList;
      if (first) {
        const norm = normalizeSong(first);
        if (norm) return norm;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

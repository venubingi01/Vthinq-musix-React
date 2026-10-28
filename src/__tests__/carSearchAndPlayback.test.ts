import { describe, it, expect } from 'vitest';
import { searchSongs, decodeHTMLEntities, STARTER_SONGS } from '../services/sangeethamApi';

describe('Car Mode Music Search & Song Resolution', () => {
  it('returns empty array for empty search queries without network call', async () => {
    const results = await searchSongs('');
    expect(results).toEqual([]);

    const whitespaceResults = await searchSongs('    ');
    expect(whitespaceResults).toEqual([]);
  });

  it('correctly decodes HTML entities in song and artist names', () => {
    expect(decodeHTMLEntities('Song &amp; Dance')).toBe('Song & Dance');
    expect(decodeHTMLEntities('Artist&#039;s Track')).toBe("Artist's Track");
    expect(decodeHTMLEntities('&quot;Hit Song&quot;')).toBe('"Hit Song"');
  });

  it('resolves songs with fallback starters if API is offline or during offline testing', async () => {
    const results = await searchSongs('Kesariya');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('kesariya');
    expect(results[0].url).toBeDefined();
  });

  it('verifies starter songs have valid metadata and playable URLs', () => {
    STARTER_SONGS.forEach((song) => {
      expect(song.id).toBeDefined();
      expect(song.name).toBeTruthy();
      expect(song.artist).toBeTruthy();
      expect(song.url).toMatch(/^https?:\/\//);
      expect(song.image).toMatch(/^https?:\/\//);
    });
  });

  it('supports pagination with page and limit parameters', async () => {
    // Empty search on page > 1 returns empty array
    const emptyResults = await searchSongs('', 2, 20);
    expect(emptyResults).toEqual([]);

    // Fallback for non-existent query on page 2 should not duplicate starter songs
    const page2NoMatch = await searchSongs('nonexistentuniquexyzsongquery', 2, 20);
    expect(page2NoMatch).toEqual([]);
  });
});

'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getAlbumDetails,
  searchAlbums,
  searchSongs,
  searchPlaylists,
  fetchTopCharts,
  getSongById
} from '../services/saavnApi';
import type { Song, Album } from '../types/music';

// TanStack Query hook for Album or Playlist Details
export function useAlbumQuery(albumId: string, fallbackTitle?: string) {
  return useQuery<Album | null>({
    queryKey: ['albumDetails', albumId, fallbackTitle || ''],
    queryFn: () => getAlbumDetails(albumId, fallbackTitle),
    enabled: Boolean(albumId),
    staleTime: 1000 * 60 * 15
  });
}

// TanStack Query hook for searching Albums
export function useSearchAlbumsQuery(query: string, page = 1, limit = 20) {
  return useQuery<Album[]>({
    queryKey: ['searchAlbums', query.trim().toLowerCase(), page, limit],
    queryFn: () => searchAlbums(query, page, limit),
    enabled: Boolean(query.trim()),
    staleTime: 1000 * 60 * 10
  });
}

// TanStack Query hook for searching Songs
export function useSearchSongsQuery(query: string, page = 1, limit = 20) {
  return useQuery<Song[]>({
    queryKey: ['searchSongs', query.trim().toLowerCase(), page, limit],
    queryFn: () => searchSongs(query, page, limit),
    enabled: Boolean(query.trim()),
    staleTime: 1000 * 60 * 10
  });
}

// TanStack Query hook for searching Playlists
export function useSearchPlaylistsQuery(query: string, page = 1, limit = 20) {
  return useQuery<Album[]>({
    queryKey: ['searchPlaylists', query.trim().toLowerCase(), page, limit],
    queryFn: () => searchPlaylists(query, page, limit),
    enabled: Boolean(query.trim()),
    staleTime: 1000 * 60 * 10
  });
}

// TanStack Query hook for deep-linking song details
export function useSongQuery(songId: string) {
  return useQuery<Song | null>({
    queryKey: ['song', songId],
    queryFn: () => getSongById(songId),
    enabled: Boolean(songId),
    staleTime: 1000 * 60 * 30
  });
}

// TanStack Query hook for Top Charts
export function useTopChartsQuery(query: string) {
  return useQuery<Song[]>({
    queryKey: ['topCharts', query.trim().toLowerCase()],
    queryFn: () => fetchTopCharts(query),
    enabled: Boolean(query.trim()),
    staleTime: 1000 * 60 * 10
  });
}

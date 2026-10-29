import { NextResponse } from 'next/server';
import {
  recordSongLike,
  recordSongDislike,
  recordSongSkip,
  recordPlaylistSave
} from '@/services/aiPreferenceService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, song, playlistTitle } = body;

    if (action === 'like' && song) {
      recordSongLike(song);
    } else if (action === 'dislike' && song) {
      recordSongDislike(song);
    } else if (action === 'skip' && song) {
      recordSongSkip(song);
    } else if (action === 'save_playlist' && playlistTitle) {
      recordPlaylistSave(playlistTitle);
    } else {
      return NextResponse.json({ error: 'Invalid feedback action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error('Feedback API Error:', error);
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { generateAIPlaylist, parsePlaylistConstraints } from '@/services/aiPlaylistEngine';
import type { PlaylistConstraints } from '@/types/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let constraints: PlaylistConstraints;

    if (body.prompt && typeof body.prompt === 'string') {
      constraints = parsePlaylistConstraints(body.prompt, body.constraints);
    } else if (body.constraints) {
      constraints = body.constraints;
    } else {
      constraints = parsePlaylistConstraints('');
    }

    const playlist = await generateAIPlaylist(constraints);
    return NextResponse.json({
      playlist,
      constraints
    });
  } catch (error) {
    console.error('Playlist Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate playlist' },
      { status: 500 }
    );
  }
}

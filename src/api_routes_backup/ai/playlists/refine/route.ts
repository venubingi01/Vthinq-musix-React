import { NextResponse } from 'next/server';
import { refineAIPlaylist } from '@/services/aiPlaylistEngine';
import type { GeneratedPlaylist, PlaylistConstraints } from '@/types/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentPlaylist, prompt, overrideConstraints } = body as {
      currentPlaylist: GeneratedPlaylist;
      prompt: string;
      overrideConstraints?: Partial<PlaylistConstraints>;
    };

    if (!currentPlaylist) {
      return NextResponse.json(
        { error: 'currentPlaylist is required for refinement' },
        { status: 400 }
      );
    }

    const refined = await refineAIPlaylist(
      currentPlaylist,
      prompt || '',
      overrideConstraints
    );

    return NextResponse.json({
      playlist: refined,
      constraints: refined.constraints
    });
  } catch (error) {
    console.error('Playlist Refine Error:', error);
    return NextResponse.json(
      { error: 'Failed to refine playlist' },
      { status: 500 }
    );
  }
}

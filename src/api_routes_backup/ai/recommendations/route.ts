import { NextResponse } from 'next/server';
import { generateAIPlaylist, parsePlaylistConstraints } from '@/services/aiPlaylistEngine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activity = searchParams.get('activity') || '';
    const mood = searchParams.get('mood') || '';
    const language = searchParams.get('language') || '';
    const query = `${activity} ${mood} ${language}`.trim() || 'trending melodies';

    const constraints = parsePlaylistConstraints(query);
    const playlist = await generateAIPlaylist(constraints);

    return NextResponse.json({
      playlist,
      context: { activity, mood, language }
    });
  } catch (error) {
    console.error('Recommendations API Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve recommendations' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import {
  findVerifiedSongKnowledge,
  resolveSongKnowledgeFromContext,
  formatSongKnowledgeReply
} from '@/services/songKnowledgeService';
import type { Song } from '@/types/music';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { songTitle, activeTrack, question } = body as {
      songTitle?: string;
      activeTrack?: Song;
      question?: string;
    };

    let factSheet = null;

    if (songTitle) {
      factSheet = findVerifiedSongKnowledge(songTitle);
    }

    if (!factSheet && activeTrack) {
      factSheet = resolveSongKnowledgeFromContext(activeTrack, question);
    }

    if (!factSheet) {
      return NextResponse.json(
        {
          found: false,
          answer: `Could not find verified credits for "${songTitle || activeTrack?.name || 'this track'}".`,
          song: null,
          verificationStatus: 'unverified',
          sources: []
        },
        { status: 404 }
      );
    }

    const answer = formatSongKnowledgeReply(factSheet, question);

    return NextResponse.json({
      found: true,
      answer,
      song: factSheet,
      verificationStatus: factSheet.verificationStatus,
      sources: factSheet.sources
    });
  } catch (error) {
    console.error('Song Info Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve song information' },
      { status: 500 }
    );
  }
}

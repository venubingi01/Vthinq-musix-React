import { NextResponse } from 'next/server';
import { processAIChatMessage } from '@/services/aiOrchestratorService';
import type { AIChatRequest } from '@/types/ai';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AIChatRequest;
    if (!body || !body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Valid "message" string is required' },
        { status: 400 }
      );
    }

    const response = await processAIChatMessage(body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI chat message' },
      { status: 500 }
    );
  }
}

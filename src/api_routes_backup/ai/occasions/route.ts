import { NextResponse } from 'next/server';
import {
  getTodayDevotionalOccasion,
  detectFestivalOrOccasion,
  MAJOR_FESTIVALS
} from '@/services/occasionService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const todayOccasion = getTodayDevotionalOccasion();
    let searchedOccasion = null;

    if (query) {
      searchedOccasion = detectFestivalOrOccasion(query);
    }

    return NextResponse.json({
      todayOccasion,
      searchedOccasion,
      allMajorFestivals: MAJOR_FESTIVALS
    });
  } catch (error) {
    console.error('Occasions API Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve devotional occasions' },
      { status: 500 }
    );
  }
}

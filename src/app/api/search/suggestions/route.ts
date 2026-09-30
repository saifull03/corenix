import { NextRequest, NextResponse } from 'next/server';
import { getAutocompleteSuggestions } from '@/lib/search';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    const suggestions = await getAutocompleteSuggestions(q);
    return NextResponse.json({ suggestions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}

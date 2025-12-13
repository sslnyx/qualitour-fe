import { NextResponse } from 'next/server';

import { getBusinessReviews } from '@/lib/wordpress/api';

export const revalidate = 3600;

export async function GET() {
  try {
    const placeDetails = await getBusinessReviews();
    return NextResponse.json(placeDetails, { status: 200 });
  } catch {
    // Keep this endpoint safe for public clients: no internal error details.
    return NextResponse.json(null, { status: 200 });
  }
}

import { NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/strava';

export async function POST(request: Request) {
  const { refreshToken } = await request.json();
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  try {
    const tokens = await refreshAccessToken(refreshToken, clientId, clientSecret);
    return NextResponse.json(tokens);
  } catch {
    return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
  }
}

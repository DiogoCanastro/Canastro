import { NextResponse } from 'next/server';
import { getStravaAuthUrl } from '@/lib/strava';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: 'Strava client ID not configured' }, { status: 500 });
  }

  const redirectUri = `${origin}/api/strava/callback`;
  const authUrl = getStravaAuthUrl(clientId, redirectUri);
  return NextResponse.redirect(authUrl);
}

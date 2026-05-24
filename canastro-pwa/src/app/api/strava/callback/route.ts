import { NextResponse } from 'next/server';
import { exchangeCode } from '@/lib/strava';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${origin}/workouts?strava=denied`);
  }

  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/workouts?strava=error`);
  }

  try {
    const tokens = await exchangeCode(code, clientId, clientSecret);
    // Pass tokens to client via URL fragment (never logged server-side)
    const fragment = encodeURIComponent(JSON.stringify(tokens));
    return NextResponse.redirect(`${origin}/workouts?strava=success#${fragment}`);
  } catch {
    return NextResponse.redirect(`${origin}/workouts?strava=error`);
  }
}

import type { StravaActivity, StravaTokens } from '@/types';

export const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
export const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
export const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

export function getStravaAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
  });
  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(
  code: string,
  clientId: string,
  clientSecret: string
): Promise<StravaTokens> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) throw new Error('Failed to exchange code');

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    athleteId: data.athlete.id,
    athleteName: `${data.athlete.firstname} ${data.athlete.lastname}`,
    athleteAvatar: data.athlete.profile_medium,
  };
}

export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<Partial<StravaTokens>> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) throw new Error('Failed to refresh token');

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
  };
}

export async function fetchActivities(
  accessToken: string,
  page = 1,
  perPage = 30
): Promise<StravaActivity[]> {
  const response = await fetch(
    `${STRAVA_API_BASE}/athlete/activities?page=${page}&per_page=${perPage}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) throw new Error('Failed to fetch activities');
  return response.json();
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
}

export function sportTypeToEmoji(type: string): string {
  const map: Record<string, string> = {
    Run: '🏃',
    Ride: '🚴',
    Swim: '🏊',
    Walk: '🚶',
    Hike: '🥾',
    WeightTraining: '🏋️',
    Yoga: '🧘',
    Soccer: '⚽',
    Tennis: '🎾',
    Basketball: '🏀',
    Skiing: '⛷️',
    Snowboard: '🏂',
    Surfing: '🏄',
    Rowing: '🚣',
    Kayaking: '🛶',
    Golf: '⛳',
    Crossfit: '💪',
    EBikeRide: '🚴',
    VirtualRide: '🚴',
    VirtualRun: '🏃',
  };
  return map[type] || '💪';
}

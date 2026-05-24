'use client';

import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { fetchActivities, refreshAccessToken } from '@/lib/strava';
import type { StravaTokens, Workout } from '@/types';

function stravaActivityToWorkout(activity: import('@/types').StravaActivity): Workout {
  return {
    id: `strava-${activity.id}`,
    stravaId: activity.id,
    source: 'strava',
    name: activity.name,
    type: activity.sport_type,
    date: activity.start_date,
    duration: activity.moving_time,
    distance: activity.distance || undefined,
    elevationGain: activity.total_elevation_gain || undefined,
    avgHeartRate: activity.average_heartrate || undefined,
    calories: activity.calories || undefined,
  };
}

export function useStrava() {
  const [tokens, setTokens, tokensLoaded] = useLocalStorage<StravaTokens | null>('strava_tokens', null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!tokens;

  const disconnect = useCallback(() => {
    setTokens(null);
  }, [setTokens]);

  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (!tokens) return null;
    if (Date.now() / 1000 < tokens.expiresAt - 300) return tokens.accessToken;

    try {
      const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
      const response = await fetch('/api/strava/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
      if (!response.ok) throw new Error('Refresh failed');
      const newTokens = await response.json();
      setTokens({ ...tokens, ...newTokens });
      return newTokens.accessToken;
    } catch {
      setTokens(null);
      return null;
    }
  }, [tokens, setTokens]);

  const syncActivities = useCallback(async (): Promise<Workout[]> => {
    setSyncing(true);
    setError(null);
    try {
      const token = await getValidToken();
      if (!token) throw new Error('Not connected to Strava');
      const activities = await fetchActivities(token, 1, 50);
      return activities.map(stravaActivityToWorkout);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      setError(msg);
      return [];
    } finally {
      setSyncing(false);
    }
  }, [getValidToken]);

  return { tokens, isConnected, syncing, error, disconnect, syncActivities, tokensLoaded };
}

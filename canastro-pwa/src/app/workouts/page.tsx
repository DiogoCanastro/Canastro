'use client';

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Unlink, Dumbbell } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import AddWorkoutModal from '@/components/modals/AddWorkoutModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useStrava } from '@/hooks/useStrava';
import { formatDuration, formatDistance, sportTypeToEmoji } from '@/lib/strava';
import type { Workout, StravaTokens } from '@/types';

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('workouts', []);
  const [showAdd, setShowAdd] = useState(false);
  const { isConnected, syncing, error, tokens, disconnect, syncActivities, tokensLoaded } = useStrava();
  const [, setStoredTokens] = useLocalStorage<StravaTokens | null>('strava_tokens', null);

  // Handle Strava OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('strava');
    if (status === 'success' && window.location.hash) {
      try {
        const tkns = JSON.parse(decodeURIComponent(window.location.hash.slice(1)));
        setStoredTokens(tkns);
        window.history.replaceState({}, '', '/workouts');
      } catch {}
    }
  }, [setStoredTokens]);

  const handleSync = async () => {
    const synced = await syncActivities();
    if (synced.length > 0) {
      setWorkouts(prev => {
        const existingStravaIds = new Set(prev.filter(w => w.stravaId).map(w => w.stravaId));
        const newOnes = synced.filter(w => !existingStravaIds.has(w.stravaId));
        return [...newOnes, ...prev];
      });
    }
  };

  const addWorkout = (w: Workout) => setWorkouts(prev => [w, ...prev]);
  const removeWorkout = (id: string) => setWorkouts(prev => prev.filter(w => w.id !== id));

  const sorted = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;

  return (
    <div>
      <PageHeader
        title="Workouts"
        subtitle={`${workouts.length} logged`}
        action={
          <button onClick={() => setShowAdd(true)} className="bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-4 space-y-4">
        {/* Strava connect */}
        {tokensLoaded && (
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            {isConnected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <p className="text-sm font-medium text-white">Strava connected</p>
                    </div>
                    {tokens?.athleteName && <p className="text-xs text-zinc-400 mt-0.5">{tokens.athleteName}</p>}
                  </div>
                  <button onClick={disconnect} className="text-zinc-500 p-1.5"><Unlink size={16} /></button>
                </div>
                <button onClick={handleSync} disabled={syncing} className="btn-secondary w-full flex items-center justify-center gap-2">
                  <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? 'Syncing…' : 'Sync from Strava'}
                </button>
                {error && <p className="text-xs text-red-400">{error}</p>}
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-white mb-1">Connect Strava</p>
                <p className="text-xs text-zinc-400 mb-3">Automatically import your activities</p>
                {clientId ? (
                  <a href="/api/strava/auth" className="btn-primary block text-center">
                    Connect Strava
                  </a>
                ) : (
                  <p className="text-xs text-yellow-400 bg-yellow-400/10 rounded-xl p-3">
                    Add NEXT_PUBLIC_STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET to your .env.local to enable Strava sync.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Workout list */}
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <Dumbbell size={40} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400">No workouts yet</p>
            <p className="text-zinc-600 text-sm mt-1">Tap + to log one or sync from Strava</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(w => (
              <div key={w.id} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sportTypeToEmoji(w.type)}</span>
                      <p className="font-semibold text-white truncate">{w.name}</p>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {new Date(w.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      {w.source === 'strava' && <span className="ml-2 text-orange-400">• Strava</span>}
                    </p>
                  </div>
                  <button onClick={() => removeWorkout(w.id)} className="text-zinc-700 text-xs ml-2 p-1">✕</button>
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  <Stat label="Duration" value={formatDuration(w.duration)} />
                  {w.distance && <Stat label="Distance" value={formatDistance(w.distance)} />}
                  {w.avgHeartRate && <Stat label="Avg HR" value={`${w.avgHeartRate} bpm`} />}
                  {w.calories && <Stat label="Calories" value={`${w.calories} kcal`} />}
                  {w.elevationGain && <Stat label="Elevation" value={`${Math.round(w.elevationGain)} m`} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddWorkoutModal onClose={() => setShowAdd(false)} onAdd={addWorkout} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="text-[10px] text-zinc-500">{label}</p>
    </div>
  );
}

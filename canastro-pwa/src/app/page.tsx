'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Dumbbell, Heart, Target, Moon, CheckSquare, FolderOpen, TrendingUp, Flame, Zap } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Workout, HealthMetric, Goal, SleepEntry, TodoItem, Project } from '@/types';
import { formatDuration, formatDistance, sportTypeToEmoji } from '@/lib/strava';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const [workouts] = useLocalStorage<Workout[]>('workouts', []);
  const [metrics] = useLocalStorage<HealthMetric[]>('health_metrics', []);
  const [goals] = useLocalStorage<Goal[]>('goals', []);
  const [sleepEntries] = useLocalStorage<SleepEntry[]>('sleep_entries', []);
  const [todos] = useLocalStorage<TodoItem[]>('todos', []);
  const [projects] = useLocalStorage<Project[]>('projects', []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const recentWorkout = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const lastSleep = [...sleepEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const activeGoals = goals.filter(g => !g.completed);
  const pendingTodos = todos.filter(t => !t.completed);
  const activeProjects = projects.filter(p => p.status === 'active');
  const latestWeight = [...metrics].filter(m => m.type === 'weight').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const thisWeekWorkouts = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="px-4 pt-12 space-y-5">
      {/* Header */}
      <div>
        <p className="text-zinc-400 text-sm">{today}</p>
        <h1 className="text-3xl font-bold text-white mt-0.5">{greeting()} 👋</h1>
      </div>

      {/* Week summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 text-center">
          <Dumbbell size={18} className="text-orange-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{thisWeekWorkouts.length}</p>
          <p className="text-[10px] text-zinc-400">workouts</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-3 text-center">
          <Moon size={18} className="text-indigo-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{lastSleep ? `${lastSleep.duration}h` : '—'}</p>
          <p className="text-[10px] text-zinc-400">last sleep</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-center">
          <Target size={18} className="text-emerald-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{activeGoals.length}</p>
          <p className="text-[10px] text-zinc-400">active goals</p>
        </div>
      </div>

      {/* Recent workout */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Last Workout</h2>
          <Link href="/workouts" className="text-xs text-orange-400">See all</Link>
        </div>
        {recentWorkout ? (
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg">{sportTypeToEmoji(recentWorkout.type)} <span className="font-semibold text-white">{recentWorkout.name}</span></p>
                <p className="text-sm text-zinc-400 mt-0.5">{new Date(recentWorkout.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
              {recentWorkout.source === 'strava' && (
                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Strava</span>
              )}
            </div>
            <div className="flex gap-4 mt-3">
              <div>
                <p className="text-base font-bold text-white">{formatDuration(recentWorkout.duration)}</p>
                <p className="text-[10px] text-zinc-500">duration</p>
              </div>
              {recentWorkout.distance && (
                <div>
                  <p className="text-base font-bold text-white">{formatDistance(recentWorkout.distance)}</p>
                  <p className="text-[10px] text-zinc-500">distance</p>
                </div>
              )}
              {recentWorkout.avgHeartRate && (
                <div>
                  <p className="text-base font-bold text-white">{recentWorkout.avgHeartRate} bpm</p>
                  <p className="text-[10px] text-zinc-500">avg HR</p>
                </div>
              )}
              {recentWorkout.calories && (
                <div>
                  <p className="text-base font-bold text-white">{recentWorkout.calories} kcal</p>
                  <p className="text-[10px] text-zinc-500">calories</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link href="/workouts" className="block bg-zinc-900 rounded-2xl p-4 border border-zinc-800 border-dashed text-center text-zinc-500 text-sm">
            No workouts yet — tap to add one
          </Link>
        )}
      </section>

      {/* Health + Sleep row */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/health" className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <Heart size={18} className="text-red-400 mb-2" />
          <p className="text-xl font-bold text-white">{latestWeight ? `${latestWeight.value} ${latestWeight.unit}` : '—'}</p>
          <p className="text-xs text-zinc-400">latest weight</p>
        </Link>
        <Link href="/sleep" className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <Moon size={18} className="text-indigo-400 mb-2" />
          <p className="text-xl font-bold text-white">{lastSleep ? `${lastSleep.duration}h` : '—'}</p>
          <p className="text-xs text-zinc-400">{lastSleep ? `quality ${lastSleep.quality}/5` : 'no data'}</p>
        </Link>
      </div>

      {/* Goals */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Goals</h2>
          <Link href="/goals" className="text-xs text-orange-400">See all</Link>
        </div>
        {activeGoals.slice(0, 3).length > 0 ? (
          <div className="space-y-2">
            {activeGoals.slice(0, 3).map(goal => {
              const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
              return (
                <div key={goal.id} className="bg-zinc-900 rounded-xl p-3 border border-zinc-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-sm font-medium text-white">{goal.title}</p>
                    <span className="text-xs text-zinc-400">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{goal.current}/{goal.target} {goal.unit}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <Link href="/goals" className="block bg-zinc-900 rounded-2xl p-4 border border-zinc-800 border-dashed text-center text-zinc-500 text-sm">
            No goals yet
          </Link>
        )}
      </section>

      {/* Todos */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">To-Do</h2>
          <Link href="/todos" className="text-xs text-orange-400">See all</Link>
        </div>
        {pendingTodos.slice(0, 4).length > 0 ? (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 divide-y divide-zinc-800">
            {pendingTodos.slice(0, 4).map(todo => (
              <div key={todo.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${todo.priority === 'high' ? 'bg-red-400' : todo.priority === 'medium' ? 'bg-yellow-400' : 'bg-zinc-600'}`} />
                <p className="text-sm text-white truncate">{todo.title}</p>
              </div>
            ))}
          </div>
        ) : (
          <Link href="/todos" className="block bg-zinc-900 rounded-2xl p-4 border border-zinc-800 border-dashed text-center text-zinc-500 text-sm">
            All caught up!
          </Link>
        )}
      </section>

      {/* Projects */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Projects</h2>
          <Link href="/projects" className="text-xs text-orange-400">See all</Link>
        </div>
        {activeProjects.slice(0, 2).length > 0 ? (
          <div className="space-y-2">
            {activeProjects.slice(0, 2).map(p => (
              <Link key={p.id} href="/projects" className="block bg-zinc-900 rounded-xl p-3 border border-zinc-800">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <p className="text-sm font-medium text-white">{p.name}</p>
                  <span className="ml-auto text-xs text-zinc-500">{p.progress}%</span>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Link href="/projects" className="block bg-zinc-900 rounded-2xl p-4 border border-zinc-800 border-dashed text-center text-zinc-500 text-sm">
            No active projects
          </Link>
        )}
      </section>

      <div className="h-4" />
    </div>
  );
}

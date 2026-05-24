'use client';

import { useState } from 'react';
import { Plus, Moon } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import AddSleepModal from '@/components/modals/AddSleepModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { SleepEntry } from '@/types';

const QUALITY_COLORS = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-400', 'bg-emerald-500'];
const QUALITY_LABELS = ['', 'Terrible', 'Poor', 'OK', 'Good', 'Great'];

export default function SleepPage() {
  const [entries, setEntries] = useLocalStorage<SleepEntry[]>('sleep_entries', []);
  const [showAdd, setShowAdd] = useState(false);

  const addEntry = (s: SleepEntry) => setEntries(prev => [s, ...prev]);
  const removeEntry = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));

  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const avgDuration = entries.length > 0
    ? (entries.reduce((sum, e) => sum + e.duration, 0) / entries.length).toFixed(1)
    : null;

  const avgQuality = entries.length > 0
    ? Math.round(entries.reduce((sum, e) => sum + e.quality, 0) / entries.length)
    : null;

  const last7 = sorted.slice(0, 7);
  const maxDur = Math.max(...last7.map(e => e.duration), 9);

  return (
    <div>
      <PageHeader
        title="Sleep"
        subtitle={entries.length > 0 ? `${avgDuration}h avg` : 'Track your sleep'}
        action={
          <button onClick={() => setShowAdd(true)} className="bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-4 space-y-4">
        {/* Stats */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
              <p className="text-2xl font-bold text-white">{avgDuration}h</p>
              <p className="text-xs text-zinc-400">avg duration</p>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
              <p className="text-2xl font-bold text-white">{avgQuality}/5</p>
              <p className="text-xs text-zinc-400">avg quality</p>
            </div>
          </div>
        )}

        {/* Bar chart (last 7) */}
        {last7.length > 0 && (
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <p className="text-xs text-zinc-400 mb-3">Last {last7.length} nights</p>
            <div className="flex items-end gap-2 h-20">
              {[...last7].reverse().map((e) => {
                const h = Math.round((e.duration / maxDur) * 100);
                return (
                  <div key={e.id} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-sm" style={{ height: `${h}%`, backgroundColor: QUALITY_COLORS[e.quality].replace('bg-', '') || '#6366f1', minHeight: 4 }}>
                      <div className={`w-full h-full rounded-t-sm ${QUALITY_COLORS[e.quality]}`} />
                    </div>
                    <p className="text-[9px] text-zinc-600">{new Date(e.date).toLocaleDateString('en-US', { weekday: 'narrow' })}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List */}
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <Moon size={40} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400">No sleep logged yet</p>
            <p className="text-zinc-600 text-sm mt-1">Tap + to log last night's sleep</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(e => (
              <div key={e.id} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">
                      {new Date(e.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{e.bedTime} → {e.wakeTime}</p>
                  </div>
                  <button onClick={() => removeEntry(e.id)} className="text-zinc-700 text-xs p-1">✕</button>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div>
                    <p className="text-xl font-bold text-white">{e.duration}h</p>
                    <p className="text-[10px] text-zinc-500">duration</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${QUALITY_COLORS[e.quality]}`} />
                      <p className="text-sm font-medium text-white">{QUALITY_LABELS[e.quality]}</p>
                    </div>
                    <p className="text-[10px] text-zinc-500">{e.quality}/5 quality</p>
                  </div>
                </div>
                {e.notes && <p className="text-xs text-zinc-400 mt-2 italic">"{e.notes}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddSleepModal onClose={() => setShowAdd(false)} onAdd={addEntry} />}
    </div>
  );
}

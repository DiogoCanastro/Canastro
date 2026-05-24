'use client';

import { useState } from 'react';
import { Plus, Heart } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import AddHealthModal from '@/components/modals/AddHealthModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { HealthMetric } from '@/types';

const TYPE_ICONS: Record<string, string> = {
  weight: '⚖️', heartRate: '❤️', bloodPressure: '🩺', steps: '👟', custom: '📊'
};

export default function HealthPage() {
  const [metrics, setMetrics] = useLocalStorage<HealthMetric[]>('health_metrics', []);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const addMetric = (m: HealthMetric) => setMetrics(prev => [m, ...prev]);
  const removeMetric = (id: string) => setMetrics(prev => prev.filter(m => m.id !== id));

  const sorted = [...metrics].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const types = Array.from(new Set(metrics.map(m => m.type)));
  const filtered = filter === 'all' ? sorted : sorted.filter(m => m.type === filter);

  // Latest values per type
  const latest: Record<string, HealthMetric> = {};
  sorted.forEach(m => { if (!latest[m.type]) latest[m.type] = m; });

  return (
    <div>
      <PageHeader
        title="Health"
        subtitle="Track your metrics"
        action={
          <button onClick={() => setShowAdd(true)} className="bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-4 space-y-4">
        {/* Latest summary cards */}
        {Object.values(latest).length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {Object.values(latest).map(m => (
              <div key={m.type} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                <p className="text-lg mb-1">{TYPE_ICONS[m.type] || '📊'}</p>
                <p className="text-xl font-bold text-white">{m.value} <span className="text-sm font-normal text-zinc-400">{m.unit}</span></p>
                <p className="text-xs text-zinc-400">{m.label}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">{new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        {types.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setFilter('all')} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${filter === 'all' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>All</button>
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium capitalize ${filter === t ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                {t === 'heartRate' ? 'Heart Rate' : t === 'bloodPressure' ? 'Blood Pressure' : t}
              </button>
            ))}
          </div>
        )}

        {/* Entries list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={40} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400">No metrics logged yet</p>
            <p className="text-zinc-600 text-sm mt-1">Tap + to add weight, heart rate, and more</p>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 divide-y divide-zinc-800">
            {filtered.map(m => (
              <div key={m.id} className="flex items-center px-4 py-3 gap-3">
                <span className="text-lg w-7">{TYPE_ICONS[m.type] || '📊'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{m.label}</p>
                  <p className="text-xs text-zinc-500">{new Date(m.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{m.value} {m.unit}</p>
                </div>
                <button onClick={() => removeMetric(m.id)} className="text-zinc-700 text-xs p-1">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddHealthModal onClose={() => setShowAdd(false)} onAdd={addMetric} />}
    </div>
  );
}

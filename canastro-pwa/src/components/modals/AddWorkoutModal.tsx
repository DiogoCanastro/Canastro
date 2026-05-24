'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Workout } from '@/types';

const WORKOUT_TYPES = ['Run', 'Ride', 'Swim', 'Walk', 'Hike', 'WeightTraining', 'Yoga', 'Crossfit', 'Other'];

interface Props {
  onClose: () => void;
  onAdd: (w: Workout) => void;
}

export default function AddWorkoutModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    name: '', type: 'Run', date: new Date().toISOString().split('T')[0],
    hours: '', minutes: '', seconds: '', distance: '', calories: '', heartRate: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = (parseInt(form.hours || '0') * 3600) + (parseInt(form.minutes || '0') * 60) + parseInt(form.seconds || '0');
    if (!form.name || duration === 0) return;
    onAdd({
      id: crypto.randomUUID(),
      source: 'manual',
      name: form.name,
      type: form.type,
      date: new Date(form.date).toISOString(),
      duration,
      distance: form.distance ? parseFloat(form.distance) * 1000 : undefined,
      calories: form.calories ? parseInt(form.calories) : undefined,
      avgHeartRate: form.heartRate ? parseInt(form.heartRate) : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div className="w-full bg-zinc-900 rounded-t-3xl p-6 pb-safe max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Log Workout</h2>
          <button onClick={onClose} className="text-zinc-400 p-1"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input-field" placeholder="Workout name" value={form.name} onChange={e => set('name', e.target.value)} required />
          <select className="input-field" value={form.type} onChange={e => set('type', e.target.value)}>
            {WORKOUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="date" className="input-field" value={form.date} onChange={e => set('date', e.target.value)} />
          <div className="grid grid-cols-3 gap-2">
            <input className="input-field" placeholder="Hours" type="number" min="0" value={form.hours} onChange={e => set('hours', e.target.value)} />
            <input className="input-field" placeholder="Min" type="number" min="0" max="59" value={form.minutes} onChange={e => set('minutes', e.target.value)} />
            <input className="input-field" placeholder="Sec" type="number" min="0" max="59" value={form.seconds} onChange={e => set('seconds', e.target.value)} />
          </div>
          <input className="input-field" placeholder="Distance (km) optional" type="number" step="0.01" value={form.distance} onChange={e => set('distance', e.target.value)} />
          <input className="input-field" placeholder="Calories optional" type="number" value={form.calories} onChange={e => set('calories', e.target.value)} />
          <input className="input-field" placeholder="Avg heart rate optional" type="number" value={form.heartRate} onChange={e => set('heartRate', e.target.value)} />
          <button type="submit" className="btn-primary w-full">Add Workout</button>
        </form>
      </div>
    </div>
  );
}

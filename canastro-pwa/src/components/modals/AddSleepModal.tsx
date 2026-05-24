'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { SleepEntry } from '@/types';

interface Props {
  onClose: () => void;
  onAdd: (s: SleepEntry) => void;
}

const QUALITY_LABELS = ['', 'Terrible', 'Poor', 'OK', 'Good', 'Great'];

export default function AddSleepModal({ onClose, onAdd }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bedTime, setBedTime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [notes, setNotes] = useState('');

  function calcDuration(bed: string, wake: string): number {
    const [bh, bm] = bed.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);
    let mins = (wh * 60 + wm) - (bh * 60 + bm);
    if (mins < 0) mins += 24 * 60;
    return Math.round(mins / 6) / 10;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: crypto.randomUUID(),
      date: new Date(date).toISOString(),
      bedTime,
      wakeTime,
      duration: calcDuration(bedTime, wakeTime),
      quality,
      notes: notes || undefined,
    });
    onClose();
  };

  const duration = calcDuration(bedTime, wakeTime);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div className="w-full bg-zinc-900 rounded-t-3xl p-6 pb-safe" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Log Sleep</h2>
          <button onClick={onClose} className="text-zinc-400 p-1"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Bed time</label>
              <input type="time" className="input-field" value={bedTime} onChange={e => setBedTime(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Wake time</label>
              <input type="time" className="input-field" value={wakeTime} onChange={e => setWakeTime(e.target.value)} />
            </div>
          </div>
          <div className="bg-zinc-800 rounded-xl p-3 text-center">
            <span className="text-2xl font-bold text-white">{duration}h</span>
            <p className="text-xs text-zinc-400">sleep duration</p>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Sleep quality</label>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as const).map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${quality === q ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-zinc-400 mt-1">{QUALITY_LABELS[quality]}</p>
          </div>
          <input className="input-field" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
          <button type="submit" className="btn-primary w-full">Log Sleep</button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Goal } from '@/types';

const CATEGORIES = ['fitness', 'health', 'personal', 'work', 'other'] as const;

interface Props {
  onClose: () => void;
  onAdd: (g: Goal) => void;
}

export default function AddGoalModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'personal' as Goal['category'],
    target: '', unit: '', current: '0', deadline: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.target) return;
    onAdd({
      id: crypto.randomUUID(),
      title: form.title,
      description: form.description || undefined,
      category: form.category,
      target: parseFloat(form.target),
      current: parseFloat(form.current),
      unit: form.unit,
      deadline: form.deadline || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div className="w-full bg-zinc-900 rounded-t-3xl p-6 pb-safe max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">New Goal</h2>
          <button onClick={onClose} className="text-zinc-400 p-1"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input-field" placeholder="Goal title" value={form.title} onChange={e => set('title', e.target.value)} required />
          <input className="input-field" placeholder="Description (optional)" value={form.description} onChange={e => set('description', e.target.value)} />
          <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input className="input-field" placeholder="Target value" type="number" step="0.01" value={form.target} onChange={e => set('target', e.target.value)} required />
            <input className="input-field" placeholder="Unit (km, kg…)" value={form.unit} onChange={e => set('unit', e.target.value)} />
          </div>
          <input className="input-field" placeholder="Current progress" type="number" step="0.01" value={form.current} onChange={e => set('current', e.target.value)} />
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Deadline (optional)</label>
            <input type="date" className="input-field" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full">Create Goal</button>
        </form>
      </div>
    </div>
  );
}

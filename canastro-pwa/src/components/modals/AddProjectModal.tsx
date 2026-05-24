'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Project } from '@/types';

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b'];

interface Props {
  onClose: () => void;
  onAdd: (p: Project) => void;
}

export default function AddProjectModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    name: '', description: '', status: 'active' as Project['status'],
    color: COLORS[0], tags: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    onAdd({
      id: crypto.randomUUID(),
      name: form.name,
      description: form.description || undefined,
      status: form.status,
      progress: 0,
      color: form.color,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div className="w-full bg-zinc-900 rounded-t-3xl p-6 pb-safe" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">New Project</h2>
          <button onClick={onClose} className="text-zinc-400 p-1"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input-field" placeholder="Project name" value={form.name} onChange={e => set('name', e.target.value)} required />
          <input className="input-field" placeholder="Description (optional)" value={form.description} onChange={e => set('description', e.target.value)} />
          <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('color', c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <input className="input-field" placeholder="Tags (comma separated, optional)" value={form.tags} onChange={e => set('tags', e.target.value)} />
          <button type="submit" className="btn-primary w-full">Create Project</button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { TodoItem } from '@/types';

interface Props {
  onClose: () => void;
  onAdd: (t: TodoItem) => void;
}

export default function AddTodoModal({ onClose, onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TodoItem['priority']>('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onAdd({
      id: crypto.randomUUID(),
      title,
      completed: false,
      priority,
      category: category || 'General',
      dueDate: dueDate || undefined,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  const priorityColors: Record<TodoItem['priority'], string> = {
    low: 'bg-zinc-700 text-zinc-300',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div className="w-full bg-zinc-900 rounded-t-3xl p-6 pb-safe" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">New Task</h2>
          <button onClick={onClose} className="text-zinc-400 p-1"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input-field" placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Priority</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${priority === p ? priorityColors[p] + ' border-current' : 'bg-zinc-800 text-zinc-500 border-transparent'}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <input className="input-field" placeholder="Category (optional)" value={category} onChange={e => setCategory(e.target.value)} />
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Due date (optional)</label>
            <input type="date" className="input-field" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full">Add Task</button>
        </form>
      </div>
    </div>
  );
}

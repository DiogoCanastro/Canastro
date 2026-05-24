'use client';

import { useState } from 'react';
import { Plus, Target, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import AddGoalModal from '@/components/modals/AddGoalModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Goal } from '@/types';

const CAT_COLORS: Record<string, string> = {
  fitness: 'text-orange-400 bg-orange-400/10',
  health: 'text-red-400 bg-red-400/10',
  personal: 'text-purple-400 bg-purple-400/10',
  work: 'text-blue-400 bg-blue-400/10',
  other: 'text-zinc-400 bg-zinc-400/10',
};

export default function GoalsPage() {
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [showAdd, setShowAdd] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const addGoal = (g: Goal) => setGoals(prev => [g, ...prev]);
  const removeGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));
  const toggleComplete = (id: string) => setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));

  const updateProgress = (id: string, value: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== id) return g;
      const updated = { ...g, current: Math.min(g.target, Math.max(0, value)) };
      if (updated.current >= updated.target) updated.completed = true;
      return updated;
    }));
  };

  const active = goals.filter(g => !g.completed);
  const completed = goals.filter(g => g.completed);

  return (
    <div>
      <PageHeader
        title="Goals"
        subtitle={`${active.length} active`}
        action={
          <button onClick={() => setShowAdd(true)} className="bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-4 space-y-3">
        {active.length === 0 && completed.length === 0 ? (
          <div className="text-center py-16">
            <Target size={40} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400">No goals yet</p>
            <p className="text-zinc-600 text-sm mt-1">Set a goal to track your progress</p>
          </div>
        ) : (
          <>
            {active.map(goal => {
              const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
              return (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  pct={pct}
                  onComplete={() => toggleComplete(goal.id)}
                  onRemove={() => removeGoal(goal.id)}
                  onUpdateProgress={(v) => updateProgress(goal.id, v)}
                />
              );
            })}

            {completed.length > 0 && (
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="text-sm text-zinc-500 w-full text-left py-2"
              >
                {showCompleted ? '▾' : '▸'} {completed.length} completed goal{completed.length > 1 ? 's' : ''}
              </button>
            )}

            {showCompleted && completed.map(goal => (
              <div key={goal.id} className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800 opacity-60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <p className="text-sm font-medium text-white line-through">{goal.title}</p>
                  <button onClick={() => removeGoal(goal.id)} className="ml-auto text-zinc-600 text-xs p-1">✕</button>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{goal.current}/{goal.target} {goal.unit}</p>
              </div>
            ))}
          </>
        )}
      </div>

      {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} onAdd={addGoal} />}
    </div>
  );
}

function GoalCard({
  goal, pct, onComplete, onRemove, onUpdateProgress
}: {
  goal: Goal; pct: number;
  onComplete: () => void; onRemove: () => void;
  onUpdateProgress: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(goal.current));
  const catClass = CAT_COLORS[goal.category] || CAT_COLORS.other;
  const barColor = pct >= 100 ? '#22c55e' : pct >= 70 ? '#f97316' : '#3b82f6';

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${catClass}`}>
              {goal.category}
            </span>
          </div>
          <p className="font-semibold text-white">{goal.title}</p>
          {goal.description && <p className="text-xs text-zinc-400 mt-0.5">{goal.description}</p>}
        </div>
        <div className="flex gap-1 ml-2">
          <button onClick={onComplete} className="text-zinc-500 p-1 text-sm">✓</button>
          <button onClick={onRemove} className="text-zinc-700 text-xs p-1">✕</button>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-zinc-400 mb-1">
          <span>{goal.current} / {goal.target} {goal.unit}</span>
          <span className="font-medium" style={{ color: barColor }}>{pct}%</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <input
              type="number"
              className="input-field flex-1 py-2 text-sm"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              autoFocus
            />
            <button onClick={() => { onUpdateProgress(parseFloat(inputVal) || 0); setEditing(false); }} className="btn-primary px-3 py-2 text-xs">Save</button>
            <button onClick={() => setEditing(false)} className="btn-secondary px-3 py-2 text-xs">Cancel</button>
          </>
        ) : (
          <button onClick={() => setEditing(true)} className="text-xs text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-full">
            Update progress
          </button>
        )}
        {goal.deadline && (
          <p className="text-xs text-zinc-500 ml-auto">
            Due {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Plus, CheckSquare, Square } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import AddTodoModal from '@/components/modals/AddTodoModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { TodoItem } from '@/types';

const PRIORITY_STYLES: Record<TodoItem['priority'], string> = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-zinc-700 text-zinc-400',
};

export default function TodosPage() {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('todos', []);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending');

  const addTodo = (t: TodoItem) => setTodos(prev => [t, ...prev]);
  const toggle = (id: string) => setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const remove = (id: string) => setTodos(prev => prev.filter(t => t.id !== id));
  const clearCompleted = () => setTodos(prev => prev.filter(t => !t.completed));

  const pending = todos.filter(t => !t.completed);
  const done = todos.filter(t => t.completed);

  const byPriority = (a: TodoItem, b: TodoItem) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  };

  const displayed = filter === 'pending' ? [...pending].sort(byPriority)
    : filter === 'done' ? done
    : [...todos].sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0) || byPriority(a, b));

  // Group by category
  const categories = Array.from(new Set(displayed.map(t => t.category)));

  return (
    <div>
      <PageHeader
        title="To-Do"
        subtitle={`${pending.length} pending`}
        action={
          <button onClick={() => setShowAdd(true)} className="bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-4 space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['pending', 'all', 'done'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
            >
              {f === 'pending' ? `Pending (${pending.length})` : f === 'done' ? `Done (${done.length})` : 'All'}
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <div className="text-center py-16">
            <CheckSquare size={40} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400">{filter === 'pending' ? 'All done! 🎉' : 'No tasks yet'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map(cat => {
              const catTodos = displayed.filter(t => t.category === cat);
              return (
                <div key={cat}>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-1">{cat}</p>
                  <div className="bg-zinc-900 rounded-2xl border border-zinc-800 divide-y divide-zinc-800">
                    {catTodos.map(todo => (
                      <div key={todo.id} className="flex items-center gap-3 px-4 py-3">
                        <button onClick={() => toggle(todo.id)} className="flex-shrink-0">
                          {todo.completed
                            ? <CheckSquare size={20} className="text-emerald-400" />
                            : <Square size={20} className="text-zinc-600" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${todo.completed ? 'line-through text-zinc-500' : 'text-white'}`}>
                            {todo.title}
                          </p>
                          {todo.dueDate && !todo.completed && (
                            <p className="text-[10px] text-zinc-500">
                              Due {new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[todo.priority]}`}>
                          {todo.priority}
                        </span>
                        <button onClick={() => remove(todo.id)} className="text-zinc-700 text-xs p-1 ml-1">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {done.length > 0 && filter !== 'done' && (
          <button onClick={clearCompleted} className="text-xs text-zinc-500 w-full text-center py-2">
            Clear {done.length} completed task{done.length > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {showAdd && <AddTodoModal onClose={() => setShowAdd(false)} onAdd={addTodo} />}
    </div>
  );
}

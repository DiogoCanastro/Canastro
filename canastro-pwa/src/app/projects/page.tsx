'use client';

import { useState } from 'react';
import { Plus, FolderOpen, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import AddProjectModal from '@/components/modals/AddProjectModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Project, ProjectTask } from '@/types';

const STATUS_STYLES: Record<Project['status'], string> = {
  planning: 'bg-zinc-700 text-zinc-300',
  active: 'bg-blue-500/20 text-blue-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<Record<string, string>>({});

  const addProject = (p: Project) => setProjects(prev => [p, ...prev]);
  const removeProject = (id: string) => setProjects(prev => prev.filter(p => p.id !== id));

  const updateProject = (id: string, updater: (p: Project) => Project) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...updater(p), updatedAt: new Date().toISOString() } : p));
  };

  const updateStatus = (id: string, status: Project['status']) => {
    updateProject(id, p => ({ ...p, status, progress: status === 'completed' ? 100 : p.progress }));
  };

  const addTask = (projectId: string) => {
    const title = newTask[projectId]?.trim();
    if (!title) return;
    const task: ProjectTask = { id: crypto.randomUUID(), title, completed: false };
    updateProject(projectId, p => {
      const tasks = [...p.tasks, task];
      const progress = tasks.length > 0 ? Math.round(tasks.filter(t => t.completed).length / tasks.length * 100) : 0;
      return { ...p, tasks, progress };
    });
    setNewTask(prev => ({ ...prev, [projectId]: '' }));
  };

  const toggleTask = (projectId: string, taskId: string) => {
    updateProject(projectId, p => {
      const tasks = p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      const progress = tasks.length > 0 ? Math.round(tasks.filter(t => t.completed).length / tasks.length * 100) : 0;
      return { ...p, tasks, progress };
    });
  };

  const removeTask = (projectId: string, taskId: string) => {
    updateProject(projectId, p => {
      const tasks = p.tasks.filter(t => t.id !== taskId);
      const progress = tasks.length > 0 ? Math.round(tasks.filter(t => t.completed).length / tasks.length * 100) : p.progress;
      return { ...p, tasks, progress };
    });
  };

  const sorted = [...projects].sort((a, b) => {
    const order = { active: 0, planning: 1, paused: 2, completed: 3 };
    return order[a.status] - order[b.status];
  });

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle={`${projects.filter(p => p.status === 'active').length} active`}
        action={
          <button onClick={() => setShowAdd(true)} className="bg-orange-500 text-white rounded-full w-9 h-9 flex items-center justify-center">
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-4 space-y-3">
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen size={40} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400">No projects yet</p>
            <p className="text-zinc-600 text-sm mt-1">Tap + to create one</p>
          </div>
        ) : (
          sorted.map(project => {
            const isExpanded = expanded === project.id;
            return (
              <div key={project.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                {/* Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{project.name}</p>
                        {project.description && <p className="text-xs text-zinc-400 mt-0.5 truncate">{project.description}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => setExpanded(isExpanded ? null : project.id)} className="text-zinc-500 p-1">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button onClick={() => removeProject(project.id)} className="text-zinc-700 text-xs p-1">✕</button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>{project.tasks.filter(t => t.completed).length}/{project.tasks.length} tasks</span>
                      <span style={{ color: project.color }}>{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${project.progress}%`, backgroundColor: project.color }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[project.status]}`}>
                      {project.status}
                    </span>
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Expanded tasks */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 px-4 py-3 space-y-3">
                    <div className="flex gap-2">
                      <select
                        className="text-xs bg-zinc-800 text-zinc-300 rounded-lg px-2 py-1.5 border-none outline-none"
                        value={project.status}
                        onChange={e => updateStatus(project.id, e.target.value as Project['status'])}
                      >
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {/* Tasks */}
                    {project.tasks.length > 0 && (
                      <div className="space-y-1">
                        {project.tasks.map(task => (
                          <div key={task.id} className="flex items-center gap-2 py-1">
                            <button onClick={() => toggleTask(project.id, task.id)} className="flex-shrink-0">
                              {task.completed
                                ? <CheckSquare size={16} className="text-emerald-400" />
                                : <Square size={16} className="text-zinc-600" />}
                            </button>
                            <p className={`text-sm flex-1 ${task.completed ? 'line-through text-zinc-500' : 'text-white'}`}>
                              {task.title}
                            </p>
                            <button onClick={() => removeTask(project.id, task.id)} className="text-zinc-700 text-xs">✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add task input */}
                    <div className="flex gap-2">
                      <input
                        className="input-field flex-1 py-2 text-sm"
                        placeholder="Add task…"
                        value={newTask[project.id] || ''}
                        onChange={e => setNewTask(prev => ({ ...prev, [project.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addTask(project.id)}
                      />
                      <button onClick={() => addTask(project.id)} className="btn-primary px-3 py-2">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showAdd && <AddProjectModal onClose={() => setShowAdd(false)} onAdd={addProject} />}
    </div>
  );
}

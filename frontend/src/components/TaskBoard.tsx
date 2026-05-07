import { useState } from "react";
import { Check, ChevronRight, ClipboardList, Pencil, Trash2, Trophy, X } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  points: string;
  creator: string;
  is_active: boolean;
}

interface TaskBoardProps {
  tasks: Task[];
  onComplete: (taskId: string) => void;
  isVerifier: boolean;
  isAdmin?: boolean;
  title?: string;
  subtitle?: string;
  onEdit?: (task: Task) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
}

export function TaskBoard({ tasks, onComplete, isVerifier, isAdmin = false, title, subtitle, onEdit, onDelete }: TaskBoardProps) {
  const activeTasks = tasks.filter(t => t.is_active);
  const visibleTasks = isAdmin ? tasks : activeTasks;
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Task | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditData(task);
  };

  const saveEdit = async () => {
    if (!editData || !onEdit) return;

    setBusyTaskId(editData.id);
    try {
      await onEdit(editData);
      setEditingTaskId(null);
      setEditData(null);
    } finally {
      setBusyTaskId(null);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!onDelete || !confirm("Delete this quest permanently?")) return;

    setBusyTaskId(taskId);
    try {
      await onDelete(taskId);
    } finally {
      setBusyTaskId(null);
    }
  };

  if (visibleTasks.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <ClipboardList size={32} className="text-white/20" />
        </div>
        <h3 className="text-lg font-semibold text-white/60">No active tasks</h3>
        <p className="text-white/40 text-sm max-w-xs mx-auto">
          Check back later for new opportunities to earn contribution points.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardList className={isAdmin ? "text-amber-500" : "text-primary"} />
            {title || (isAdmin ? "Quest Management" : "Active Quests")}
          </h3>
          {subtitle && <p className="text-sm text-white/45 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded">
              Admin Controls Enabled
            </span>
          )}
          <span className="text-xs text-white/40 font-mono">{visibleTasks.length} Quest{visibleTasks.length === 1 ? "" : "s"}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {visibleTasks.map((task) => (
          <div key={task.id} className="glass-card flex flex-col justify-between group border-l-4 border-l-primary/40 hover:border-l-primary transition-all">
            {editingTaskId === task.id && editData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="input-field w-full"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  />
                  <select
                    className="input-field w-full"
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Research">Research</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Content">Content Creation</option>
                    <option value="Community">Community</option>
                  </select>
                </div>
                <textarea
                  rows={3}
                  className="input-field w-full resize-none"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                />
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    className="input-field w-28"
                    value={editData.points}
                    onChange={(e) => setEditData({ ...editData, points: e.target.value })}
                  />
                  <label className="flex items-center gap-2 text-sm text-white/60">
                    <input
                      type="checkbox"
                      checked={editData.is_active}
                      onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })}
                    />
                    Active
                  </label>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTaskId(null);
                        setEditData(null);
                      }}
                      className="p-2 text-white/50 hover:text-white transition-colors"
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={busyTaskId === task.id}
                      className="p-2 text-green-400 hover:text-green-300 transition-colors disabled:opacity-40"
                      title="Save"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/20">
                      {task.category}
                    </span>
                    {!task.is_active && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/50 border border-white/10">
                        Inactive
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Trophy size={14} />
                      <span>{task.points}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                      {task.title}
                    </h4>
                    <p className="text-white/60 text-sm line-clamp-2 mt-1">
                      {task.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">
                    By <span className="text-white/60">{task.creator}</span>
                  </div>

                  {isAdmin ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(task)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-blue-400/20 bg-blue-400/10 px-3 py-2 text-xs font-bold text-blue-300 hover:bg-blue-400/20 transition-colors"
                        title="Edit quest"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        disabled={busyTaskId === task.id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-400/20 transition-colors disabled:opacity-40"
                        title="Delete quest"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  ) : !isVerifier && (
                    <button
                      onClick={() => onComplete(task.id)}
                      className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      I've Done This <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

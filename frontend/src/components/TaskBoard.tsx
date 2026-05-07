import { useState } from "react";
import { Check, ChevronRight, ClipboardList, Pencil, Trash2, Trophy, X, ShieldCheck, Info, Sparkles } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  points: string;
  creator: string;
  is_active: boolean;
  rubric?: string[];
  minReputation?: number;
  requiresDoubleCheck?: boolean;
  deadline?: string;
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
  userReputation?: number;
  userSkills?: string[];
}

export function TaskBoard({ tasks, onComplete, isVerifier, isAdmin = false, title, subtitle, onEdit, onDelete, userReputation = 0, userSkills = [] }: TaskBoardProps) {
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
      <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
          <ClipboardList size={40} className="text-white/10" />
        </div>
        <h3 className="text-xl font-black text-white/40 uppercase tracking-widest leading-none mb-2">No Active Quests</h3>
        <p className="text-white/20 text-xs font-bold uppercase tracking-tighter">New opportunities will appear soon</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
            <ClipboardList className={isAdmin ? "text-amber-500" : "text-primary"} size={28} />
            {title || (isAdmin ? "Quest Nexus" : "Protocol Quests")}
          </h3>
          {subtitle && <p className="text-sm font-medium text-white/40 mt-1 uppercase tracking-widest">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
              Management Mode
            </span>
          )}
          <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{visibleTasks.length} Available</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {visibleTasks.map((task) => {
          const isRecommended = userSkills.includes(task.category);
          const meetsReputation = userReputation >= (task.minReputation || 0);

          return (
            <div key={task.id} className={`glass-card flex flex-col justify-between group border border-white/5 hover:border-primary/20 transition-all ${!meetsReputation && !isAdmin ? "opacity-60" : ""}`}>
              {editingTaskId === task.id && editData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="input-field w-full text-xs"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    />
                    <select
                      className="input-field w-full text-xs"
                      value={editData.category}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    >
                      <option value="Coding">Coding</option>
                      <option value="Design">Design</option>
                      <option value="Research">Research</option>
                      <option value="Writing">Writing</option>
                      <option value="Community">Community</option>
                    </select>
                  </div>
                  <input
                    type="datetime-local"
                    className="input-field w-full text-xs"
                    value={editData.deadline ? new Date(Number(editData.deadline)).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setEditData({ ...editData, deadline: new Date(e.target.value).getTime().toString() })}
                  />
                  <textarea
                    rows={3}
                    className="input-field w-full resize-none text-xs"
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      className="input-field w-24 text-xs"
                      value={editData.points}
                      onChange={(e) => setEditData({ ...editData, points: e.target.value })}
                    />
                    <label className="flex items-center gap-2 text-xs text-white/60 font-bold uppercase tracking-widest">
                      <input
                        type="checkbox"
                        checked={editData.is_active}
                        onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })}
                      />
                      Active
                    </label>
                    <div className="ml-auto flex items-center gap-2">
                      <button onClick={() => {setEditingTaskId(null); setEditData(null);}} className="p-2 text-white/20 hover:text-white transition-colors"><X size={16} /></button>
                      <button onClick={saveEdit} disabled={busyTaskId === task.id} className="p-2 text-primary hover:text-accent transition-colors disabled:opacity-40"><Check size={20} /></button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-5">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                          {task.category}
                        </span>
                        {isRecommended && !isAdmin && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                            <Sparkles size={10} /> Recommended
                          </span>
                        )}
                        {task.requiresDoubleCheck && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1">
                            <ShieldCheck size={10} /> Verif x2
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-primary font-black text-lg tracking-tighter">
                        <Trophy size={16} className="text-amber-500" />
                        <span>{task.points}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-white group-hover:text-primary transition-colors leading-tight">
                        {task.title}
                      </h4>
                      <p className="text-white/40 text-sm font-medium line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    {!meetsReputation && !isAdmin && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                        <Info size={14} /> Reputation {task.minReputation}+ Required
                      </div>
                    )}

                    {task.deadline && (
                      <div className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                        Date.now() > Number(task.deadline) ? "text-red-500" : "text-white/40"
                      }`}>
                        {Date.now() > Number(task.deadline) ? (
                          <>Expired on {new Date(Number(task.deadline)).toLocaleString()}</>
                        ) : (
                          <>Deadline: {new Date(Number(task.deadline)).toLocaleString()}</>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">
                      BY <span className="text-white/60">{task.creator}</span>
                    </div>

                    {isAdmin ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(task)}
                          className="p-2 rounded-lg border border-white/5 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          disabled={busyTaskId === task.id}
                          className="p-2 rounded-lg border border-red-500/10 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : !isVerifier && (
                      <button
                        onClick={() => onComplete(task.id)}
                        disabled={!meetsReputation || (!!task.deadline && Date.now() > Number(task.deadline))}
                        className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all ${meetsReputation && (!task.deadline || Date.now() <= Number(task.deadline)) ? "text-primary hover:gap-4 hover:text-accent" : "text-white/10 cursor-not-allowed"}`}
                      >
                        {meetsReputation ? (task.deadline && Date.now() > Number(task.deadline) ? "Expired" : "Accept Quest") : "Locked"} <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

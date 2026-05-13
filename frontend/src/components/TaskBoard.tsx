import { useState, useMemo, useEffect } from "react";
import { 
  Check, 
  ChevronRight, 
  ClipboardList, 
  Pencil, 
  Trash2, 
  Trophy, 
  X, 
  ShieldCheck, 
  Info, 
  Sparkles,
  Search,
  Filter,
  Star,
  StarOff,
  Clock
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  points: string;
  creator: string;
  isActive: boolean;
  rubric?: string[];
  minReputation?: number;
  requiresDoubleCheck?: boolean;
  deadline?: string;
  isCompetition?: boolean;
  votingDeadline?: string;
  topSubmission?: string | null;
  maxVotes?: string;
  winnerClaimed?: boolean;
}

interface TaskBoardProps {
  tasks: Task[];
  submissions?: any[];
  onComplete: (taskId: string) => void;
  isVerifier: boolean;
  isAdmin?: boolean;
  title?: string;
  subtitle?: string;
  onEdit?: (task: Task) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
  onVote?: (taskId: string, submissionId: string) => Promise<void>;
  onClaimWinner?: (taskId: string, submissionId: string) => Promise<void>;
  onCommunityFinalize?: (submissionId: string) => Promise<void>;
  onClaimCuratorReward?: (submissionId: string) => Promise<void>;
  userReputation?: number;
  userSkills?: string[];
  onViewProfile?: (studentId: string) => void;
}

export function TaskBoard({ 
  tasks, 
  submissions = [],
  onComplete, 
  isVerifier, 
  isAdmin = false, 
  title, 
  subtitle, 
  onEdit, 
  onDelete, 
  onVote,
  onClaimWinner,
  onCommunityFinalize,
  onClaimCuratorReward,
  userReputation = 0, 
  userSkills = [],
  onViewProfile
}: TaskBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Task | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [viewingSubmissionsTaskId, setViewingSubmissionsTaskId] = useState<string | null>(null);

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("itc_watchlist");
    if (saved) setWatchlist(JSON.parse(saved));
  }, []);

  const toggleWatchlist = (taskId: string) => {
    const newWatchlist = watchlist.includes(taskId)
      ? watchlist.filter(id => id !== taskId)
      : [...watchlist, taskId];
    setWatchlist(newWatchlist);
    localStorage.setItem("itc_watchlist", JSON.stringify(newWatchlist));
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || t.category === activeCategory;
      const matchesWatchlist = !showWatchlistOnly || watchlist.includes(t.id);
      const isVisible = isAdmin || t.isActive;
      
      return matchesSearch && matchesCategory && matchesWatchlist && isVisible;
    });
  }, [tasks, searchQuery, activeCategory, showWatchlistOnly, watchlist, isAdmin]);

  const categories = ["All", "Coding", "Design", "Research", "Writing", "Community"];

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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-3xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
              <ClipboardList className={isAdmin ? "text-amber-500" : "text-primary"} size={32} />
              {title || (isAdmin ? "Quest Nexus" : "Protocol Quests")}
            </h3>
            {subtitle && <p className="text-sm font-medium text-white/40 mt-1 uppercase tracking-widest leading-none">{subtitle}</p>}
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
                Management Mode
              </span>
            )}
            <button 
              onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
              className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                showWatchlistOnly 
                ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-lg shadow-amber-500/10" 
                : "bg-white/5 border-white/5 text-white/40 hover:text-white"
              }`}
            >
              <Star size={14} fill={showWatchlistOnly ? "currentColor" : "none"} /> 
              Watchlist {watchlist.length > 0 && `(${watchlist.length})`}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              className="input-field w-full pl-12 h-12 text-sm"
              placeholder="Search quests by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                  activeCategory === cat 
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-24 text-center border-dashed border-white/5 bg-transparent">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/5">
            <Filter size={40} className="text-white/10" />
          </div>
          <h3 className="text-2xl font-black text-white/40 uppercase tracking-widest leading-none mb-3">No Quests Found</h3>
          <p className="text-white/20 text-xs font-bold uppercase tracking-tighter">Try adjusting your filters or search terms</p>
          {showWatchlistOnly && (
            <button 
              onClick={() => setShowWatchlistOnly(false)}
              className="mt-6 text-primary text-[10px] font-black uppercase tracking-widest hover:text-accent transition-colors underline underline-offset-4"
            >
              Show all available quests
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredTasks.map((task) => {
            const isRecommended = userSkills.includes(task.category);
            const meetsReputation = userReputation >= (task.minReputation || 0);
            const isWatched = watchlist.includes(task.id);

            return (
              <div key={task.id} className={`glass-card flex flex-col justify-between group border border-white/5 hover:border-primary/20 transition-all ${!meetsReputation && !isAdmin ? "opacity-60 grayscale-[0.5]" : ""}`}>
                {editingTaskId === task.id && editData ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">Quest Title</label>
                        <input
                          className="input-field w-full text-xs"
                          value={editData.title}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">Category</label>
                        <select
                          className="input-field w-full text-xs"
                          value={editData.category}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        >
                          {["Coding", "Design", "Research", "Writing", "Community"].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">Quest Active</label>
                          <p className="text-[8px] text-white/40 font-bold uppercase">Public visibility</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditData({ ...editData, isActive: !editData.isActive })}
                          className={`w-8 h-4 rounded-full p-1 transition-all ${editData.isActive ? "bg-primary" : "bg-white/10"}`}
                        >
                          <div className={`w-2 h-2 bg-white rounded-full transition-transform ${editData.isActive ? "translate-x-4" : "translate-x-0"}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">Competition</label>
                          <p className="text-[8px] text-white/40 font-bold uppercase">Vote-based winner</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditData({ ...editData, isCompetition: !editData.isCompetition })}
                          className={`w-8 h-4 rounded-full p-1 transition-all ${editData.isCompetition ? "bg-purple-500" : "bg-white/10"}`}
                        >
                          <div className={`w-2 h-2 bg-white rounded-full transition-transform ${editData.isCompetition ? "translate-x-4" : "translate-x-0"}`} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">Deadline</label>
                          <div className="flex gap-1">
                            <button type="button" onClick={() => {
                              const d = new Date();
                              d.setHours(d.getHours() + 1);
                              setEditData({ ...editData, deadline: d.getTime().toString() });
                            }} className="text-[7px] font-bold text-primary/60 hover:text-primary transition-colors">1h</button>
                            <button type="button" onClick={() => {
                              const d = new Date();
                              d.setHours(d.getHours() + 24);
                              setEditData({ ...editData, deadline: d.getTime().toString() });
                            }} className="text-[7px] font-bold text-primary/60 hover:text-primary transition-colors">24h</button>
                          </div>
                        </div>
                        <input
                          type="datetime-local"
                          className="input-field w-full text-xs"
                          value={(() => {
                            const d = Number(editData.deadline);
                            if (d > 0 && !isNaN(d)) {
                              const date = new Date(d);
                              const offset = date.getTimezoneOffset() * 60000;
                              return new Date(date.getTime() - offset).toISOString().slice(0, 16);
                            }
                            return "";
                          })()}
                          onChange={(e) => setEditData({ ...editData, deadline: new Date(e.target.value).getTime().toString() })}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">Voting Deadline</label>
                          <div className="flex gap-1">
                            <button type="button" onClick={() => {
                              const d = new Date(Number(editData.deadline) || Date.now());
                              d.setHours(d.getHours() + 1);
                              setEditData({ ...editData, votingDeadline: d.getTime().toString() });
                            }} className="text-[7px] font-bold text-purple-500/60 hover:text-purple-500 transition-colors">+1h</button>
                            <button type="button" onClick={() => {
                              const d = new Date(Number(editData.deadline) || Date.now());
                              d.setHours(d.getHours() + 24);
                              setEditData({ ...editData, votingDeadline: d.getTime().toString() });
                            }} className="text-[7px] font-bold text-purple-500/60 hover:text-purple-500 transition-colors">+24h</button>
                          </div>
                        </div>
                        <input
                          type="datetime-local"
                          className="input-field w-full text-xs"
                          value={(() => {
                            const vd = Number(editData.votingDeadline);
                            if (vd > 0 && !isNaN(vd)) {
                              const date = new Date(vd);
                              const offset = date.getTimezoneOffset() * 60000;
                              return new Date(date.getTime() - offset).toISOString().slice(0, 16);
                            }
                            return "";
                          })()}
                          onChange={(e) => setEditData({ ...editData, votingDeadline: new Date(e.target.value).getTime().toString() })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">Task Details</label>
                      <textarea
                        rows={3}
                        className="input-field w-full resize-none text-xs"
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">Reward (PTS)</label>
                        <input
                          type="number"
                          className="input-field w-24 text-xs"
                          value={editData.points}
                          onChange={(e) => setEditData({ ...editData, points: e.target.value })}
                        />
                      </div>
                      <label className="flex items-center gap-2 text-[10px] text-white/60 font-black uppercase tracking-widest mt-4 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                          checked={editData.isActive}
                          onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                        />
                        Active Status
                      </label>
                      <div className="ml-auto flex items-center gap-2 mt-4">
                        <button onClick={() => {setEditingTaskId(null); setEditData(null);}} className="p-2 text-white/20 hover:text-white transition-colors"><X size={20} /></button>
                        <button onClick={saveEdit} disabled={busyTaskId === task.id} className="p-2.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all disabled:opacity-40"><Check size={20} /></button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-5">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                            {task.category}
                          </span>
                          {isRecommended && !isAdmin && (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1.5">
                              <Sparkles size={12} /> Recommended
                            </span>
                          )}
                          {task.requiresDoubleCheck && (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1.5">
                              <ShieldCheck size={12} /> Verif x2
                            </span>
                          )}
                          {task.isCompetition && (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center gap-1.5">
                              <Trophy size={12} className="text-purple-500" /> Competition
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleWatchlist(task.id)}
                            className={`p-2 rounded-lg border transition-all ${
                              isWatched 
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                              : "bg-white/5 border-white/5 text-white/20 hover:text-white/40"
                            }`}
                          >
                            {isWatched ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                          </button>
                          <div className="flex items-center gap-1.5 text-primary font-black text-2xl tracking-tighter">
                            <Trophy size={18} className="text-amber-500" />
                            <span>{task.points}</span>
                          </div>
                        </div>
                      </div>
  
                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-white group-hover:text-primary transition-colors leading-tight tracking-tight">
                          {task.title}
                        </h4>
                        <p className="text-white/40 text-sm font-medium line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>
  
                      {!meetsReputation && !isAdmin && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest shadow-inner shadow-red-500/5">
                          <Info size={14} /> Reputation {task.minReputation}+ Required
                        </div>
                      )}
  
                      {task.isCompetition && (
                        <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase text-white/40">Current Phase</span>
                            {(() => {
                              const now = Date.now();
                              const d = Number(task.deadline);
                              const vd = Number(task.votingDeadline);
                              if (now < d) return <span className="text-[9px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded">Submission</span>;
                              if (now < vd) return <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded animate-pulse">Voting Live</span>;
                              return <span className="text-[9px] font-black uppercase text-white/20 bg-white/5 px-2 py-0.5 rounded">Closed</span>;
                            })()}
                          </div>
                          
                          <div className="space-y-1">
                            <div className={`text-[9px] font-black uppercase tracking-tight flex items-center gap-2 ${
                              Date.now() > Number(task.deadline) ? "text-white/20" : "text-white/60"
                            }`}>
                              <Clock size={10} />
                              {(() => {
                                const d = Number(task.deadline);
                                if (isNaN(d) || d === 0) return "No Deadline";
                                return `Deadline: ${new Date(d).toLocaleString()}`;
                              })()}
                            </div>
                            
                            <div className={`text-[9px] font-black uppercase tracking-tight flex items-center gap-2 ${
                              Date.now() > Number(task.votingDeadline) ? "text-white/20" : "text-amber-500"
                            }`}>
                              <Star size={10} />
                              {(() => {
                                const vd = Number(task.votingDeadline);
                                if (isNaN(vd) || vd === 0) return "Voting: Not Set";
                                return `Voting Ends: ${new Date(vd).toLocaleString()}`;
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
  
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">
                        BY <span className="text-white/60">{task.creator}</span>
                      </div>
  
                      <div className="flex items-center gap-3 shrink-0">
                        {isAdmin && (
                          <div className="flex items-center gap-2 pr-3 border-r border-white/5">
                            <button
                              type="button"
                              onClick={() => startEdit(task)}
                              className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all shadow-sm"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              disabled={busyTaskId === task.id}
                              className="p-2.5 rounded-xl border border-red-500/10 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-20 shadow-sm"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}

                        <div className="flex flex-col items-end gap-2">
                            {task.isCompetition && Date.now() > Number(task.deadline) && Date.now() < Number(task.votingDeadline) && (
                              <button
                                onClick={() => {
                                  if (userReputation === 0) {
                                    alert("Bạn cần nhấn 'Create Profile' ở phía trên trang web để tạo hồ sơ trước khi tham gia bình chọn (kể cả Admin)!");
                                    return;
                                  }
                                  setViewingSubmissionsTaskId(task.id);
                                }}
                                className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                              >
                                <Trophy size={14} /> Vote for Participants
                              </button>
                            )}
                            
                            {task.isCompetition && Date.now() > Number(task.votingDeadline) && task.topSubmission && !task.winnerClaimed && (
                              <button
                                onClick={() => onClaimWinner?.(task.id, task.topSubmission!)}
                                className="px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 flex items-center gap-2"
                              >
                                <Trophy size={14} /> Claim Winner Reward
                              </button>
                            )}

                            {!isAdmin && (
                              <button
                                onClick={() => onComplete(task.id)}
                                disabled={!meetsReputation || (!!task.deadline && Date.now() > Number(task.deadline))}
                                className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all p-2 -mr-2 rounded-lg ${meetsReputation && (!task.deadline || Date.now() <= Number(task.deadline)) ? "text-primary hover:gap-4 hover:text-accent hover:bg-primary/5" : "text-white/10 cursor-not-allowed grayscale"}`}
                              >
                                {meetsReputation ? (task.deadline && Date.now() > Number(task.deadline) ? "Expired" : "Accept Quest") : "Locked"} <ChevronRight size={18} />
                              </button>
                            )}
                          </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Viewing Submissions Modal */}
      {viewingSubmissionsTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-2xl h-[95vh] sm:h-[80vh] overflow-hidden flex flex-col border border-white/10 shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  <Trophy className="text-amber-500" size={24} />
                  Voting Phase
                </h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Review products and vote for your favorite one</p>
              </div>
              <button onClick={() => setViewingSubmissionsTaskId(null)} className="p-2 text-white/20 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {submissions.filter(s => s.taskId === viewingSubmissionsTaskId).length === 0 ? (
                <div className="text-center py-12 text-white/20 uppercase font-black tracking-widest text-sm">No submissions found for this competition</div>
              ) : (
                submissions
                  .filter(s => s.taskId === viewingSubmissionsTaskId)
                  .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
                  .map((sub, idx) => (
                    <div key={sub.id} className="glass-card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/5 hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/20 font-black">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onViewProfile?.(sub.studentId)}
                              className="text-sm font-bold text-primary hover:text-accent font-mono cursor-pointer border-none bg-transparent p-0"
                            >
                              {sub.studentAddress.slice(0, 10)}...
                            </button>
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-tighter">
                              {sub.voteCount || 0} Votes
                            </span>
                          </div>
                          <a href={sub.proofUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline font-bold uppercase tracking-widest">View Product Artifact</a>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 justify-end">
                        {sub.status === 0 && sub.voteCount >= 5 && (
                          <button
                            onClick={() => onCommunityFinalize?.(sub.id)}
                            className="px-4 py-2 bg-green-500/20 text-green-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-500/20 hover:bg-green-500/30 transition-all"
                          >
                            Finalize
                          </button>
                        )}
                        
                        {sub.status === 1 && (
                          <button
                            onClick={() => onClaimCuratorReward?.(sub.id)}
                            className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all"
                          >
                            Claim Reward
                          </button>
                        )}

                        <button
                          onClick={() => {
                            onVote?.(viewingSubmissionsTaskId, sub.id);
                          }}
                          className="btn-primary py-2 px-6 text-[10px] shadow-none"
                          disabled={sub.status !== 0}
                        >
                          Vote
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

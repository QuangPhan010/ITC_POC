import { useState } from "react";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  Pencil,
  MessageSquare,
  History
} from "lucide-react";

interface Submission {
  id: string;
  taskId: string;
  studentId: string;
  studentAddress: string;
  proofUrl: string;
  status: number;
  comment: string;
  taskTitle: string;
  submittedAt: number;
}

interface MyWorkspaceProps {
  submissions: Submission[];
  onUpdateSubmission: (submissionId: string, newProofUrl: string) => Promise<void>;
  onDisputeSubmission: (submissionId: string, reason: string) => Promise<void>;
}

export function MyWorkspace({ submissions, onUpdateSubmission, onDisputeSubmission }: MyWorkspaceProps) {
  const [activeFilter, setActiveFilter] = useState<number | "all">("all");
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [disputingSubId, setDisputingSubId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const filteredSubmissions = submissions.filter(s => 
    activeFilter === "all" ? true : s.status === activeFilter
  ).sort((a, b) => b.submittedAt - a.submittedAt);

  const getStatusInfo = (status: number) => {
    switch(status) {
      case 0: return { label: "Pending", color: "text-amber-400", bg: "bg-amber-400/10", icon: <Clock size={14} /> };
      case 1: return { label: "Approved", color: "text-green-400", bg: "bg-green-400/10", icon: <CheckCircle2 size={14} /> };
      case 2: return { label: "Rejected", color: "text-red-400", bg: "bg-red-400/10", icon: <XCircle size={14} /> };
      case 3: return { label: "Disputed", color: "text-purple-400", bg: "bg-purple-400/10", icon: <AlertTriangle size={14} /> };
      default: return { label: "Unknown", color: "text-white/40", bg: "bg-white/5", icon: <ClipboardList size={14} /> };
    }
  };

  const handleUpdate = async () => {
    if (!editingSubId || !editUrl) return;
    setIsBusy(true);
    try {
      await onUpdateSubmission(editingSubId, editUrl);
      setEditingSubId(null);
      setEditUrl("");
    } finally {
      setIsBusy(false);
    }
  };

  const handleDispute = async () => {
    if (!disputingSubId || !disputeReason) return;
    setIsBusy(true);
    try {
      await onDisputeSubmission(disputingSubId, disputeReason);
      setDisputingSubId(null);
      setDisputeReason("");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
            <ClipboardList className="text-primary" size={28} />
            My Workspace
          </h3>
          <p className="text-sm font-medium text-white/40 mt-1 uppercase tracking-widest">Track and manage your quest contributions</p>
        </div>
        
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
          {["all", 0, 1, 2, 3].map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status as any)}
              className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                activeFilter === status ? "bg-primary text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              {status === "all" ? "All" : getStatusInfo(status as number).label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredSubmissions.length === 0 ? (
          <div className="glass-card py-20 text-center opacity-40">
            <History size={48} className="mx-auto mb-4 text-white/20" />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">No submissions found in this category</p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => {
            const status = getStatusInfo(sub.status);
            return (
              <div key={sub.id} className="glass-card border border-white/5 hover:border-white/10 transition-all p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${status.bg} ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                      <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                        Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-black text-white leading-tight">{sub.taskTitle}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <a 
                          href={sub.proofUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs text-primary hover:text-accent flex items-center gap-1 font-bold uppercase tracking-widest"
                        >
                          View Proof <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {sub.status === 0 && (
                      <button 
                        onClick={() => {setEditingSubId(sub.id); setEditUrl(sub.proofUrl);}}
                        className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/40 hover:text-primary transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                    )}
                    
                    {sub.status === 2 && (
                      <button 
                        onClick={() => setDisputingSubId(sub.id)}
                        className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                      >
                        <AlertTriangle size={14} /> Dispute
                      </button>
                    )}
                  </div>
                </div>

                {sub.comment && (
                  <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                      <MessageSquare size={12} /> Verifier Feedback
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed italic">"{sub.comment}"</p>
                  </div>
                )}

                {/* Inline Editing/Disputing Forms */}
                {editingSubId === sub.id && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">New Proof URL</label>
                      <input 
                        className="input-field w-full text-sm" 
                        value={editUrl} 
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingSubId(null)} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white">Cancel</button>
                      <button onClick={handleUpdate} disabled={isBusy} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50">Save Changes</button>
                    </div>
                  </div>
                )}

                {disputingSubId === sub.id && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Reason for Dispute</label>
                      <textarea 
                        className="input-field w-full text-sm resize-none" 
                        rows={3}
                        value={disputeReason} 
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Why do you believe this rejection was unfair?"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setDisputingSubId(null)} className="px-4 py-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white">Cancel</button>
                      <button onClick={handleDispute} disabled={isBusy} className="px-4 py-2 bg-purple-500 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 disabled:opacity-50">Submit Dispute</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

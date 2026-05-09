import { Check, X, ExternalLink, Loader2, Clock, ShieldCheck, ClipboardCheck, MessageSquarePlus } from "lucide-react";
import { useState } from "react";

interface Submission {
  id: string;
  taskId: string;
  studentId: string;
  studentAddress: string;
  proofUrl: string;
  status: number;
  comment: string;
  taskTitle?: string;
  approvers?: string[];
  requiresDoubleCheck?: boolean;
  rubric?: string[];
  submittedAt?: number;
  voteCount?: number;
}

interface SubmissionListProps {
  submissions: Submission[];
  onApprove: (submission: Submission) => Promise<void>;
  onReject: (submissionId: string, reason: string) => Promise<void>;
  onRequestEvidence?: (submissionId: string, message: string) => Promise<void>;
  onViewProfile?: (studentId: string) => void;
  onCommunityFinalize?: (submissionId: string) => Promise<void>;
}

export function SubmissionList({ submissions, onApprove, onReject, onRequestEvidence, onViewProfile, onCommunityFinalize }: SubmissionListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Sort by urgency (requires double check first, then by date)
  const pendingSubmissions = submissions
    .filter(s => s.status === 0)
    .sort((a, b) => {
      if (a.requiresDoubleCheck && !b.requiresDoubleCheck) return -1;
      if (!a.requiresDoubleCheck && b.requiresDoubleCheck) return 1;
      return (a.submittedAt || 0) - (b.submittedAt || 0);
    });

  if (pendingSubmissions.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center py-16 text-center opacity-60">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Clock size={32} className="text-white/10" />
        </div>
        <h3 className="text-xl font-bold text-white/40 uppercase tracking-widest">Inbox Zero</h3>
        <p className="text-xs text-white/20 mt-1 uppercase font-bold tracking-tighter">All submissions have been reviewed</p>
      </div>
    );
  }

  const handleAction = async (id: string, action: () => Promise<void>) => {
    setLoadingId(id);
    try {
      await action();
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/10">
            <ClipboardCheck className="text-primary" size={20} />
          </div>
          Pending Reviews
          <span className="ml-2 px-2 py-0.5 rounded-md bg-white/5 text-xs text-white/40 font-mono">
            {pendingSubmissions.length}
          </span>
        </h3>
      </div>

      <div className="grid gap-4">
        {pendingSubmissions.map((sub) => (
          <div key={sub.id} className="glass-card group hover:bg-white/[0.03] transition-all p-0 overflow-hidden border border-white/5">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    {sub.requiresDoubleCheck && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[9px] font-black uppercase tracking-tighter">
                        <ShieldCheck size={10} /> Double Check Required
                      </div>
                    )}
                    <h4 className="text-xl font-black text-white tracking-tight">{sub.taskTitle || "Unknown Task"}</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Student Address</p>
                      <button 
                        onClick={() => onViewProfile?.(sub.studentId)}
                        className="text-sm text-primary hover:text-accent font-mono truncate bg-transparent border-none p-0 cursor-pointer text-left"
                      >
                        {sub.studentAddress}
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Submitted At</p>
                      <p className="text-sm text-white/60 font-medium">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "Unknown"}
                      </p>
                    </div>
                  </div>

                  <a 
                    href={sub.proofUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-accent font-bold text-sm underline-offset-8 decoration-primary/20 hover:decoration-accent transition-all decoration-2"
                  >
                    Launch Proof Artifact <ExternalLink size={14} />
                  </a>

                  {sub.rubric && sub.rubric.length > 0 && (
                    <div className="pt-4 space-y-3">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Verification Rubric</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {sub.rubric.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-white/70 bg-white/5 p-2 rounded-lg border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:w-64 flex flex-col gap-2 shrink-0 self-start">
                  <div className="mb-2">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1 text-right">Approval Status</p>
                    <div className="flex justify-end gap-1">
                      {[...Array(sub.requiresDoubleCheck ? 2 : 1)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-6 h-1.5 rounded-full ${
                            (sub.approvers?.length || 0) > i ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {sub.status === 0 && (sub.voteCount || 0) >= 5 && (
                    <button
                      disabled={!!loadingId}
                      onClick={() => handleAction(sub.id, () => onCommunityFinalize!(sub.id))}
                      className="w-full bg-green-500/20 text-green-500 font-black py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-green-500/30 transition-all border border-green-500/20 mb-2"
                    >
                      {loadingId === sub.id ? <Loader2 size={18} className="animate-spin" /> : <ClipboardCheck size={18} />}
                      Community Finalize ({sub.voteCount} Votes)
                    </button>
                  )}

                  <button
                    disabled={!!loadingId}
                    onClick={() => handleAction(sub.id, () => onApprove(sub))}
                    className="w-full bg-primary text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-accent transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {loadingId === sub.id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    {sub.requiresDoubleCheck && (sub.approvers?.length || 0) < 1 ? "Partial Approve" : "Approve & Reward"}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={!!loadingId}
                      onClick={() => {
                        const message = window.prompt("Ask student for more information:");
                        if (message && onRequestEvidence) handleAction(sub.id, () => onRequestEvidence(sub.id, message));
                      }}
                      className="bg-white/5 text-white/60 font-bold text-xs py-2 rounded-lg border border-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <MessageSquarePlus size={14} /> Query
                    </button>
                    <button
                      disabled={!!loadingId}
                      onClick={() => {
                        const reason = window.prompt("Reason for rejection:");
                        if (reason !== null) handleAction(sub.id, () => onReject(sub.id, reason));
                      }}
                      className="bg-red-500/10 text-red-500 font-bold text-xs py-2 rounded-lg border border-red-500/10 hover:bg-red-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

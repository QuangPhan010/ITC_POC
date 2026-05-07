import { Check, X, ExternalLink, Loader2, Clock } from "lucide-react";

interface Submission {
  id: string;
  taskId: string;
  studentId: string;
  studentAddress: string;
  proofUrl: string;
  status: number;
  comment: string;
  taskTitle?: string;
}

interface SubmissionListProps {
  submissions: Submission[];
  onApprove: (submission: Submission) => Promise<void>;
  onReject: (submissionId: string, reason: string) => Promise<void>;
}

export function SubmissionList({ submissions, onApprove, onReject }: SubmissionListProps) {
  const pendingSubmissions = submissions.filter(s => s.status === 0);

  if (pendingSubmissions.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center py-12 text-center opacity-60">
        <Clock size={40} className="text-white/20 mb-4" />
        <h3 className="text-lg font-bold text-white/40">No Pending Submissions</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
        <div className="p-2 bg-amber-500/10 rounded-lg">
          <Clock className="text-amber-500" size={18} />
        </div>
        Pending Reviews
      </h3>

      <div className="grid gap-4">
        {pendingSubmissions.map((sub) => (
          <div key={sub.id} className="glass-card border border-white/5 hover:border-white/10 transition-all p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/10">
                    Submission
                  </span>
                  <h4 className="text-lg font-bold text-white">{sub.taskTitle || "Unknown Task"}</h4>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-xs text-white/40">
                    Student: <span className="text-white/60 font-mono">{sub.studentAddress}</span>
                  </p>
                  <a 
                    href={sub.proofUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-accent text-sm flex items-center gap-1.5 underline underline-offset-4 decoration-primary/20 hover:decoration-accent transition-all w-fit"
                  >
                    View Proof Evidence <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const reason = window.prompt("Reason for rejection:");
                    if (reason !== null) onReject(sub.id, reason);
                  }}
                  className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-sm font-bold hover:bg-red-500/20 border border-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <X size={16} /> Reject
                </button>
                <button
                  onClick={() => onApprove(sub)}
                  className="flex-1 md:flex-none px-6 py-2 rounded-xl bg-green-500 text-white text-sm font-black hover:shadow-lg hover:shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Approve & Award
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import { AlertTriangle, Loader2, X, ShieldAlert } from "lucide-react";

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (reason: string) => Promise<void>;
  targetName: string;
}

export function ReportUserModal({ isOpen, onClose, onReport, targetName }: ReportUserModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onReport(reason);
      onClose();
      setReason("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="glass-card w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in duration-300 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)] p-0">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-red-500/5">
          <h3 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
            <ShieldAlert className="text-red-500" />
            Report Misconduct
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-white/60">
              You are reporting <span className="text-white font-bold">{targetName}</span> for suspicious or inappropriate behavior. This report will be recorded on-chain for administrative review.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Reason for Report</label>
            <textarea
              required
              rows={4}
              className="input-field w-full resize-none py-3"
              placeholder="Please describe the suspicious behavior in detail..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <p className="text-[11px] text-red-200/60 leading-relaxed font-medium">
              Abuse of the reporting system may lead to a reduction in your own reputation points. Please ensure your report is accurate and honest.
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !reason.trim()}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed group border-none cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <ShieldAlert size={18} className="group-hover:animate-pulse" />
                Submit Formal Report
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

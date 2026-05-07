import { useState } from "react";
import { X, Send, Loader2, Link as LinkIcon } from "lucide-react";

interface SubmitTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: { id: string; title: string } | null;
  onSubmit: (proofUrl: string) => Promise<void>;
}

export function SubmitTaskModal({ isOpen, onClose, task, onSubmit }: SubmitTaskModalProps) {
  const [proofUrl, setProofUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(proofUrl);
      setProofUrl("");
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-md p-8 relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/20 hover:text-white/60 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-8">
          <h3 className="text-2xl font-black text-white mb-2">Submit Evidence</h3>
          <p className="text-white/40 text-sm">
            Provide a link to your work for <span className="text-primary font-bold">{task.title}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">
              Proof Link (URL)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                <LinkIcon size={18} />
              </div>
              <input
                required
                type="url"
                className="input-field w-full pl-12"
                placeholder="https://github.com/..."
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center py-4 text-lg font-bold"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <><Send size={20} /> Submit for Review</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

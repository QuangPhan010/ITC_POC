import { useState } from "react";
import { UserPlus, Loader2, X } from "lucide-react";

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; studentId: string; university: string }) => Promise<void>;
}

export function CreateProfileModal({ isOpen, onClose, onSubmit }: CreateProfileModalProps) {
  const [formData, setFormData] = useState({ name: "", studentId: "", university: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="glass w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="text-primary" />
            Create POC Profile
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/60 ml-1">Full Name</label>
            <input
              required
              className="input-field w-full"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/60 ml-1">Student ID</label>
            <input
              required
              className="input-field w-full font-mono"
              placeholder="e.g. ITC-2024-001"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white/60 ml-1">University</label>
            <input
              required
              className="input-field w-full"
              placeholder="e.g. Information Technology College"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center mt-6 py-3"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>Initialize Profile</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

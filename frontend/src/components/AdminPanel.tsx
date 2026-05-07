import { useState } from "react";
import { Crown, Loader2, Send } from "lucide-react";

interface AdminPanelProps {
  onSubmit: (data: { orgName: string; recipient: string }) => Promise<void>;
}

export function AdminPanel({ onSubmit }: AdminPanelProps) {
  const [formData, setFormData] = useState({ orgName: "", recipient: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ orgName: "", recipient: "" });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/10 rounded-lg">
          <Crown className="text-amber-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Protocol Admin Panel</h3>
          <p className="text-white/40 text-xs uppercase tracking-widest">Manage Organization Permissions</p>
        </div>
      </div>
      
      <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
        <h4 className="text-md font-semibold text-white mb-4">Issue New Verifier Capability</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/40 uppercase ml-1">Organization Name</label>
            <input
              required
              className="input-field w-full"
              placeholder="e.g. Sui University"
              value={formData.orgName}
              onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/40 uppercase ml-1">Recipient Wallet Address</label>
            <input
              required
              className="input-field w-full font-mono text-sm"
              placeholder="0x..."
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full justify-center py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-amber-500/20"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <><Send size={18} /> Issue Verifier Cap</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

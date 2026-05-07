import { useState } from "react";
import { ShieldCheck, Loader2, CreditCard, Sparkles } from "lucide-react";

interface PurchaseVerifierProps {
  onPurchase: (orgName: string) => Promise<void>;
  priceSui: number;
}

export function PurchaseVerifier({ onPurchase, priceSui }: PurchaseVerifierProps) {
  const [orgName, setOrgName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onPurchase(orgName);
      setOrgName("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="glass-card overflow-hidden">
        {/* Header Decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
        
        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 shadow-xl shadow-primary/5 border border-primary/20">
              <ShieldCheck size={40} className="text-primary" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Become a Verifier</h2>
            <p className="text-white/40 max-w-md">
              Upgrade your account to an official organization for 30 days. Post quests, verify student contributions, and help build the future of education.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={14} className="text-primary" />
                Verifier Benefits
              </h4>
              <ul className="space-y-3">
                {[
                  "Post unlimited Quests for 30 days",
                  "Approve student submissions",
                  "Build organization reputation",
                  "Official Verifier Badge"
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Total Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{priceSui}</span>
                <span className="text-xl font-bold text-primary">SUI</span>
              </div>
              <p className="text-[10px] text-white/20 mt-2 italic">Per Month Subscription</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Organization Name</label>
              <input
                required
                className="input-field w-full py-4 text-lg"
                placeholder="e.g. Stanford University"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !orgName.trim()}
              className="btn-primary w-full justify-center py-5 text-lg shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all group"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <CreditCard className="group-hover:translate-x-1 transition-transform" />
                  Purchase Verifier Package
                </>
              )}
            </button>
            
            <p className="text-[10px] text-center text-white/20">
              By purchasing, you agree to our terms of service for organizations.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

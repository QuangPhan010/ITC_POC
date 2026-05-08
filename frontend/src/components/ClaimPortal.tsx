import { Trophy, Coins, History, ArrowUpRight, Loader2 } from "lucide-react";

interface ClaimPortalProps {
  totalPoints: number;
  onClaim: () => Promise<void>;
  isBusy?: boolean;
}

export function ClaimPortal({ totalPoints, onClaim, isBusy = false }: ClaimPortalProps) {
  // Mock conversion: 100 points = 1 placeholder token
  const estimatedRewards = (totalPoints / 100).toFixed(2);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Trophy size={80} className="text-primary" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Total Redeemable</p>
              <h3 className="text-5xl font-black text-white tracking-tighter flex items-end gap-2">
                {totalPoints} <span className="text-xl text-white/40 mb-1">PTS</span>
              </h3>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-0.5">Est. Value</p>
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Coins size={14} className="text-amber-500" /> {estimatedRewards} ITC
                </p>
              </div>
              <button 
                onClick={onClaim}
                disabled={totalPoints === 0 || isBusy}
                className="flex-1 h-12 bg-primary hover:bg-accent text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isBusy ? <Loader2 className="animate-spin" size={18} /> : <>Claim Rewards <ArrowUpRight size={18} /></>}
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 border-white/5 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tighter">
              <History className="text-white/40" size={20} />
              Earnings Summary
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Lifetime Earned</span>
                <span className="text-sm font-black text-white">{totalPoints} PTS</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Tasks Completed</span>
                <span className="text-sm font-black text-white">Calculating...</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Last Claimed</span>
                <span className="text-sm font-black text-white/40 italic">Never</span>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-white/20 font-medium leading-relaxed italic mt-4">
            * Note: This is a POC environment. "ITC" tokens are simulated and do not have real-world value. 
            Claiming will reset your on-chain point balance.
          </p>
        </div>
      </div>

      <div className="glass-card">
        <h4 className="text-lg font-black text-white flex items-center gap-2 mb-6 uppercase tracking-tighter p-6 border-b border-white/5">
          <History className="text-primary" size={20} />
          Point History
        </h4>
        <div className="p-20 text-center opacity-20">
          <Trophy size={48} className="mx-auto mb-4" />
          <p className="text-xs font-bold uppercase tracking-[0.2em]">History tracking coming soon</p>
        </div>
      </div>
    </div>
  );
}

import { Calendar, Award, CheckCircle2 } from "lucide-react";

interface Contribution {
  title: string;
  description: string;
  category: string;
  points: string;
  timestamp: string;
  verified_by: string;
}

interface ContributionListProps {
  contributions: Contribution[];
}

export function ContributionList({ contributions }: ContributionListProps) {
  if (contributions.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Award size={32} className="text-white/20" />
        </div>
        <h3 className="text-lg font-semibold text-white/60">No contributions yet</h3>
        <p className="text-white/40 text-sm max-w-xs mx-auto">
          Verified achievements will appear here once an organization adds them to your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
        <Award className="text-primary" />
        Verified Contributions
      </h3>
      
      <div className="grid gap-4">
        {contributions.map((item, index) => (
          <div key={index} className="glass-card flex flex-col md:flex-row md:items-center gap-6 group">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/20">
                  {item.category}
                </span>
                <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                {item.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-white/40">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(parseInt(item.timestamp)).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-green-500/60" />
                  Verified by: <span className="text-white/60">{item.verified_by}</span>
                </div>
              </div>
            </div>
            
            <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 gap-2">
              <p className="text-xs text-white/40 uppercase tracking-wider">Points</p>
              <p className="text-3xl font-black gradient-text">+{item.points}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { GraduationCap, Award, Building2, User, ShieldCheck, Trophy } from "lucide-react";

interface ProfileCardProps {
  profile: {
    name: string;
    student_id: string;
    university: string;
    total_points: string;
    reputation: number;
    badges: string[];
  };
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const reputationPercentage = (profile.reputation / 1000) * 100;

  return (
    <div className="glass-card relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <GraduationCap size={120} />
      </div>
      
      <div className="flex flex-col md:flex-row items-start gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-xl shadow-primary/20 relative group">
            <User size={48} className="text-white" />
            <div className="absolute -bottom-2 -right-2 bg-amber-500 rounded-full p-1.5 border-4 border-[#0a0a0a] shadow-lg">
              <ShieldCheck size={16} className="text-white" />
            </div>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Reputation</span>
            <div className="text-xl font-black text-white">{profile.reputation}</div>
          </div>
        </div>
        
        <div className="space-y-6 flex-1 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">{profile.name}</h2>
              <p className="text-white/60 flex items-center gap-2 mt-1 font-medium">
                <Building2 size={16} className="text-primary" />
                {profile.university}
              </p>
            </div>
            
            <div className="flex gap-2">
              {profile.badges?.length > 0 ? profile.badges.map((badge, i) => (
                <div key={i} className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Trophy size={12} className="text-amber-500" />
                  <span className="text-[10px] font-bold text-amber-500 uppercase">{badge}</span>
                </div>
              )) : (
                <div className="bg-white/5 border border-white/5 px-3 py-1 rounded-full">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">No Badges Yet</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group hover:bg-white/10 transition-all">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Student ID</p>
              <p className="font-mono text-sm text-white/80">{profile.student_id}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group hover:bg-white/10 transition-all">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Total Points</p>
              <p className="text-2xl font-black gradient-text">{profile.total_points}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 col-span-1 lg:col-span-1 group hover:bg-white/10 transition-all">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2.5 flex justify-between">
                <span>Reputation Progress</span>
                <span className="text-primary">{Math.round(reputationPercentage)}%</span>
              </p>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000" 
                  style={{ width: `${reputationPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

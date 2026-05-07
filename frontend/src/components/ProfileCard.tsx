import { GraduationCap, Award, Building2, User } from "lucide-react";

interface ProfileCardProps {
  profile: {
    name: string;
    student_id: string;
    university: string;
    total_points: string;
  };
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="glass-card relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <GraduationCap size={120} />
      </div>
      
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg">
          <User size={40} className="text-white" />
        </div>
        
        <div className="space-y-4 flex-1">
          <div>
            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            <p className="text-white/60 flex items-center gap-2">
              <Building2 size={14} />
              {profile.university}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Student ID</p>
              <p className="font-mono text-sm text-white/80">{profile.student_id}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Points</p>
              <p className="text-xl font-bold gradient-text">{profile.total_points}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

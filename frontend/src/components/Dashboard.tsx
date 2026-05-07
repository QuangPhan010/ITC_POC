import { useMemo } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Briefcase
} from "lucide-react";

interface DashboardProps {
  stats: {
    totalTasks: number;
    totalSubmissions: number;
    approvedSubmissions: number;
    totalUsers: number;
  };
  recentActivity: any[];
}

export function Dashboard({ stats, recentActivity }: DashboardProps) {
  const passRate = useMemo(() => {
    if (stats.totalSubmissions === 0) return 0;
    return Math.round((stats.approvedSubmissions / stats.totalSubmissions) * 100);
  }, [stats]);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Tasks" 
          value={stats.totalTasks} 
          icon={<Briefcase className="text-blue-400" size={20} />}
          trend="+12% from last week"
        />
        <StatCard 
          title="Pending Review" 
          value={stats.totalSubmissions - stats.approvedSubmissions} 
          icon={<Clock className="text-amber-400" size={20} />}
          trend="8 urgent tasks"
        />
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<Users className="text-purple-400" size={20} />}
          trend="+5 new today"
        />
        <StatCard 
          title="Global Pass Rate" 
          value={`${passRate}%`} 
          icon={<TrendingUp className="text-green-400" size={20} />}
          trend="Standard quality met"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Activity Chart (Mock/SVG) */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-primary" size={20} />
              Protocol Activity
            </h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase">
                <div className="w-2 h-2 rounded-full bg-primary"></div> Tasks
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase">
                <div className="w-2 h-2 rounded-full bg-green-500"></div> Passed
              </span>
            </div>
          </div>
          
          <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
            {[45, 60, 35, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-white/5 rounded-t-lg relative overflow-hidden h-48 flex flex-col justify-end">
                  <div 
                    className="w-full bg-primary/40 rounded-t-sm transition-all duration-1000" 
                    style={{ height: `${h}%` }}
                  ></div>
                  <div 
                    className="w-full bg-green-500/40 rounded-t-sm absolute bottom-0 transition-all duration-1000 delay-300" 
                    style={{ height: `${h * 0.7}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log / Recent Activity */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <AlertCircle className="text-amber-500" size={20} />
            Audit Log
          </h3>
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((log, i) => (
              <div key={i} className="flex gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                <div className="mt-1">
                  {log.type === 'approve' ? (
                    <CheckCircle2 className="text-green-500" size={14} />
                  ) : (
                    <Clock className="text-white/20" size={14} />
                  )}
                </div>
                <div>
                  <p className="text-xs text-white/80 font-medium leading-tight">
                    {log.message}
                  </p>
                  <p className="text-[10px] text-white/20 mt-1 uppercase font-bold tracking-widest">
                    {log.time}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-xs text-white/20 text-center py-10 italic">No recent activity detected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string; value: string | number; icon: React.ReactNode; trend: string }) {
  return (
    <div className="glass-card p-5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-2xl font-black text-white mb-2">{value}</h4>
      <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter flex items-center gap-1">
        {trend}
      </p>
    </div>
  );
}

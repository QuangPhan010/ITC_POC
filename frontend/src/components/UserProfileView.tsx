import { useSuiClientQuery, useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Loader2, ShieldAlert, User, GraduationCap, Award, History, ArrowLeft, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { ContributionList } from "./ContributionList";
import { ReportUserModal } from "./ReportUserModal";
import { UPGRADED_PACKAGE_ID, MODULE_NAME, CLOCK_ID } from "../constants";

interface UserProfileViewProps {
  studentId: string;
  onBack: () => void;
}

export function UserProfileView({ studentId, onBack }: UserProfileViewProps) {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const { data: profileObject, isLoading } = useSuiClientQuery(
    "getObject",
    {
      id: studentId,
      options: { showContent: true },
    },
    { enabled: !!studentId }
  );

  const profile = useMemo(() => {
    const obj = profileObject?.data;
    if (!obj || !obj.content || obj.content.dataType !== "moveObject") return null;
    
    const fields = obj.content.fields as any;
    return {
      id: obj.objectId,
      name: fields.name,
      student_id: fields.student_id,
      university: fields.university,
      total_points: fields.total_points,
      reputation: Number(fields.reputation),
      badges: fields.badges,
      owner: fields.owner,
      contributions: fields.contributions.map((c: any) => ({
        title: c.fields.title,
        description: c.fields.description,
        category: c.fields.category,
        points: c.fields.points,
        timestamp: c.fields.timestamp,
        verified_by: c.fields.verified_by,
      })),
    };
  }, [profileObject]);

  const handleReport = async (reason: string) => {
    if (!studentId) return;
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${UPGRADED_PACKAGE_ID}::${MODULE_NAME}::report_user`,
      arguments: [
        tx.object(studentId),
        tx.pure.string(reason),
        tx.object(CLOCK_ID),
      ],
    });

    try {
      await signAndExecute({ transaction: tx });
      alert("User reported successfully. Thank you for keeping the community safe.");
    } catch (error: any) {
      console.error(error);
      alert(`Reporting failed: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Fetching Profile Artifact...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <ShieldAlert className="text-red-500" size={40} />
        <p className="text-white/60 font-bold">Profile not found or invalid artifact.</p>
        <button onClick={onBack} className="text-primary hover:underline text-sm cursor-pointer border-none bg-transparent">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group cursor-pointer border-none bg-transparent"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">Back to Dashboard</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-primary" />
                <span className="text-[10px] font-black text-primary uppercase">Verified Profile</span>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                <User size={48} className="text-white/80" />
              </div>
              
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tight">{profile.name}</h2>
                <div className="flex items-center justify-center gap-2 text-white/40 font-medium text-xs">
                  <GraduationCap size={14} />
                  {profile.university}
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Reputation</p>
                  <p className="text-xl font-black text-primary">{profile.reputation}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Total Points</p>
                  <p className="text-xl font-black text-accent">{profile.total_points}</p>
                </div>
              </div>

              {account?.address !== profile.owner && (
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="w-full mt-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 py-3 rounded-xl flex items-center justify-center gap-2 font-black transition-all text-xs uppercase tracking-widest cursor-pointer"
                >
                  <ShieldAlert size={14} />
                  Report User
                </button>
              )}
            </div>
          </div>

          <div className="glass-card">
            <h4 className="text-xs font-black text-white/20 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Award size={14} /> Badges Earned
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.badges.length > 0 ? (
                profile.badges.map((badge: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white/60">
                    {badge}
                  </span>
                ))
              ) : (
                <p className="text-[10px] text-white/20 font-bold uppercase italic">No badges earned yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Contributions */}
        <div className="lg:col-span-2 space-y-6">
          <ContributionList contributions={profile.contributions} />
        </div>
      </div>

      <ReportUserModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReport={handleReport}
        targetName={profile.name}
      />
    </div>
  );
}

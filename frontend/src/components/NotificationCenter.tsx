import { useState, useEffect } from "react";
import { Bell, Clock, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

interface Notification {
  id: string;
  type: "deadline" | "status";
  title: string;
  message: string;
  time: number;
  read: boolean;
  statusType?: number;
}

export function NotificationCenter({ tasks, submissions }: { tasks: any[], submissions: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const newNotifications: Notification[] = [];

    // 1. Deadline reminders (for upcoming tasks)
    tasks.forEach(task => {
      if (task.deadline && task.is_active) {
        const timeLeft = Number(task.deadline) - Date.now();
        if (timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000) { // < 24h
          newNotifications.push({
            id: `deadline-${task.id}`,
            type: "deadline",
            title: "Quest Ending Soon",
            message: `${task.title} expires in ${Math.round(timeLeft / (60 * 60 * 1000))} hours!`,
            time: Date.now(),
            read: false
          });
        }
      }
    });

    // 2. Status changes (for recent submissions)
    submissions.forEach(sub => {
      if (sub.status !== 0) { // Not pending
        newNotifications.push({
          id: `status-${sub.id}-${sub.status}`,
          type: "status",
          title: sub.status === 1 ? "Quest Approved!" : sub.status === 2 ? "Quest Rejected" : "Dispute Status Update",
          message: `Your submission for "${sub.taskTitle}" has been updated.`,
          time: sub.submittedAt, // Ideally we'd have a reviewedAt timestamp
          read: false,
          statusType: sub.status
        });
      }
    });

    setNotifications(newNotifications.sort((a, b) => b.time - a.time).slice(0, 5));
  }, [tasks, submissions]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (n: Notification) => {
    if (n.type === "deadline") return <Clock className="text-amber-500" size={16} />;
    switch(n.statusType) {
      case 1: return <CheckCircle2 className="text-green-500" size={16} />;
      case 2: return <XCircle className="text-red-500" size={16} />;
      case 3: return <AlertTriangle className="text-purple-500" size={16} />;
      default: return <Info className="text-primary" size={16} />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-black"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-3 w-80 glass-card p-4 border border-white/10 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Activity Feed</h4>
              {unreadCount > 0 && (
                <span className="text-[8px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="py-8 text-center opacity-20">
                  <p className="text-[10px] font-black uppercase tracking-widest italic">All caught up!</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="mt-0.5">{getIcon(n)}</div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-white group-hover:text-primary transition-colors">{n.title}</p>
                      <p className="text-[10px] text-white/40 font-medium leading-tight">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button className="w-full mt-4 py-2 text-[8px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-white/40 transition-colors">
              Clear All Notifications
            </button>
          </div>
        </>
      )}
    </div>
  );
}

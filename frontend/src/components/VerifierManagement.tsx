import { useSuiClientQuery } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAME } from "../constants";
import { ShieldCheck, Calendar, Trash2, Building2, User } from "lucide-react";
import { useMemo } from "react";

export function VerifierManagement() {
  // Query for VerifierPurchased events
  const { data: purchaseEvents, isLoading: isLoadingPurchases } = useSuiClientQuery("queryEvents", {
    query: { MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::VerifierPurchased` },
  });

  // Query for VerifierRenewed events (to get latest expiry)
  const { data: renewalEvents } = useSuiClientQuery("queryEvents", {
    query: { MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::VerifierRenewed` },
  });

  const verifierList = useMemo(() => {
    if (!purchaseEvents?.data) return [];

    // Map to track the latest state of each cap
    const verifiersMap = new Map();

    // Process purchases
    purchaseEvents.data.forEach((event: any) => {
      const { cap_id, org_name, owner, expires_at } = event.parsedJson;
      verifiersMap.set(cap_id, {
        id: cap_id,
        orgName: org_name,
        owner: owner,
        expiresAt: Number(expires_at),
      });
    });

    // Process renewals to update expiry dates
    if (renewalEvents?.data) {
      renewalEvents.data.forEach((event: any) => {
        const { cap_id, new_expires_at } = event.parsedJson;
        if (verifiersMap.has(cap_id)) {
          const current = verifiersMap.get(cap_id);
          if (Number(new_expires_at) > current.expiresAt) {
            verifiersMap.set(cap_id, { ...current, expiresAt: Number(new_expires_at) });
          }
        }
      });
    }

    return Array.from(verifiersMap.values());
  }, [purchaseEvents, renewalEvents]);

  if (isLoadingPurchases) return <div className="p-8 text-center text-white/40">Loading Verifiers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-primary" />
            Verifier Management
          </h3>
          <p className="text-white/40 text-sm">Monitor all organization subscriptions via on-chain events</p>
        </div>
        <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-primary font-bold">{verifierList.length}</span>
          <span className="text-white/40 text-xs ml-2 uppercase tracking-widest">Active Subscriptions</span>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest">Organization</th>
              <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest">Owner Address</th>
              <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest">Status / Expiry</th>
              <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {verifierList.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-white/20 italic">No verifier registrations found on this package</td>
              </tr>
            ) : (
              verifierList.map((v) => {
                const isExpired = Date.now() > v.expiresAt;
                return (
                  <tr key={v.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                          <Building2 size={16} />
                        </div>
                        <span className="font-bold text-white">{v.orgName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-xs font-mono text-white/40">
                        <User size={12} />
                        {v.owner.substring(0, 10)}...{v.owner.substring(v.owner.length - 4)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-2 text-xs font-bold ${isExpired ? "text-red-500" : "text-white/60"}`}>
                        <Calendar size={14} />
                        {new Date(v.expiresAt).toLocaleDateString()}
                        {isExpired && <span className="ml-2 px-2 py-0.5 bg-red-500/10 rounded text-[10px] uppercase tracking-tighter">Expired</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        disabled
                        className="p-2 text-white/10 cursor-not-allowed"
                        title="Management features under development"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

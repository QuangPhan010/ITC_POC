import { useState } from "react";
import { ListPlus, Loader2, Target, ShieldCheck, Plus, X, Settings2 } from "lucide-react";

interface CreateTaskFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    points: number;
    rubric: string[];
    minReputation: number;
    requiresDoubleCheck: boolean;
    deadline: number;
  }) => Promise<void>;
}

export function CreateTaskForm({ onSubmit }: CreateTaskFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Coding",
    points: 20,
    minReputation: 0,
    requiresDoubleCheck: false,
    deadline: (() => {
      // Default to 7 days from now
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().slice(0, 16);
    })()
  });
  const [rubricItems, setRubricItems] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        deadline: new Date(formData.deadline).getTime(),
        rubric: rubricItems.filter(item => item.trim() !== ""),
      });
      setFormData({ ...formData, title: "", description: "" });
      setRubricItems([""]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addRubricItem = () => setRubricItems([...rubricItems, ""]);
  const removeRubricItem = (index: number) => setRubricItems(rubricItems.filter((_, i) => i !== index));
  const updateRubricItem = (index: number, value: string) => {
    const newItems = [...rubricItems];
    newItems[index] = value;
    setRubricItems(newItems);
  };

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/10">
            <ListPlus className="text-primary" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Post New Quest</h3>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Protocol-wide distribution</p>
          </div>
        </div>
        <button 
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            showAdvanced ? "bg-primary/20 text-primary border border-primary/20" : "bg-white/5 text-white/40 border border-white/5"
          }`}
        >
          <Settings2 size={14} /> {showAdvanced ? "Hide Advanced" : "Show Advanced"}
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Quest Title</label>
            <input
              required
              className="input-field w-full text-sm py-3"
              placeholder="e.g. Develop a Sui Wallet Adapter"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Domain / Category</label>
            <select
              className="input-field w-full appearance-none text-sm py-3"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Coding">Coding & Development</option>
              <option value="Design">Visual Design</option>
              <option value="Research">Academic Research</option>
              <option value="Writing">Content & Writing</option>
              <option value="Community">Community Growth</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Quest Deadline</label>
          <input
            type="datetime-local"
            required
            className="input-field w-full text-sm py-3"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Detailed Requirements</label>
          <textarea
            required
            rows={4}
            className="input-field w-full resize-none text-sm leading-relaxed"
            placeholder="Outline the scope, deliverables, and expected quality standards..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Verification Rubric (Checklist)</label>
            <button 
              type="button" 
              onClick={addRubricItem}
              className="text-[10px] font-bold text-primary hover:text-white transition-colors flex items-center gap-1"
            >
              <Plus size={12} /> Add Item
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rubricItems.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  className="input-field w-full text-xs py-2"
                  placeholder={`Criteria ${idx + 1}...`}
                  value={item}
                  onChange={(e) => updateRubricItem(idx, e.target.value)}
                />
                {rubricItems.length > 1 && (
                  <button type="button" onClick={() => removeRubricItem(idx)} className="text-white/20 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-white/[0.02] border border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Minimum Reputation Required</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="50"
                  className="flex-1 accent-primary"
                  value={formData.minReputation}
                  onChange={(e) => setFormData({ ...formData, minReputation: parseInt(e.target.value) })}
                />
                <span className="text-xl font-black text-white w-12 text-center">{formData.minReputation}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${formData.requiresDoubleCheck ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-white/20"}`}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Double-Check Verification</p>
                  <p className="text-[10px] text-white/40 font-medium">Requires approval from two verifiers</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, requiresDoubleCheck: !formData.requiresDoubleCheck })}
                className={`w-12 h-6 rounded-full p-1 transition-all ${formData.requiresDoubleCheck ? "bg-amber-500" : "bg-white/10"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.requiresDoubleCheck ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row md:items-center gap-8 pt-4 border-t border-white/5">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Quest Reward Value</label>
              <span className="text-xs font-bold text-primary uppercase">SUI Points</span>
            </div>
            <div className="flex items-center gap-6">
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                className="flex-1 accent-primary"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
              />
              <div className="text-4xl font-black gradient-text tracking-tighter w-24 text-right">{formData.points}</div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary shrink-0 px-10 py-4 flex items-center justify-center gap-2 group"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Target size={20} className="group-hover:scale-110 transition-transform" /> 
                <span className="font-black uppercase tracking-widest text-sm">Post Protocol Quest</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

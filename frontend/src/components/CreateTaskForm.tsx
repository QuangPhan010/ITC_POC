import { useState } from "react";
import { ListPlus, Loader2, Target } from "lucide-react";

interface CreateTaskFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    points: number;
  }) => Promise<void>;
}

export function CreateTaskForm({ onSubmit }: CreateTaskFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Hackathon",
    points: 20,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ ...formData, title: "", description: "" });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ListPlus className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Create New Quest</h3>
          <p className="text-white/40 text-xs uppercase tracking-widest">Open for all students</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/40 uppercase ml-1">Quest Title</label>
            <input
              required
              className="input-field w-full"
              placeholder="e.g. Write a Sui Guide"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/40 uppercase ml-1">Category</label>
            <select
              className="input-field w-full appearance-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Hackathon">Hackathon</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Research">Research</option>
              <option value="Workshop">Workshop</option>
              <option value="Content">Content Creation</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-white/40 uppercase ml-1">Requirements / Description</label>
          <textarea
            required
            rows={3}
            className="input-field w-full resize-none"
            placeholder="What should students do to earn these points?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-bold text-white/40 uppercase ml-1">Reward Points</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                className="flex-1 accent-primary"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
              />
              <span className="text-2xl font-black gradient-text w-12 text-center">{formData.points}</span>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary shrink-0 px-8 py-3 mt-4"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <><Target size={18} /> Post Quest</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

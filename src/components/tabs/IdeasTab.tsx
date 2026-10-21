import React, { useState } from 'react';
import { EventPlan, CreativeIdea } from '../../types';
import { 
  Sparkles, 
  Heart, 
  Lightbulb, 
  Tag, 
  Palette, 
  Plus, 
  Trash2, 
  DollarSign, 
  Copy, 
  Check,
  TrendingDown,
  Gift,
  Music,
  Wine
} from 'lucide-react';

interface IdeasTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  onAskAi: (prompt: string) => void;
}

export const IdeasTab: React.FC<IdeasTabProps> = ({
  event,
  onUpdateEvent,
  onAskAi,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CreativeIdea['category']>('theme_decor');
  const [description, setDescription] = useState('');
  const [costRange, setCostRange] = useState('$100 - $300');
  const [tagsInput, setTagsInput] = useState('Unique, Guest Experience');

  const categoryIcons: Record<CreativeIdea['category'], any> = {
    theme_decor: Palette,
    entertainment_activity: Music,
    food_beverage: Wine,
    favors_gifts: Gift,
    cost_saving_hack: TrendingDown,
  };

  const categoryLabels: Record<CreativeIdea['category'], string> = {
    theme_decor: 'Decor & Aesthetic',
    entertainment_activity: 'Entertainment & Games',
    food_beverage: 'Food & Signature Drinks',
    favors_gifts: 'Favors & Keepsakes',
    cost_saving_hack: 'Cost-Saving Hack',
  };

  const handleToggleFavorite = (id: string) => {
    const updated = event.ideas.map((i) =>
      i.id === id ? { ...i, isFavorite: !i.isFavorite } : i
    );
    onUpdateEvent({ ...event, ideas: updated });
  };

  const handleDeleteIdea = (id: string) => {
    const updated = event.ideas.filter((i) => i.id !== id);
    onUpdateEvent({ ...event, ideas: updated });
  };

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newIdea: CreativeIdea = {
      id: `i_${Date.now()}`,
      title,
      category,
      description,
      estimatedCostRange: costRange,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      isFavorite: false,
    };

    onUpdateEvent({ ...event, ideas: [newIdea, ...event.ideas] });
    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  const copyIdea = (idea: CreativeIdea) => {
    navigator.clipboard.writeText(`${idea.title}\n${idea.description}\nEstimated Cost: ${idea.estimatedCostRange || 'N/A'}`);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredIdeas = selectedCategory === 'all'
    ? event.ideas
    : event.ideas.filter((i) => i.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Moodboard & Theme Vision Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Aesthetic & Sensory Moodboard</span>
            </div>
            <h3 className="text-xl font-black text-white">
              "{event.vibeAndTheme}"
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Personalized concept board curated by GenAI. Tailored sensory cues, signature focal points, interactive entertainment, and budget-saving design hacks.
            </p>
          </div>

          {/* Color Palette Display */}
          <div className="bg-slate-950/70 border border-slate-700/80 rounded-2xl p-4 shrink-0">
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              Event Color Story:
            </span>
            <div className="flex items-center space-x-3">
              {event.colorPalette?.map((color, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-1">
                  <div
                    style={{ backgroundColor: color }}
                    className="w-10 h-10 rounded-xl shadow-md border border-white/20 transition hover:scale-110"
                  />
                  <span className="text-[10px] font-mono text-slate-400">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium shrink-0 transition ${
              selectedCategory === 'all'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Concepts ({event.ideas.length})
          </button>
          {Object.entries(categoryLabels).map(([catKey, label]) => {
            const count = event.ideas.filter((i) => i.category === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-lg font-medium shrink-0 transition ${
                  selectedCategory === catKey
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onAskAi(`Give me 4 creative, buzzworthy, experiential ideas for ${event.title} (${event.eventType}) with the vibe "${event.vibeAndTheme}" that make guests feel truly engaged.`)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-3 py-2 rounded-xl flex items-center space-x-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Brainstorm More</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold px-3 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Idea</span>
          </button>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map((idea) => {
          const IconComponent = categoryIcons[idea.category] || Lightbulb;
          return (
            <div
              key={idea.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition hover:border-slate-700 ${
                idea.isFavorite ? 'border-amber-500/50 bg-gradient-to-b from-slate-900 to-amber-950/10' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 text-xs font-semibold text-rose-400">
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{categoryLabels[idea.category] || idea.category}</span>
                  </span>

                  <button
                    onClick={() => handleToggleFavorite(idea.id)}
                    className={`p-1.5 rounded-lg transition ${
                      idea.isFavorite ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-white'
                    }`}
                    title={idea.isFavorite ? 'Unfavorite' : 'Mark as Favorite'}
                  >
                    <Heart className={`w-4 h-4 ${idea.isFavorite ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                <h4 className="text-base font-bold text-white mt-2">
                  {idea.title}
                </h4>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {idea.description}
                </p>

                {idea.estimatedCostRange && (
                  <div className="mt-3 inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-950 text-emerald-400 border border-slate-800">
                    <DollarSign className="w-3 h-3" />
                    <span>{idea.estimatedCostRange}</span>
                  </div>
                )}

                {/* Tags */}
                {idea.tags && idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {idea.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <button
                  onClick={() => copyIdea(idea)}
                  className="flex items-center space-x-1 hover:text-white transition"
                >
                  {copiedId === idea.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === idea.id ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => handleDeleteIdea(idea.id)}
                  className="p-1 hover:text-rose-400 transition"
                  title="Delete idea"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Idea Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              Add Creative Concept
            </h3>
            <form onSubmit={handleAddIdea} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Idea Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S'mores Firepit Lounge & Espresso Bar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="theme_decor">Theme & Decor</option>
                  <option value="entertainment_activity">Entertainment & Activities</option>
                  <option value="food_beverage">Food & Beverage</option>
                  <option value="favors_gifts">Favors & Keepsakes</option>
                  <option value="cost_saving_hack">Cost Saving Hack</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the experience, setup, and aesthetic details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Cost Range
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $150 - $300"
                    value={costRange}
                    onChange={(e) => setCostRange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cozy, Late Night, Photo"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30"
                >
                  Save Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

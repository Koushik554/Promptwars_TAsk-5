import React, { useState } from 'react';
import { EventType, Currency, GenerateEventPrompt } from '../types';
import { Sparkles, Calendar, MapPin, Users, DollarSign, X, Wand2, Lightbulb } from 'lucide-react';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: GenerateEventPrompt) => Promise<void>;
  isLoading: boolean;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isLoading,
}) => {
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-09-20');
  const [location, setLocation] = useState('Coastal Glasshouse Estate, Carmel CA');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [targetBudget, setTargetBudget] = useState<number>(30000);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [vibeAndTheme, setVibeAndTheme] = useState('Warm Coastal Sunset & Botanical Olive Greens');
  const [specialRequests, setSpecialRequests] = useState('Acoustic live music, farm-to-table dinner with vegan pairings, audio guestbook.');

  if (!isOpen) return null;

  // Preset inspiration templates for instant testing
  const inspirationTemplates = [
    {
      type: 'wedding' as EventType,
      label: '💍 Secret Garden Chateau Wedding',
      title: 'Celeste & Devon’s French Garden Wedding',
      location: 'Château de Lumière, Provence',
      guests: 110,
      budget: 42000,
      vibe: 'Romantic French Garden, Lavender Hues & Candlelit Pergolas',
      notes: 'String quartet ceremony, champagne tower, late-night crepe station.'
    },
    {
      type: 'birthday' as EventType,
      label: '🎂 90s Neon Arcade 30th Birthday',
      title: 'Zach’s Level 30 Retro Arcade Rave',
      location: 'Underground Warehouse Loft, Austin TX',
      guests: 50,
      budget: 6000,
      vibe: 'Cyberpunk Neon Glow & 90s Retro Arcade Games',
      notes: 'Vintage arcade cabinets, glow-in-the-dark cocktails, live DJ synthwave set.'
    },
    {
      type: 'community' as EventType,
      label: '🤝 Green Earth Community Eco-Fair',
      title: 'Riverside Community Harvest & Maker Fair',
      location: 'Riverside Public Park & Ampitheater',
      guests: 600,
      budget: 18000,
      vibe: 'Zero-Waste Sustainability & Local Artisan Showcase',
      notes: 'Local acoustic stage, 25 craft booths, compost workshops, food truck rally.'
    }
  ];

  const applyTemplate = (tmpl: typeof inspirationTemplates[0]) => {
    setEventType(tmpl.type);
    setTitle(tmpl.title);
    setLocation(tmpl.location);
    setGuestCount(tmpl.guests);
    setTargetBudget(tmpl.budget);
    setVibeAndTheme(tmpl.vibe);
    setSpecialRequests(tmpl.notes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onGenerate({
      eventType,
      title,
      date,
      location,
      guestCount: Number(guestCount),
      targetBudget: Number(targetBudget),
      currency,
      vibeAndTheme,
      specialRequests,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <Wand2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Create Event with GenAI
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Tell CelebrAIte your vision, and our AI will engineer a complete budget, schedule, vendor checklist & ideas.
            </p>
          </div>
        </div>

        {/* Quick Inspiration Pills */}
        <div className="mb-6 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
          <div className="flex items-center space-x-1.5 text-xs text-amber-300 font-semibold mb-2">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>One-Click Inspiration Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {inspirationTemplates.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyTemplate(t)}
                className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Event Type */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Event Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'wedding', label: 'Wedding', icon: '💍', desc: 'Luxe, Intimate, Destination' },
                { id: 'birthday', label: 'Birthday', icon: '🎂', desc: 'Milestone, Kids, Gala' },
                { id: 'community', label: 'Community', icon: '🤝', desc: 'Festival, Charity, Fair' },
                { id: 'other', label: 'Custom Gala', icon: '✨', desc: 'Corporate, Party, Mixer' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEventType(t.id as EventType)}
                  className={`p-3 rounded-2xl border text-left transition ${
                    eventType === t.id
                      ? 'bg-rose-500/20 border-rose-500 text-white shadow-md shadow-rose-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="text-xl mb-1">{t.icon}</div>
                  <div className="font-bold text-sm text-white">{t.label}</div>
                  <div className="text-[11px] text-slate-400 truncate">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Event Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Elena & Liam's Tuscan Villa Wedding"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Target Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Location or City
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Napa Valley, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Guests & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Guest Count
              </label>
              <input
                type="number"
                min="1"
                required
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Target Budget
              </label>
              <input
                type="number"
                min="100"
                required
                value={targetBudget}
                onChange={(e) => setTargetBudget(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>
          </div>

          {/* Vibe and Theme Prompt */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Aesthetic Vibe & Theme (AI Prompt)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Minimalist, Rustic Bohemian, 80s Neon Synthwave, Royal Gold Glamour"
              value={vibeAndTheme}
              onChange={(e) => setVibeAndTheme(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Special Requests or Priorities
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Vegan and gluten-free catering, outdoor tent setup, pet friendly, late night pizza truck..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Footer Submit Button */}
          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:opacity-95 text-white shadow-lg shadow-rose-600/30 flex items-center space-x-2 transition disabled:opacity-60"
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Synthesizing with GenAI...' : 'Generate Master Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

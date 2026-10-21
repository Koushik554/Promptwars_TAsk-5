import React, { useState } from 'react';
import { EventPlan } from '../types';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Briefcase, 
  Palette,
  Copy,
  Check
} from 'lucide-react';

interface EventOverviewProps {
  event: EventPlan;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const EventOverview: React.FC<EventOverviewProps> = ({
  event,
  activeTab,
  onTabChange,
}) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Calculate days remaining
  const calculateDaysLeft = () => {
    const target = new Date(event.date).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Event Concluded';
    if (diff === 0) return 'Today is the Day! 🎉';
    return `${diff} Days to go`;
  };

  // Budget calculations
  const totalPlanned = event.budgetItems.reduce((acc, item) => acc + item.planned, 0);
  const totalActual = event.budgetItems.reduce((acc, item) => acc + item.actual, 0);
  const percentPlanned = Math.min(Math.round((totalPlanned / (event.targetBudget || 1)) * 100), 150);

  // Timeline progress
  const completedMilestones = event.timeline.filter((m) => m.completed).length;
  const totalMilestones = event.timeline.length;
  const milestoneProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Vendors status
  const bookedVendors = event.vendors.filter((v) => v.status === 'booked' || v.status === 'deposit_paid' || v.status === 'completed').length;

  // Confirmed Guests
  const confirmedGuests = event.guests
    .filter((g) => g.status === 'confirmed')
    .reduce((acc, g) => acc + 1 + (g.plusOnes || 0), 0);

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      default: return '$';
    }
  };
  const sym = getCurrencySymbol(event.currency);

  const tabs = [
    { id: 'budget', label: 'Budget Planner', icon: '💰', count: `${sym}${totalPlanned.toLocaleString()}` },
    { id: 'timeline', label: 'Timeline & Schedule', icon: '⏳', count: `${completedMilestones}/${totalMilestones}` },
    { id: 'vendors', label: 'Vendor Checklist', icon: '📋', count: `${bookedVendors}/${event.vendors.length}` },
    { id: 'ideas', label: 'AI Ideas & Vibe', icon: '💡', count: `${event.ideas.length}` },
    { id: 'guests', label: 'Guest List', icon: '👥', count: `${confirmedGuests}/${event.guestCount}` },
    { id: 'copilot', label: 'GenAI Copilot', icon: '🤖', highlight: true }
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 pt-6 pb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-6 shadow-xl mb-6">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {event.eventType === 'wedding' && '💍 Wedding Celebration'}
                  {event.eventType === 'birthday' && '🎂 Birthday Party'}
                  {event.eventType === 'community' && '🤝 Community Event'}
                  {event.eventType === 'other' && '✨ Special Event'}
                </span>

                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {calculateDaysLeft()}
                </span>

                {/* Color Swatches */}
                <div className="flex items-center space-x-1.5 ml-2 bg-slate-950/60 px-2.5 py-1 rounded-full border border-slate-700">
                  <Palette className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  <span className="text-[11px] text-slate-400 mr-1">Palette:</span>
                  {event.colorPalette?.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => copyHex(color)}
                      style={{ backgroundColor: color }}
                      className="w-4 h-4 rounded-full border border-white/20 transition hover:scale-125 focus:outline-none relative group"
                      title={`Copy ${color}`}
                    >
                      {copiedColor === color && (
                        <Check className="w-3 h-3 text-white absolute inset-0 m-auto drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-rose-400" />
                  <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>{event.guestCount} Planned Guests</span>
                </div>
              </div>

              {/* AI Narrative Vision */}
              <div className="bg-slate-950/70 border border-slate-700/60 rounded-xl p-3.5 text-xs sm:text-sm text-slate-300 flex items-start space-x-3">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-rose-300">AI Vision & Theme: </span>
                  <span className="italic">{event.vibeAndTheme} — </span>
                  <span className="text-slate-400">{event.aiSummary}</span>
                </div>
              </div>
            </div>

            {/* Quick KPI Stat Pill Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 min-w-[320px]">
              {/* Budget KPI */}
              <div className="bg-slate-950/60 border border-slate-700 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Target Budget</span>
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="mt-1">
                  <div className="text-lg font-bold text-white">
                    {sym}{event.targetBudget.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between mt-0.5">
                    <span>Allocated: {sym}{totalPlanned.toLocaleString()}</span>
                    <span className={totalPlanned > event.targetBudget ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                      {percentPlanned}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${totalPlanned > event.targetBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(percentPlanned, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actual Spent KPI */}
              <div className="bg-slate-950/60 border border-slate-700 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Actual Spent</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="mt-1">
                  <div className="text-lg font-bold text-white">
                    {sym}{totalActual.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Remaining: {sym}{Math.max(0, event.targetBudget - totalActual).toLocaleString()}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="bg-sky-500 h-full transition-all duration-500"
                      style={{ width: `${Math.min(Math.round((totalActual / (event.targetBudget || 1)) * 100), 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Milestones KPI */}
              <div className="bg-slate-950/60 border border-slate-700 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Milestones</span>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="mt-1">
                  <div className="text-lg font-bold text-white">
                    {completedMilestones} / {totalMilestones}
                  </div>
                  <div className="text-[11px] text-amber-400 mt-0.5">
                    {milestoneProgress}% Prepared
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="bg-amber-400 h-full transition-all duration-500"
                      style={{ width: `${milestoneProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Vendors KPI */}
              <div className="bg-slate-950/60 border border-slate-700 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Vendors Booked</span>
                  <Briefcase className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="mt-1">
                  <div className="text-lg font-bold text-white">
                    {bookedVendors} / {event.vendors.length}
                  </div>
                  <div className="text-[11px] text-rose-400 mt-0.5">
                    {event.vendors.length - bookedVendors} Pending
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full transition-all duration-500"
                      style={{ width: `${event.vendors.length > 0 ? (bookedVendors / event.vendors.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 border ${
                  isActive
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
                } ${tab.highlight ? 'ring-1 ring-amber-400/50' : ''}`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.highlight && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-amber-400/20 text-amber-300 rounded border border-amber-400/30">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

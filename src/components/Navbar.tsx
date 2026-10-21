import React from 'react';
import { EventPlan, Currency } from '../types';
import { Sparkles, Plus, Download, Key, Calendar, Printer, HeartHandshake, Cake, Users } from 'lucide-react';

interface NavbarProps {
  events: EventPlan[];
  activeEvent: EventPlan;
  onSelectEvent: (id: string) => void;
  onOpenNewEventModal: () => void;
  onOpenApiKeyModal: () => void;
  onExportJson: () => void;
  onPrintReport: () => void;
  onChangeCurrency: (currency: Currency) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  events,
  activeEvent,
  onSelectEvent,
  onOpenNewEventModal,
  onOpenApiKeyModal,
  onExportJson,
  onPrintReport,
  onChangeCurrency,
}) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'wedding':
        return '💍';
      case 'birthday':
        return '🎂';
      case 'community':
        return '🤝';
      default:
        return '✨';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white font-bold">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-rose-400 via-pink-300 to-amber-200 bg-clip-text text-transparent">
                  CelebrAIte
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full uppercase tracking-wider">
                  GenAI Concierge
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI Planner for Weddings, Birthdays & Community Events
              </p>
            </div>
          </div>

          {/* Center: Event Selector */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                aria-label="Select active event plan"
                value={activeEvent.id}
                onChange={(e) => onSelectEvent(e.target.value)}
                className="bg-slate-800/90 text-slate-100 text-sm font-medium border border-slate-700 rounded-lg px-3 py-1.5 pr-8 focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer appearance-none shadow-sm hover:border-slate-600"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {getEventIcon(evt.eventType)} {evt.title} ({evt.eventType})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            <button
              onClick={onOpenNewEventModal}
              className="inline-flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-sm transition shadow-rose-600/30"
              title="Create new AI event plan"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">New Event</span>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Currency selector */}
            <select
              aria-label="Select currency"
              value={activeEvent.currency}
              onChange={(e) => onChangeCurrency(e.target.value as Currency)}
              className="bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 rounded-md px-2 py-1.5 focus:outline-none cursor-pointer"
              title="Change active currency"
            >
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
              <option value="INR">₹ INR</option>
              <option value="CAD">$ CAD</option>
              <option value="AUD">$ AUD</option>
            </select>

            {/* Print / PDF view */}
            <button
              onClick={onPrintReport}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700/60 transition"
              title="Print or Save PDF Event Master Plan"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Export JSON */}
            <button
              onClick={onExportJson}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700/60 transition"
              title="Backup & Export JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Gemini API Key */}
            <button
              onClick={onOpenApiKeyModal}
              className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition"
              title="Configure Gemini API Key"
            >
              <Key className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

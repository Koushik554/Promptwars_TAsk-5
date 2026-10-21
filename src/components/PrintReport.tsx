import React from 'react';
import { EventPlan } from '../types';
import { Printer, X, Sparkles, Calendar, MapPin, Users, DollarSign, CheckCircle2 } from 'lucide-react';

interface PrintReportProps {
  event: EventPlan;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReport: React.FC<PrintReportProps> = ({ event, isOpen, onClose }) => {
  if (!isOpen) return null;

  const totalPlanned = event.budgetItems.reduce((acc, b) => acc + b.planned, 0);
  const totalActual = event.budgetItems.reduce((acc, b) => acc + b.actual, 0);

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      default: return '$';
    }
  };
  const sym = getCurrencySymbol(event.currency);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 print:p-0 print:bg-white print:static print:h-auto">
      {/* Top Floating Control Bar (Hidden on print) */}
      <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <span className="text-sm font-semibold text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Print / PDF Event Master Dossier Preview</span>
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-1.5 shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print or Save PDF</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl print:shadow-none print:p-0 print:rounded-none print:max-w-none">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
              <span>CelebrAIte Executive Event Dossier</span>
              <span>•</span>
              <span className="capitalize">{event.eventType} Master Plan</span>
            </div>
            <h1 className="text-3xl font-black text-slate-950 tracking-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600 font-medium">
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{event.location}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-slate-500" />
                <span>{event.guestCount} Guests</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-right shrink-0">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider block">Target Budget</span>
            <span className="text-2xl font-black text-slate-950 font-mono">
              {sym}{event.targetBudget.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Allocated: {sym}{totalPlanned.toLocaleString()}
            </span>
          </div>
        </div>

        {/* AI Theme & Executive Vision */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
            Aesthetic Vision & Theme
          </h3>
          <p className="text-base font-bold text-slate-900 mb-2">
            "{event.vibeAndTheme}"
          </p>
          <p className="text-sm text-slate-700 leading-relaxed italic">
            {event.aiSummary}
          </p>

          {/* Color swatches */}
          <div className="flex items-center space-x-3 mt-4 pt-3 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Color Story:</span>
            {event.colorPalette?.map((c, i) => (
              <div key={i} className="flex items-center space-x-1">
                <div style={{ backgroundColor: c }} className="w-4 h-4 rounded-full border border-slate-300" />
                <span className="text-xs font-mono text-slate-600">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Itemized Budget Breakdown */}
        <div className="mb-8">
          <h2 className="text-lg font-black text-slate-900 mb-3 border-b pb-2">
            1. Financial Budget Breakdown
          </h2>
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-2 px-3">Item Name</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Planned ({sym})</th>
                <th className="py-2 px-3">Actual ({sym})</th>
                <th className="py-2 px-3">Paid</th>
                <th className="py-2 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {event.budgetItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 px-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-2 px-3 text-slate-600">{item.category}</td>
                  <td className="py-2 px-3 font-mono font-medium">{sym}{item.planned.toLocaleString()}</td>
                  <td className="py-2 px-3 font-mono">{sym}{item.actual.toLocaleString()}</td>
                  <td className="py-2 px-3 font-medium">{item.paid ? '✅ Paid' : '⏳ Pending'}</td>
                  <td className="py-2 px-3 text-slate-500">{item.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-300">
              <tr>
                <td colSpan={2} className="py-2 px-3 text-slate-900">Total</td>
                <td className="py-2 px-3 font-mono">{sym}{totalPlanned.toLocaleString()}</td>
                <td className="py-2 px-3 font-mono">{sym}{totalActual.toLocaleString()}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Day-Of Schedule & Key Milestones */}
        <div className="mb-8">
          <h2 className="text-lg font-black text-slate-900 mb-3 border-b pb-2">
            2. Master Day-Of Run-of-Show & Timeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Day-Of Timeline
              </h3>
              <div className="space-y-2">
                {event.timeline
                  .filter((t) => t.phase === 'day_of')
                  .sort((a, b) => (a.timeOfDay || '').localeCompare(b.timeOfDay || ''))
                  .map((t) => (
                    <div key={t.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          {t.timeOfDay || 'Time TBA'}
                        </span>
                        <span className="font-semibold text-slate-800">{t.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{t.completed ? '✅ Done' : '⏳ Open'}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Preparation Milestones
              </h3>
              <div className="space-y-2">
                {event.timeline
                  .filter((t) => t.phase !== 'day_of')
                  .slice(0, 6)
                  .map((t) => (
                    <div key={t.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800 block">{t.title}</span>
                        <span className="text-[10px] text-slate-500">{t.phase.replace(/_/g, ' ')} • {t.category}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{t.completed ? '✅ Done' : '⏳ Pending'}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vendors Roster */}
        <div className="mb-8">
          <h2 className="text-lg font-black text-slate-900 mb-3 border-b pb-2">
            3. Vendor Team & Contracts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {event.vendors.map((v) => (
              <div key={v.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  {v.category.replace('_', ' ')}
                </span>
                <h4 className="font-bold text-slate-900 mt-1">{v.name}</h4>
                {v.contactName && <p className="text-slate-600 mt-0.5">{v.contactName}</p>}
                {v.phone && <p className="text-slate-500 mt-0.5">{v.phone}</p>}
                {v.email && <p className="text-slate-500">{v.email}</p>}
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-700 capitalize">{v.status.replace('_', ' ')}</span>
                  <span className="text-slate-500">{v.contractSigned ? 'Contract Signed' : 'Pending Contract'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Creative Concepts */}
        <div className="mb-8">
          <h2 className="text-lg font-black text-slate-900 mb-3 border-b pb-2">
            4. Curated Creative Concepts & Hacks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {event.ideas.slice(0, 4).map((i) => (
              <div key={i.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-bold text-slate-900 block">{i.title}</span>
                <p className="text-slate-600 mt-1">{i.description}</p>
                {i.estimatedCostRange && (
                  <span className="inline-block mt-2 font-mono font-semibold text-emerald-700">
                    Est: {i.estimatedCostRange}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-300 pt-4 flex items-center justify-between text-[11px] text-slate-500">
          <span>Generated by CelebrAIte — GenAI Event Planning Assistant</span>
          <span>Printed on {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

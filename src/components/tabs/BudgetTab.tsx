import React, { useState } from 'react';
import { EventPlan, BudgetItem } from '../../types';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles, 
  PieChart, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface BudgetTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  onAskAi: (prompt: string) => void;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({
  event,
  onUpdateEvent,
  onAskAi,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // New item form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Catering & Beverages');
  const [planned, setPlanned] = useState<number>(500);
  const [actual, setActual] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Target budget edit
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetBudgetInput, setTargetBudgetInput] = useState(event.targetBudget);

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      default: return '$';
    }
  };
  const sym = getCurrencySymbol(event.currency);

  const totalPlanned = event.budgetItems.reduce((acc, b) => acc + b.planned, 0);
  const totalActual = event.budgetItems.reduce((acc, b) => acc + b.actual, 0);
  const variance = totalPlanned - event.targetBudget;
  const isOverPlanned = totalPlanned > event.targetBudget;

  // Group by category
  const categories = Array.from(new Set(event.budgetItems.map((b) => b.category)));
  const categorySummary = categories.map((cat) => {
    const items = event.budgetItems.filter((b) => b.category === cat);
    const catPlanned = items.reduce((acc, i) => acc + i.planned, 0);
    const catActual = items.reduce((acc, i) => acc + i.actual, 0);
    const percentageOfTotal = totalPlanned > 0 ? Math.round((catPlanned / totalPlanned) * 100) : 0;
    return { category: cat, items, catPlanned, catActual, percentageOfTotal };
  });

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingItem) {
      const updatedList = event.budgetItems.map((item) =>
        item.id === editingItem.id
          ? { ...item, name, category, planned: Number(planned), actual: Number(actual), notes }
          : item
      );
      onUpdateEvent({ ...event, budgetItems: updatedList });
      setEditingItem(null);
    } else {
      const newItem: BudgetItem = {
        id: `b_${Date.now()}`,
        name,
        category,
        planned: Number(planned),
        actual: Number(actual),
        paid: false,
        notes,
      };
      onUpdateEvent({ ...event, budgetItems: [...event.budgetItems, newItem] });
    }

    setName('');
    setPlanned(500);
    setActual(0);
    setNotes('');
    setShowAddModal(false);
  };

  const handleEditClick = (item: BudgetItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPlanned(item.planned);
    setActual(item.actual);
    setNotes(item.notes || '');
    setShowAddModal(true);
  };

  const handleDeleteItem = (id: string) => {
    const updated = event.budgetItems.filter((b) => b.id !== id);
    onUpdateEvent({ ...event, budgetItems: updated });
  };

  const handleTogglePaid = (id: string) => {
    const updated = event.budgetItems.map((b) =>
      b.id === id ? { ...b, paid: !b.paid } : b
    );
    onUpdateEvent({ ...event, budgetItems: updated });
  };

  const handleSaveTargetBudget = () => {
    onUpdateEvent({ ...event, targetBudget: Number(targetBudgetInput) });
    setIsEditingTarget(false);
  };

  return (
    <div className="space-y-6">
      {/* Target Budget & Financial Health Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Target Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Target Budget</span>
            <button
              onClick={() => setIsEditingTarget(!isEditingTarget)}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingTarget ? 'Cancel' : 'Edit'}</span>
            </button>
          </div>

          {isEditingTarget ? (
            <div className="mt-2 flex items-center space-x-2">
              <input
                type="number"
                value={targetBudgetInput}
                onChange={(e) => setTargetBudgetInput(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-white font-bold text-xl px-2 py-1 rounded w-36 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <button
                onClick={handleSaveTargetBudget}
                className="bg-rose-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-rose-500"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="mt-2 text-2xl font-black text-white">
              {sym}{event.targetBudget.toLocaleString()}
            </div>
          )}
          <p className="text-xs text-slate-400 mt-1">
            Total target for {event.guestCount} guests (~{sym}{Math.round(event.targetBudget / (event.guestCount || 1))}/person)
          </p>
        </div>

        {/* Total Planned Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Allocated Items</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-300">
            {sym}{totalPlanned.toLocaleString()}
          </div>
          <div className="text-xs mt-1 flex items-center space-x-1">
            {isOverPlanned ? (
              <span className="text-rose-400 font-semibold flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Over budget by {sym}{Math.abs(variance).toLocaleString()}</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Under target by {sym}{Math.abs(variance).toLocaleString()}</span>
              </span>
            )}
          </div>
        </div>

        {/* Actual Paid Out Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Actual Out-of-Pocket</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-sky-300">
            {sym}{totalActual.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {sym}{Math.max(0, event.targetBudget - totalActual).toLocaleString()} remaining in cash reserves
          </p>
        </div>
      </div>

      {/* AI Budget Optimization Banner */}
      <div className="bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900 border border-rose-800/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-rose-200">
              GenAI Budget Advisor
            </h4>
            <p className="text-xs text-slate-400">
              Need to cut costs or find hidden savings? Let our AI analyze category ratios and suggest realistic trims.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onAskAi(`Please analyze our current ${event.title} budget of ${sym}${event.targetBudget} with ${sym}${totalPlanned} allocated. Where can we save 15% without reducing guest satisfaction?`)}
            className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium px-3.5 py-2 rounded-xl transition shadow-sm flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Cost-Cut Strategy</span>
          </button>
        </div>
      </div>

      {/* Category Proportional Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-rose-400" />
            <span>Category Spending Allocation</span>
          </h3>
          <span className="text-xs text-slate-400">{categories.length} categories</span>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800 mb-4">
          {categorySummary.map((cat, i) => {
            const colors = ['bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
            const color = colors[i % colors.length];
            return (
              <div
                key={cat.category}
                className={`${color} h-full transition-all`}
                style={{ width: `${cat.percentageOfTotal}%` }}
                title={`${cat.category}: ${cat.percentageOfTotal}% (${sym}${cat.catPlanned.toLocaleString()})`}
              />
            );
          })}
        </div>

        {/* Category breakdown pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {categorySummary.map((cat, i) => {
            const dotColors = ['bg-rose-400', 'bg-amber-400', 'bg-sky-400', 'bg-emerald-400', 'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-teal-400'];
            return (
              <div key={cat.category} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5">
                <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-medium truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dotColors[i % dotColors.length]}`} />
                  <span className="truncate">{cat.category}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="font-bold text-white">{sym}{cat.catPlanned.toLocaleString()}</span>
                  <span className="text-slate-400">{cat.percentageOfTotal}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Itemized Budget Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">Itemized Expenses</h3>
            <p className="text-xs text-slate-400">Track quotes, estimates, and actual invoices</p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setName('');
              setCategory('Catering & Beverages');
              setPlanned(500);
              setActual(0);
              setNotes('');
              setShowAddModal(true);
            }}
            className="inline-flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense Item</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Item & Category</th>
                <th className="py-3 px-4">Planned</th>
                <th className="py-3 px-4">Actual Spend</th>
                <th className="py-3 px-4 text-center">Paid</th>
                <th className="py-3 px-4 hidden md:table-cell">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {event.budgetItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{item.name}</div>
                    <span className="text-xs text-rose-400/90">{item.category}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-200">
                    {sym}{item.planned.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className={item.actual > item.planned ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {sym}{item.actual.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleTogglePaid(item.id)}
                      className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition border ${
                        item.paid
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-500'
                      }`}
                      title={item.paid ? 'Mark as Unpaid' : 'Mark as Paid'}
                    >
                      {item.paid && <Check className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400 max-w-xs truncate hidden md:table-cell">
                    {item.notes || '—'}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                      title="Edit item"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Line Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingItem ? 'Edit Budget Item' : 'Add New Budget Item'}
            </h3>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding Photographer, DJ Booth, Birthday Cake"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Venue & Permits">Venue & Permits</option>
                  <option value="Catering & Beverages">Catering & Beverages</option>
                  <option value="Decor & Florals">Decor & Florals</option>
                  <option value="Entertainment & AV">Entertainment & AV</option>
                  <option value="Photography & Videography">Photography & Videography</option>
                  <option value="Stationery, Favors & Gifts">Stationery, Favors & Gifts</option>
                  <option value="Logistics & Safety">Logistics & Safety</option>
                  <option value="Emergency Contingency">Emergency Contingency</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Planned ({sym})
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={planned}
                    onChange={(e) => setPlanned(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Actual Spent ({sym})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={actual}
                    onChange={(e) => setActual(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Notes / Quotes
                </label>
                <textarea
                  rows={2}
                  placeholder="Includes setup fee, deposit due 30 days prior..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
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
                  {editingItem ? 'Save Changes' : 'Add Line Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

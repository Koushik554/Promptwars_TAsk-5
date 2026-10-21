import React, { useState } from 'react';
import { EventPlan, Guest } from '../../types';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Utensils, 
  Sparkles, 
  Search, 
  Trash2, 
  Copy, 
  Check 
} from 'lucide-react';

interface GuestsTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  onAskAi: (prompt: string) => void;
}

export const GuestsTab: React.FC<GuestsTabProps> = ({
  event,
  onUpdateEvent,
  onAskAi,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [copiedReminder, setCopiedReminder] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Guest['status']>('pending');
  const [plusOnes, setPlusOnes] = useState<number>(0);
  const [dietary, setDietary] = useState('');
  const [tableOrGroup, setTableOrGroup] = useState('Table 1');

  // Headcount calculations
  const confirmedCount = event.guests
    .filter((g) => g.status === 'confirmed')
    .reduce((acc, g) => acc + 1 + (g.plusOnes || 0), 0);

  const pendingCount = event.guests
    .filter((g) => g.status === 'pending')
    .reduce((acc, g) => acc + 1 + (g.plusOnes || 0), 0);

  const declinedCount = event.guests
    .filter((g) => g.status === 'declined')
    .reduce((acc, g) => acc + 1 + (g.plusOnes || 0), 0);

  // Dietary counts
  const dietaryMap: Record<string, number> = {};
  event.guests.forEach((g) => {
    if (g.dietaryRestrictions && g.dietaryRestrictions !== 'None') {
      const diets = g.dietaryRestrictions.split(',').map((d) => d.trim());
      diets.forEach((d) => {
        dietaryMap[d] = (dietaryMap[d] || 0) + 1;
      });
    }
  });

  const handleStatusChange = (id: string, newStatus: Guest['status']) => {
    const updated = event.guests.map((g) =>
      g.id === id ? { ...g, status: newStatus } : g
    );
    onUpdateEvent({ ...event, guests: updated });
  };

  const handleDeleteGuest = (id: string) => {
    const updated = event.guests.filter((g) => g.id !== id);
    onUpdateEvent({ ...event, guests: updated });
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newGuest: Guest = {
      id: `g_${Date.now()}`,
      name,
      email,
      status,
      plusOnes: Number(plusOnes),
      dietaryRestrictions: dietary.trim() || 'None',
      tableOrGroup,
    };

    onUpdateEvent({ ...event, guests: [...event.guests, newGuest] });
    setName('');
    setEmail('');
    setPlusOnes(0);
    setDietary('');
    setShowAddModal(false);
  };

  const reminderMessage = `Hey there! 🌟 We're finalizing catering headcounts and seating for ${event.title} happening on ${new Date(event.date).toLocaleDateString()}.

Could you please let us know if you and your plus-one will be able to make it by this Friday? We'd love to celebrate with you! 🥂

RSVP link or simply reply to this text. Can't wait!`;

  const copyReminder = () => {
    navigator.clipboard.writeText(reminderMessage);
    setCopiedReminder(true);
    setTimeout(() => setCopiedReminder(false), 2000);
  };

  const filteredGuests = event.guests.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.tableOrGroup && g.tableOrGroup.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* RSVP Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Planned Target */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Target Capacity</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {event.guestCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">Maximum venue capacity</p>
        </div>

        {/* Confirmed Attending */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>Confirmed Coming</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-300">
            {confirmedCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {Math.round((confirmedCount / (event.guestCount || 1)) * 100)}% of target attendance
          </p>
        </div>

        {/* Pending RSVP */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>Awaiting Response</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-300">
            {pendingCount}
          </div>
          <button
            onClick={() => setShowReminderModal(true)}
            className="text-[11px] text-amber-400 hover:text-amber-300 underline mt-1 block"
          >
            Send AI Nudge Reminder
          </button>
        </div>

        {/* Declined */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cannot Attend</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-300">
            {declinedCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">Declined invitations</p>
        </div>
      </div>

      {/* Dietary Summary Banner */}
      {Object.keys(dietaryMap).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-sky-400">
            <Utensils className="w-4 h-4 shrink-0" />
            <span>Special Dietary Requirements for Caterer:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(dietaryMap).map(([diet, count]) => (
              <span
                key={diet}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20"
              >
                {diet}: <strong>{count} guests</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table & Search Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search guest or table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowReminderModal(true)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-3 py-2 rounded-xl flex items-center space-x-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI RSVP Reminder</span>
            </button>

            <button
              onClick={() => {
                setName('');
                setEmail('');
                setStatus('pending');
                setPlusOnes(0);
                setDietary('');
                setShowAddModal(true);
              }}
              className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold px-3 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Guest</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">RSVP Status</th>
                <th className="py-3 px-4 text-center">+1 Count</th>
                <th className="py-3 px-4">Seating / Group</th>
                <th className="py-3 px-4">Dietary Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{guest.name}</div>
                    {guest.email && <span className="text-xs text-slate-400">{guest.email}</span>}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      aria-label={`RSVP status for ${guest.name}`}
                      value={guest.status}
                      onChange={(e) => handleStatusChange(guest.id, e.target.value as Guest['status'])}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer focus:outline-none ${
                        guest.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : guest.status === 'declined'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="declined">Declined</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-300">
                    {guest.plusOnes > 0 ? `+${guest.plusOnes}` : '0'}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-300 font-medium">
                    {guest.tableOrGroup || 'Unassigned'}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400">
                    {guest.dietaryRestrictions && guest.dietaryRestrictions !== 'None' ? (
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        {guest.dietaryRestrictions}
                      </span>
                    ) : (
                      'None'
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteGuest(guest.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                      title="Remove Guest"
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

      {/* AI Reminder Nudge Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  GenAI Polite RSVP Nudge Template
                </h3>
              </div>
              <button
                onClick={() => setShowReminderModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap">
              {reminderMessage}
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-slate-400">
                Send to {pendingCount} awaiting guests via SMS or WhatsApp
              </span>
              <button
                onClick={copyReminder}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-1.5 shadow-sm transition"
              >
                {copiedReminder ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReminder ? 'Copied to Clipboard!' : 'Copy Text'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add Guest</h3>
            <form onSubmit={handleAddGuest} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    RSVP Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Plus-Ones (+1s)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={plusOnes}
                    onChange={(e) => setPlusOnes(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Table / Group
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Table 2 or VIP"
                    value={tableOrGroup}
                    onChange={(e) => setTableOrGroup(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vegan, Gluten-Free"
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="jordan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

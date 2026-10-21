import React, { useState } from 'react';
import { EventPlan, Vendor } from '../../types';
import { 
  Briefcase, 
  Plus, 
  Mail, 
  Phone, 
  CheckCircle, 
  FileText, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  ExternalLink,
  DollarSign
} from 'lucide-react';

interface VendorsTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  onAskAi: (prompt: string) => void;
}

export const VendorsTab: React.FC<VendorsTabProps> = ({
  event,
  onUpdateEvent,
  onAskAi,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [rfpVendor, setRfpVendor] = useState<Vendor | null>(null);
  const [copiedRfp, setCopiedRfp] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Vendor['category']>('venue');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<Vendor['status']>('to_research');
  const [quotedPrice, setQuotedPrice] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      default: return '$';
    }
  };
  const sym = getCurrencySymbol(event.currency);

  const statusLabels: Record<Vendor['status'], { label: string; bg: string; text: string }> = {
    to_research: { label: 'To Research', bg: 'bg-slate-800', text: 'text-slate-300' },
    contacted: { label: 'Inquiry Sent', bg: 'bg-amber-500/20', text: 'text-amber-300' },
    proposal_received: { label: 'Quote Received', bg: 'bg-sky-500/20', text: 'text-sky-300' },
    booked: { label: 'Vendor Booked', bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
    deposit_paid: { label: 'Deposit Paid', bg: 'bg-purple-500/20', text: 'text-purple-300' },
    completed: { label: 'Fulfilled', bg: 'bg-green-600/30', text: 'text-green-200' },
  };

  const handleStatusChange = (id: string, newStatus: Vendor['status']) => {
    const updated = event.vendors.map((v) =>
      v.id === id ? { ...v, status: newStatus } : v
    );
    onUpdateEvent({ ...event, vendors: updated });
  };

  const handleContractToggle = (id: string) => {
    const updated = event.vendors.map((v) =>
      v.id === id ? { ...v, contractSigned: !v.contractSigned } : v
    );
    onUpdateEvent({ ...event, vendors: updated });
  };

  const handleDeleteVendor = (id: string) => {
    const updated = event.vendors.filter((v) => v.id !== id);
    onUpdateEvent({ ...event, vendors: updated });
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingVendor) {
      const updatedList = event.vendors.map((v) =>
        v.id === editingVendor.id
          ? {
              ...v,
              name,
              category,
              contactName,
              email,
              phone,
              status,
              quotedPrice: Number(quotedPrice),
              notes,
            }
          : v
      );
      onUpdateEvent({ ...event, vendors: updatedList });
      setEditingVendor(null);
    } else {
      const newVendor: Vendor = {
        id: `v_${Date.now()}`,
        name,
        category,
        contactName,
        email,
        phone,
        status,
        quotedPrice: Number(quotedPrice),
        contractSigned: false,
        notes,
      };
      onUpdateEvent({ ...event, vendors: [...event.vendors, newVendor] });
    }

    setName('');
    setContactName('');
    setEmail('');
    setPhone('');
    setQuotedPrice(0);
    setNotes('');
    setShowAddModal(false);
  };

  const generateRfpText = (v: Vendor) => {
    return `Subject: Partnership Inquiry: ${event.title} (${new Date(event.date).toLocaleDateString()})

Dear ${v.contactName || v.name + ' Team'},

I hope this message finds you well!

We are planning an upcoming ${event.eventType} celebration — "${event.title}" — taking place on ${new Date(event.date).toLocaleDateString()} in ${event.location}.

Key Event Specs:
- Estimated Guest Count: ${event.guestCount}
- Overall Vibe & Style: ${event.vibeAndTheme}
- Allocated Category Range: ~${sym}${(v.quotedPrice || 2000).toLocaleString()}

We love your work and feel your services would be a tremendous fit for our vision. Could you kindly provide:
1. Availability for ${new Date(event.date).toLocaleDateString()}
2. Current package options and sample pricing/menus/portfolios
3. Overtime policies, deposit structure, and setup requirements

Thank you for your time and guidance. Looking forward to connecting soon!

Best regards,
Event Planning Team
${event.title}`;
  };

  const copyRfp = () => {
    if (!rfpVendor) return;
    navigator.clipboard.writeText(generateRfpText(rfpVendor));
    setCopiedRfp(true);
    setTimeout(() => setCopiedRfp(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-rose-400" />
            <span>Vendor Management Checklist</span>
          </h3>
          <p className="text-xs text-slate-400">
            Track inquiries, quotes, signed contracts, and generate automated AI inquiry letters
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onAskAi(`Help me write questions and contract negotiation terms for our ${event.eventType} vendors in ${event.location}. What clauses must we include?`)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-3 py-2 rounded-xl flex items-center space-x-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Negotiation Tips</span>
          </button>

          <button
            onClick={() => {
              setEditingVendor(null);
              setName('');
              setContactName('');
              setEmail('');
              setPhone('');
              setQuotedPrice(0);
              setNotes('');
              setShowAddModal(true);
            }}
            className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold px-3 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {event.vendors.map((vendor) => {
          const statusStyle = statusLabels[vendor.status] || statusLabels.to_research;
          return (
            <div
              key={vendor.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {vendor.category.replace('_', ' ')}
                  </span>
                  <select
                    aria-label={`Update status for ${vendor.name}`}
                    value={vendor.status}
                    onChange={(e) => handleStatusChange(vendor.id, e.target.value as Vendor['status'])}
                    className={`text-xs font-semibold px-2 py-1 rounded-lg border border-slate-700 cursor-pointer ${statusStyle.bg} ${statusStyle.text} focus:outline-none`}
                  >
                    <option value="to_research">To Research</option>
                    <option value="contacted">Inquiry Sent</option>
                    <option value="proposal_received">Quote Received</option>
                    <option value="booked">Booked</option>
                    <option value="deposit_paid">Deposit Paid</option>
                    <option value="completed">Fulfilled</option>
                  </select>
                </div>

                <h4 className="text-lg font-bold text-white mt-3 group-hover:text-rose-300 transition">
                  {vendor.name}
                </h4>
                {vendor.contactName && (
                  <p className="text-xs text-slate-400 mt-0.5">Contact: {vendor.contactName}</p>
                )}

                {/* Contact info */}
                <div className="space-y-1 mt-3 text-xs text-slate-300">
                  {vendor.email && (
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <a href={`mailto:${vendor.email}`} className="hover:underline truncate">
                        {vendor.email}
                      </a>
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.quotedPrice ? (
                    <div className="flex items-center space-x-2 text-emerald-400 font-mono font-medium">
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      <span>Quote: {sym}{vendor.quotedPrice.toLocaleString()}</span>
                    </div>
                  ) : null}
                </div>

                {vendor.notes && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mt-3">
                    "{vendor.notes}"
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleContractToggle(vendor.id)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition ${
                    vendor.contractSigned
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{vendor.contractSigned ? 'Contract Signed' : 'No Contract'}</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setRfpVendor(vendor)}
                    className="p-1.5 text-amber-400 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition"
                    title="Generate RFP Inquiry Email with AI"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingVendor(vendor);
                      setName(vendor.name);
                      setCategory(vendor.category);
                      setContactName(vendor.contactName || '');
                      setEmail(vendor.email || '');
                      setPhone(vendor.phone || '');
                      setStatus(vendor.status);
                      setQuotedPrice(vendor.quotedPrice || 0);
                      setNotes(vendor.notes || '');
                      setShowAddModal(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                    title="Edit Vendor"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteVendor(vendor.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition"
                    title="Delete Vendor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI RFP / Email Inquiry Modal */}
      {rfpVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  GenAI Vendor Inquiry Draft: {rfpVendor.name}
                </h3>
              </div>
              <button
                onClick={() => setRfpVendor(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-80 overflow-y-auto">
              {generateRfpText(rfpVendor)}
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-slate-400">
                Ready to send via email or vendor portal.
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={copyRfp}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-1.5 shadow-sm transition"
                >
                  {copiedRfp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRfp ? 'Copied to Clipboard!' : 'Copy Email Draft'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingVendor ? 'Edit Vendor Details' : 'Add New Vendor'}
            </h3>
            <form onSubmit={handleSaveVendor} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skyline Acoustics & Lighting"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Vendor['category'])}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="venue">Venue</option>
                    <option value="catering">Catering & Bar</option>
                    <option value="photography">Photography & Video</option>
                    <option value="music_audio">Music & DJ / Audio</option>
                    <option value="decor_florist">Florist & Decor</option>
                    <option value="cake_dessert">Cake & Dessert</option>
                    <option value="attire">Attire & Styling</option>
                    <option value="transport_security">Transport & Security</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Vendor['status'])}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="to_research">To Research</option>
                    <option value="contacted">Inquiry Sent</option>
                    <option value="proposal_received">Quote Received</option>
                    <option value="booked">Booked</option>
                    <option value="deposit_paid">Deposit Paid</option>
                    <option value="completed">Fulfilled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Quoted Price ({sym})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="info@vendor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Notes & Special Inclusions
                </label>
                <textarea
                  rows={2}
                  placeholder="Includes 2 assistants, sound system, travel fees..."
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
                  {editingVendor ? 'Save Changes' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

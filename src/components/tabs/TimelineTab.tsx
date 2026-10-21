import React, { useState } from 'react';
import { EventPlan, TimelineMilestone } from '../../types';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Sparkles, 
  Calendar, 
  Trash2, 
  CheckSquare, 
  ListFilter,
  Flame,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TimelineTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  onAskAi: (prompt: string) => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  event,
  onUpdateEvent,
  onAskAi,
}) => {
  const [activeView, setActiveView] = useState<'milestones' | 'day_of'>('milestones');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState<TimelineMilestone['phase']>('1_to_2_months');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('Logistics');
  const [timeOfDay, setTimeOfDay] = useState('10:00 AM');

  const handleToggleComplete = (id: string) => {
    const targetItem = event.timeline.find((t) => t.id === id);
    const willBeCompleted = targetItem ? !targetItem.completed : false;

    if (willBeCompleted) {
      // Fire confetti celebration!
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#e11d48', '#f59e0b', '#38bdf8', '#10b981'],
      });
    }

    const updated = event.timeline.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdateEvent({ ...event, timeline: updated });
  };

  const handleDeleteItem = (id: string) => {
    const updated = event.timeline.filter((item) => item.id !== id);
    onUpdateEvent({ ...event, timeline: updated });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: TimelineMilestone = {
      id: `t_${Date.now()}`,
      title,
      phase,
      dueDate: event.date,
      completed: false,
      priority,
      category,
      timeOfDay: phase === 'day_of' ? timeOfDay : undefined,
    };

    onUpdateEvent({ ...event, timeline: [...event.timeline, newItem] });
    setTitle('');
    setShowAddModal(false);
  };

  // Filter items
  const milestoneItems = event.timeline.filter((t) => t.phase !== 'day_of');
  const dayOfItems = event.timeline
    .filter((t) => t.phase === 'day_of')
    .sort((a, b) => (a.timeOfDay || '').localeCompare(b.timeOfDay || ''));

  const filteredMilestones = selectedPhase === 'all'
    ? milestoneItems
    : milestoneItems.filter((t) => t.phase === selectedPhase);

  const phaseLabels: Record<string, string> = {
    '6_plus_months': '6+ Months Before',
    '3_to_6_months': '3-6 Months Before',
    '1_to_2_months': '1-2 Months Before',
    'week_of': 'Week Of Event',
    'post_event': 'Post-Event Wrap-up',
  };

  const completedCount = event.timeline.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* View Switcher & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveView('milestones')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeView === 'milestones'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Master Milestones ({milestoneItems.length})</span>
          </button>
          <button
            onClick={() => setActiveView('day_of')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeView === 'day_of'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Day-Of Run-of-Show ({dayOfItems.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onAskAi(`Review the day-of run-of-show timeline for ${event.title}. Are there any tight transitions, buffer gaps, or missed vendor coordination steps?`)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-3 py-2 rounded-xl flex items-center space-x-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Schedule Audit</span>
          </button>

          <button
            onClick={() => {
              setPhase(activeView === 'day_of' ? 'day_of' : '1_to_2_months');
              setShowAddModal(true);
            }}
            className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold px-3 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{activeView === 'day_of' ? 'Add Schedule Block' : 'Add Milestone'}</span>
          </button>
        </div>
      </div>

      {/* Milestones View */}
      {activeView === 'milestones' && (
        <div className="space-y-4">
          {/* Phase Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedPhase('all')}
              className={`px-3 py-1.5 rounded-lg font-medium shrink-0 transition ${
                selectedPhase === 'all'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Phases ({milestoneItems.length})
            </button>
            {Object.entries(phaseLabels).map(([key, label]) => {
              const count = milestoneItems.filter((t) => t.phase === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedPhase(key)}
                  className={`px-3 py-1.5 rounded-lg font-medium shrink-0 transition ${
                    selectedPhase === key
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>

          {/* Milestone List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden">
            {filteredMilestones.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No milestones in this phase yet. Click "+ Add Milestone" to plan one!
              </div>
            ) : (
              filteredMilestones.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition ${
                    item.completed ? 'opacity-60 bg-slate-950/40' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <button
                      onClick={() => handleToggleComplete(item.id)}
                      className="text-slate-400 hover:text-rose-400 transition shrink-0"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        item.completed ? 'line-through text-slate-400' : 'text-white'
                      }`}>
                        {item.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {phaseLabels[item.phase] || item.phase}
                        </span>
                        <span>•</span>
                        <span className="text-slate-300">{item.category}</span>
                        {item.priority === 'high' && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px] uppercase">
                            High Priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition"
                      title="Delete milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Day-Of Run-Of-Show View */}
      {activeView === 'day_of' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Day-Of Master Run of Show:</strong> Minute-by-minute schedule to ensure flawless execution on {new Date(event.date).toLocaleDateString()}.
              </span>
            </div>
            <button
              onClick={() => onAskAi(`Generate a detailed 12-hour day-of run-of-show schedule for ${event.title} (${event.eventType}) with 15-minute buffers for guest transitions.`)}
              className="underline text-amber-300 hover:text-amber-100 shrink-0 font-medium ml-2"
            >
              Ask AI to Expand
            </button>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-700">
            {dayOfItems.map((item, idx) => (
              <div key={item.id} className="relative flex items-start space-x-4">
                {/* Node icon */}
                <div className={`absolute -left-6 sm:-left-8 mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-slate-900 ${
                  item.completed
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-rose-500 text-rose-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${item.completed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </div>

                {/* Content Box */}
                <div className={`w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm transition hover:border-slate-700 ${
                  item.completed ? 'opacity-60 bg-slate-950/50' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30">
                      {item.timeOfDay || '00:00'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleComplete(item.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition border ${
                          item.completed
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                      >
                        {item.completed ? 'Completed' : 'Mark Done'}
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-white mt-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Category: <span className="text-slate-300">{item.category}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {activeView === 'day_of' ? 'Add Schedule Timeblock' : 'Add Milestone Task'}
            </h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Task / Schedule Title
                </label>
                <input
                  type="text"
                  required
                  placeholder={activeView === 'day_of' ? 'e.g. Catering Plated Dinner Commences' : 'e.g. Finalize Photographer Shot List'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {activeView === 'day_of' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 02:30 PM"
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Preparation Phase
                  </label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="6_plus_months">6+ Months Before</option>
                    <option value="3_to_6_months">3-6 Months Before</option>
                    <option value="1_to_2_months">1-2 Months Before</option>
                    <option value="week_of">Week Of Event</option>
                    <option value="day_of">Day-Of</option>
                    <option value="post_event">Post-Event Wrap-up</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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
                  Add to Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

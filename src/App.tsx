import React, { useState, useEffect } from 'react';
import { EventPlan, Currency, GenerateEventPrompt } from './types';
import { 
  loadEventsFromStorage, 
  saveEventsToStorage, 
  getActiveEventId, 
  setActiveEventId, 
  exportEventsJson,
  getSampleEvents
} from './services/storageService';
import { generateEventPlanWithAI } from './services/aiService';

import { Navbar } from './components/Navbar';
import { EventOverview } from './components/EventOverview';
import { BudgetTab } from './components/tabs/BudgetTab';
import { TimelineTab } from './components/tabs/TimelineTab';
import { VendorsTab } from './components/tabs/VendorsTab';
import { IdeasTab } from './components/tabs/IdeasTab';
import { GuestsTab } from './components/tabs/GuestsTab';
import { AiCopilotTab } from './components/tabs/AiCopilotTab';
import { NewEventModal } from './components/NewEventModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PrintReport } from './components/PrintReport';
import confetti from 'canvas-confetti';

export function App() {
  const [events, setEvents] = useState<EventPlan[]>(() => loadEventsFromStorage());
  const [activeEventId, setActiveIdState] = useState<string>(() => {
    const stored = getActiveEventId();
    const initialEvents = loadEventsFromStorage();
    if (stored && initialEvents.some((e) => e.id === stored)) {
      return stored;
    }
    return initialEvents[0]?.id || '';
  });

  const [activeTab, setActiveTab] = useState<string>('budget');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copilotExternalPrompt, setCopilotExternalPrompt] = useState<string | undefined>(undefined);

  // Sync to localStorage whenever events change
  useEffect(() => {
    if (events.length > 0) {
      saveEventsToStorage(events);
    }
  }, [events]);

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  const handleSelectEvent = (id: string) => {
    setActiveIdState(id);
    setActiveEventId(id);
  };

  const handleUpdateActiveEvent = (updated: EventPlan) => {
    const newEvents = events.map((e) => (e.id === updated.id ? updated : e));
    setEvents(newEvents);
  };

  const handleChangeCurrency = (curr: Currency) => {
    if (!activeEvent) return;
    const updated = { ...activeEvent, currency: curr };
    handleUpdateActiveEvent(updated);
  };

  const handleCreateNewEvent = async (prompt: GenerateEventPrompt) => {
    setIsGenerating(true);
    try {
      const newPlan = await generateEventPlanWithAI(prompt);
      const updatedEvents = [newPlan, ...events];
      setEvents(updatedEvents);
      setActiveIdState(newPlan.id);
      setActiveEventId(newPlan.id);
      setIsNewModalOpen(false);

      // Trigger celebration
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Failed to generate event:', err);
      alert('Encountered an issue generating the event plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAskAiFromTab = (prompt: string) => {
    setCopilotExternalPrompt(prompt);
    setActiveTab('copilot');
  };

  if (!activeEvent) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">No active event found</h2>
          <button
            onClick={() => {
              const presets = getSampleEvents();
              setEvents(presets);
              setActiveIdState(presets[0].id);
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold"
          >
            Load Sample Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        events={events}
        activeEvent={activeEvent}
        onSelectEvent={handleSelectEvent}
        onOpenNewEventModal={() => setIsNewModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onExportJson={() => exportEventsJson(events)}
        onPrintReport={() => setIsPrintOpen(true)}
        onChangeCurrency={handleChangeCurrency}
      />

      {/* Event Header & KPI Overview */}
      <EventOverview
        event={activeEvent}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'budget' && (
          <BudgetTab
            event={activeEvent}
            onUpdateEvent={handleUpdateActiveEvent}
            onAskAi={handleAskAiFromTab}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineTab
            event={activeEvent}
            onUpdateEvent={handleUpdateActiveEvent}
            onAskAi={handleAskAiFromTab}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorsTab
            event={activeEvent}
            onUpdateEvent={handleUpdateActiveEvent}
            onAskAi={handleAskAiFromTab}
          />
        )}

        {activeTab === 'ideas' && (
          <IdeasTab
            event={activeEvent}
            onUpdateEvent={handleUpdateActiveEvent}
            onAskAi={handleAskAiFromTab}
          />
        )}

        {activeTab === 'guests' && (
          <GuestsTab
            event={activeEvent}
            onUpdateEvent={handleUpdateActiveEvent}
            onAskAi={handleAskAiFromTab}
          />
        )}

        {activeTab === 'copilot' && (
          <AiCopilotTab
            event={activeEvent}
            onUpdateEvent={handleUpdateActiveEvent}
            externalPrompt={copilotExternalPrompt}
            onClearExternalPrompt={() => setCopilotExternalPrompt(undefined)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CelebrAIte — Autonomous GenAI Event Planning Assistant</span>
          <span className="text-slate-400">
            Weddings • Birthdays • Community Festivals • Galas
          </span>
        </div>
      </footer>

      {/* Modals */}
      <NewEventModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onGenerate={handleCreateNewEvent}
        isLoading={isGenerating}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      <PrintReport
        event={activeEvent}
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
      />
    </div>
  );
}

export default App;

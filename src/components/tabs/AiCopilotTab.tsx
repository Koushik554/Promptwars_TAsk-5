import React, { useState, useRef, useEffect } from 'react';
import { EventPlan, ChatMessage } from '../../types';
import { sendAiChatMessage } from '../../services/aiService';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  DollarSign, 
  Calendar, 
  Users, 
  Lightbulb, 
  Check, 
  Copy,
  Briefcase
} from 'lucide-react';

interface AiCopilotTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
}

export const AiCopilotTab: React.FC<AiCopilotTabProps> = ({
  event,
  onUpdateEvent,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState('Master Event Director');

  const chatEndRef = useRef<HTMLDivElement>(null);

  const personas = [
    { title: 'Master Event Director', icon: '✨', desc: 'Holistic vision & run-of-show orchestration' },
    { title: 'Budget & Negotiation Optimizer', icon: '💰', desc: 'Contract terms & cost-saving trims' },
    { title: 'Aesthetic & Sensory Designer', icon: '🎨', desc: 'Theme, florals, lighting & vibes' },
    { title: 'Crowd & Entertainment Host', icon: '🎉', desc: 'Music playlists, games & guest flow' },
  ];

  const quickPrompts = [
    `How can we trim 15% from our ${event.title} budget without guests noticing?`,
    `Suggest 3 signature cocktails and mocktails matching our "${event.vibeAndTheme}" vibe.`,
    `What are the top 5 unexpected day-of emergencies to pack in our coordinator kit?`,
    `Draft an inquiry letter for a high-end photographer for ${event.guestCount} guests in ${event.location}.`,
    `Generate 4 engaging icebreakers or interactive entertainment ideas for our guests.`,
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [event.chatHistory, loading]);

  useEffect(() => {
    if (externalPrompt) {
      handleSendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...event.chatHistory, userMsg];
    onUpdateEvent({ ...event, chatHistory: updatedHistory });
    setInputMessage('');
    setLoading(true);

    try {
      const replyText = await sendAiChatMessage(
        `[Role: ${selectedPersona}] ${text}`,
        event
      );

      const aiMsg: ChatMessage = {
        id: `m_ai_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      onUpdateEvent({
        ...event,
        chatHistory: [...updatedHistory, aiMsg],
      });
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `m_err_${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ I ran into an issue connecting to the AI service. Please verify your internet connection or Gemini API key.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onUpdateEvent({
        ...event,
        chatHistory: [...updatedHistory, errorMsg],
      });
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (msg: ChatMessage) => {
    navigator.clipboard.writeText(msg.text);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    onUpdateEvent({
      ...event,
      chatHistory: [
        {
          id: `m_init_${Date.now()}`,
          sender: 'assistant',
          text: `✨ Chat history cleared! I am your CelebrAIte Copilot, ready to assist with **${event.title}**. What would you like to plan?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    });
  };

  return (
    <div className="space-y-4">
      {/* Persona Selector Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>CelebrAIte GenAI Concierge</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Context-Aware
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live intelligence with full visibility into your {event.title} numbers, timeline & vendors
            </p>
          </div>
        </div>

        {/* Persona Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {personas.map((p) => (
            <button
              key={p.title}
              onClick={() => setSelectedPersona(p.title)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition border ${
                selectedPersona === p.title
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title={p.desc}
            >
              <span>{p.icon}</span>
              <span>{p.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[580px] shadow-sm overflow-hidden">
        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {event.chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-rose-600 text-white'
                    : 'bg-gradient-to-tr from-amber-500 to-rose-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm shadow-sm relative group ${
                  msg.sender === 'user'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-950/90 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed markdown-body">
                  {msg.text}
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => copyMessage(msg)}
                      className="opacity-0 group-hover:opacity-100 transition flex items-center space-x-1 text-slate-400 hover:text-white"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>

                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-800">
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(act.label)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition"
                      >
                        ⚡ {act.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center space-x-2 text-xs text-rose-400">
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                <span>Thinking & synthesizing ideas with {selectedPersona}...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex space-x-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-slate-400 py-1 font-semibold flex items-center shrink-0">
            <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-400" />
            Quick Ideas:
          </span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 transition truncate max-w-xs border border-slate-700/60"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <button
              type="button"
              onClick={handleClearHistory}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title="Reset Chat History"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder={`Ask ${selectedPersona} about budgets, timelines, themes, or vendor contracts...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center space-x-1.5 shadow-md shadow-rose-600/30 transition"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

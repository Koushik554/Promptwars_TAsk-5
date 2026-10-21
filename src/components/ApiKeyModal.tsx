import React, { useState } from 'react';
import { getStoredApiKey, setStoredApiKey } from '../services/aiService';
import { Key, Sparkles, X, Check, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [keyInput, setKeyInput] = useState(getStoredApiKey());
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(keyInput.trim());
    setStatusMsg('API Key saved successfully! CelebrAIte will now use live Gemini 2.5 Flash.');
    setTimeout(() => {
      setStatusMsg(null);
      onClose();
    }, 1500);
  };

  const handleClear = () => {
    setKeyInput('');
    setStoredApiKey('');
    setStatusMsg('Key removed. Using built-in intelligent GenAI engine.');
    setTimeout(() => setStatusMsg(null), 1500);
  };

  const handleTestKey = async () => {
    if (!keyInput.trim()) {
      setStatusMsg('Please enter a key to test.');
      return;
    }
    setTesting(true);
    setStatusMsg(null);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyInput.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, respond with ONE word: Connected' }] }]
        })
      });
      if (res.ok) {
        setStatusMsg('✅ Live Connection Verified! Gemini 2.5 Flash is ready.');
      } else {
        const err = await res.json().catch(() => ({}));
        setStatusMsg(`❌ Connection Failed: ${err.error?.message || res.statusText}`);
      }
    } catch (e: any) {
      setStatusMsg(`❌ Network error: ${e.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Google Gemini API Settings
            </h3>
            <p className="text-xs text-slate-400">
              Optional: unlock unlimited live multi-turn LLM generation
            </p>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-4 space-y-2 text-xs text-slate-300">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Dual GenAI Architecture:</span>
          </div>
          <p>
            • <strong>Without an API Key:</strong> CelebrAIte operates seamlessly with its built-in algorithmic GenAI planning engine.
          </p>
          <p>
            • <strong>With a Gemini Key:</strong> Connects directly to Google's state-of-the-art <code>gemini-2.5-flash</code> model. Keys are stored strictly in your browser's <code>localStorage</code> and never transmitted to any third-party server.
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-400">
            Gemini API Key
          </label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:text-amber-300 flex items-center space-x-1"
            >
              <span>Get a free Gemini API key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            {keyInput && (
              <button
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-400"
              >
                Clear Key
              </button>
            )}
          </div>
        </div>

        {statusMsg && (
          <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200">
            {statusMsg}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testing || !keyInput.trim()}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
};

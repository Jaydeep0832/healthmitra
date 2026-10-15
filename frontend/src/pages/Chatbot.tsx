import React, { useEffect } from 'react';
import ChatHistory from '../components/Chatbot/ChatHistory';
import MultilingualInput from '../components/Chatbot/MultilingualInput';
import LanguageSelector from '../components/Chatbot/LanguageSelector';
import { useChatStore } from '../store/useChatStore';
import { Bot, Sparkles } from 'lucide-react';

export default function Chatbot() {
  const { fetchHistory } = useChatStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full w-full overflow-hidden bg-slate-50">
      {/* Top Header Bar for AI Assistant - Pinned, Non-scrolling */}
      <header className="shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-2.5 sm:px-6 flex items-center justify-between shadow-2xs z-10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-emerald-600/25">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                HealthMitra AI Assistant
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1 font-medium">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Evidence-based clinical triage • Multilingual healthcare guidance
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <LanguageSelector />
        </div>
      </header>

      {/* Main Chat Container: Fills 100% available viewport height, zero outer scroll */}
      <div className="flex-1 min-h-0 flex flex-col w-full max-w-4xl mx-auto overflow-hidden bg-white sm:border-x sm:border-slate-200/80 sm:shadow-sm">
        <ChatHistory />
        <MultilingualInput />
      </div>
    </div>
  );
}


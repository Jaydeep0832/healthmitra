import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import FormattedMessage from './FormattedMessage';
import { Bot, User, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: '🩺',
    label: 'Fever & Cough',
    prompt: 'મને ૨ દિવસથી તાવ અને ખાંસી છે. મારે શું પ્રાથમિક સારવાર લેવી જોઈએ? (I have fever and cough for 2 days. What basic treatment should I take?)',
  },
  {
    icon: '🛡️',
    label: 'PM-JAY Scheme',
    prompt: 'આયુષ્માન ભારત PM-JAY કાર્ડ માટે કયા દસ્તાવેજો જોઈએ અને ૫ લાખ સુધીની સહાય કેવી રીતે મળે? (What documents are required for PM-JAY card?)',
  },
  {
    icon: '🏥',
    label: 'Chest Pain Advice',
    prompt: 'છાતીમાં ભારેપણું અને ડાબા હાથમાં દુખાવો થતો હોય તો શું કરવું? (What to do if experiencing chest heaviness and left arm pain?)',
  },
  {
    icon: '🩸',
    label: 'Blood Pressure',
    prompt: 'હાઈ બ્લડ પ્રેશર (BP) નિયંત્રિત રાખવા માટે આહારમાં શું ફેરફાર કરવા જોઈએ? (Dietary tips to control high blood pressure)',
  },
];

export default function ChatHistory() {
  const { messages, sendMessage, isLoading } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/25">
            🤖
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Namaste! How can I help with your health?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              Describe your symptoms, ask about Indian government health schemes, or get emergency triage guidance in your language.
            </p>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="pt-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Suggested Prompts
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => !isLoading && sendMessage(item.prompt)}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-emerald-50/50 hover:border-emerald-300 transition-all text-xs font-semibold text-slate-700 hover:text-emerald-900 shadow-2xs flex items-center gap-2 group cursor-pointer"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
      {messages.map((msg, index) => (
        <div key={index} className="space-y-3">
          {/* User Message */}
          <div className="flex justify-end items-end gap-2">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-[85%] sm:max-w-[78%] shadow-sm text-sm">
              <p className="whitespace-pre-wrap leading-relaxed">{msg.user_message}</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs shrink-0 shadow-2xs">
              <User className="h-3.5 w-3.5" />
            </div>
          </div>
          
          {/* AI Response */}
          <div className="flex justify-start items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center text-xs shrink-0 mt-1 shadow-sm shadow-emerald-600/20">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className={`rounded-2xl rounded-tl-xs p-4 max-w-[92%] sm:max-w-[85%] shadow-sm ${
              msg.should_escalate 
                ? 'bg-red-50/70 border border-red-200/90' 
                : 'bg-white border border-slate-200/90'
            }`}>
              <FormattedMessage content={msg.ai_response} isEscalated={msg.should_escalate} />
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}


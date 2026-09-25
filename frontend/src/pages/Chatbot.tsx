import React, { useEffect } from 'react';
import ChatHistory from '../components/Chatbot/ChatHistory';
import MultilingualInput from '../components/Chatbot/MultilingualInput';
import LanguageSelector from '../components/Chatbot/LanguageSelector';
import { useChatStore } from '../store/useChatStore';

export default function Chatbot() {
  const { fetchHistory } = useChatStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            HM
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">HealthMitra</h1>
            <p className="text-xs text-green-600 font-medium">Online</p>
          </div>
        </div>
        <LanguageSelector />
      </header>

      <main className="flex-1 overflow-hidden flex flex-col bg-gray-50 max-w-4xl mx-auto w-full shadow-inner border-x border-gray-100">
        <ChatHistory />
        <MultilingualInput />
      </main>
    </div>
  );
}

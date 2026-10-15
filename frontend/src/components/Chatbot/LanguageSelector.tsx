import React from 'react';
import { useChatStore } from '../../store/useChatStore';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
];

export default function LanguageSelector() {
  const { currentLanguage, setLanguage } = useChatStore();

  return (
    <div className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200/70 transition px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
      <Globe className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
      <select
        id="chat-language"
        aria-label="Select AI language"
        value={currentLanguage}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-transparent border-0 py-0.5 pl-0 pr-6 text-slate-800 text-xs font-bold focus:ring-0 focus:outline-none cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}


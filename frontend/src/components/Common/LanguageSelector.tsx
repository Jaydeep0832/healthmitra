import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../i18n/I18nContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'compact' | 'footer';
}

export default function LanguageSelector({ variant = 'navbar' }: LanguageSelectorProps) {
  const { language, setLanguage, currentMeta, availableLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Change language"
        className={`flex items-center gap-1.5 rounded-xl transition text-xs font-bold ${
          variant === 'navbar'
            ? 'px-3 py-2 bg-slate-100/80 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-200 shadow-2xs'
            : variant === 'footer'
            ? 'px-3 py-1.5 bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 text-xs'
            : 'p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg'
        }`}
      >
        <Globe className="h-3.5 w-3.5 text-emerald-600" />
        <span className="font-semibold tracking-wide">{currentMeta.nativeName}</span>
        <ChevronDown className={`h-3 w-3 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-xl border border-slate-100 ring-1 ring-black/5 z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Select Language / ભાષા પસંદ કરો
            </span>
          </div>

          <div className="py-1 max-h-64 overflow-y-auto">
            {availableLanguages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-left transition ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-600'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold leading-tight">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-600 font-normal">{lang.name}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

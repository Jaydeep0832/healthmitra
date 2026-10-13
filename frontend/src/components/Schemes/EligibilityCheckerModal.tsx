import React, { useState } from 'react';
import { EligibilityQuery, EligibilityMatch } from '../../types/scheme';
import { schemeApi } from '../../services/schemeApi';
import { useTranslation } from '../../i18n/I18nContext';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

interface EligibilityCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScheme?: (schemeId: string) => void;
}

export default function EligibilityCheckerModal({
  isOpen,
  onClose,
  onSelectScheme
}: EligibilityCheckerModalProps) {
  const { t, language } = useTranslation();

  const [state, setState] = useState('Gujarat');
  const [annualIncome, setAnnualIncome] = useState('300000');
  const [age, setAge] = useState('45');
  const [illnessType, setIllnessType] = useState('');
  const [category, setCategory] = useState('General');
  const [familyMembers] = useState('4');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EligibilityMatch[] | null>(null);

  if (!isOpen) return null;

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const query: EligibilityQuery = {
        state,
        annual_income: parseFloat(annualIncome) || 0,
        age: parseInt(age) || 30,
        illness_type: illnessType || undefined,
        category,
        family_members: parseInt(familyMembers) || 4
      };
      const res = await schemeApi.checkEligibility(query);
      setResults(res);
    } catch (err) {
      console.error('Eligibility check error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-emerald-900 to-teal-900 text-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-300">
                Smart Eligibility Wizard
              </span>
            </div>
            <h2 className="text-xl font-black">{t('schemes.eligibility.title')}</h2>
            <p className="text-xs text-slate-300 mt-0.5">{t('schemes.eligibility.subtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Query Form */}
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* State */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t('schemes.eligibility.state_label')}
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-semibold"
                >
                  <option value="Gujarat">Gujarat (ગુજરાત)</option>
                  <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                  <option value="All India">All India / Other State</option>
                </select>
              </div>

              {/* Annual Income */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t('schemes.eligibility.income_label')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-600 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="10000"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    placeholder="300000"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-semibold"
                  />
                </div>
                <span className="text-[10px] text-slate-600 block mt-0.5">
                  {t('schemes.eligibility.income_hint')}
                </span>
              </div>

              {/* Age */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t('schemes.eligibility.age_label')}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="45"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-semibold"
                />
              </div>

              {/* Category */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t('schemes.eligibility.category_label')}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-semibold"
                >
                  <option value="General">General / Middle-Class</option>
                  <option value="BPL">BPL / Priority Ration Card</option>
                  <option value="Senior Citizen">Senior Citizen (60+)</option>
                  <option value="Pregnant Woman">Pregnant Woman / Mother</option>
                  <option value="Differently Abled">Differently Abled / Divyang</option>
                </select>
              </div>
            </div>

            {/* Illness / Medical Need */}
            <div className="text-xs">
              <label className="font-bold text-slate-700 block mb-1">
                {t('schemes.eligibility.illness_label')} (Optional)
              </label>
              <input
                type="text"
                value={illnessType}
                onChange={(e) => setIllnessType(e.target.value)}
                placeholder={t('schemes.eligibility.illness_placeholder')}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition active:scale-98 disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('schemes.eligibility.calculate_btn')}
            </button>
          </form>

          {/* Results Display */}
          {results && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center justify-between">
                <span>{t('schemes.eligibility.results_title')}</span>
                <span className="text-xs font-semibold text-emerald-700">
                  {results.filter((r) => r.is_eligible).length} Schemes Matched
                </span>
              </h3>

              <div className="space-y-3">
                {results.map((match) => {
                  const schemeName =
                    match.scheme.name_localized?.[language] || match.scheme.name;
                  return (
                    <div
                      key={match.scheme.id}
                      className={`p-4 rounded-2xl border transition ${
                        match.is_eligible
                          ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                          : 'bg-slate-50 border-slate-200 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                match.match_score >= 80
                                  ? 'bg-emerald-600 text-white'
                                  : match.match_score >= 50
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-slate-400 text-white'
                              }`}
                            >
                              {match.match_score}% {t('schemes.eligibility.match_score')}
                            </span>
                            <span className="text-[11px] font-bold text-slate-600">
                              {match.scheme.coverage_amount}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {schemeName}
                          </h4>
                        </div>

                        {match.is_eligible && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            {t('schemes.eligibility.eligible')}
                          </span>
                        )}
                      </div>

                      {/* Criteria Met */}
                      {match.matching_reasons.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                            {t('schemes.eligibility.reasons')}:
                          </span>
                          {match.matching_reasons.map((r, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-1.5 text-[11px] text-slate-700"
                            >
                              <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Warnings / Caveats */}
                      {match.warning_notes && match.warning_notes.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-amber-800 block">
                            {t('schemes.eligibility.warnings')}:
                          </span>
                          {match.warning_notes.map((w, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-1.5 text-[11px] text-amber-900"
                            >
                              <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                              <span>{w}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 pt-2 border-t border-emerald-100/60 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500">
                          Authority: {match.scheme.issuing_authority}
                        </span>
                        <a
                          href={match.scheme.application_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                        >
                          Apply Link <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

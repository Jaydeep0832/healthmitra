import React, { useState, useEffect } from 'react';
import { HealthScheme, InsurancePolicy, PatientClaim, SchemeCategory, ClaimCreateRequest } from '../types/scheme';
import { schemeApi } from '../services/schemeApi';
import { useTranslation } from '../i18n/I18nContext';
import SchemeCard from '../components/Schemes/SchemeCard';
import SchemeDetailModal from '../components/Schemes/SchemeDetailModal';
import InsurancePolicyCard from '../components/Schemes/InsurancePolicyCard';
import ClaimsTracker from '../components/Schemes/ClaimsTracker';
import EligibilityCheckerModal from '../components/Schemes/EligibilityCheckerModal';
import LoadingSpinner from '../components/Common/LoadingSpinner';

import {
  Search,
  Sparkles,
  ShieldCheck,
  Building2,
  FileText,
  AlertCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

export default function Schemes() {
  const { t } = useTranslation();

  // Tab State
  const [activeTab, setActiveTab] = useState<'schemes' | 'insurance' | 'claims'>('schemes');

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [middleClassOnly, setMiddleClassOnly] = useState(false);

  // Data States
  const [schemes, setSchemes] = useState<HealthScheme[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [claims, setClaims] = useState<PatientClaim[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [activeSchemeDetail, setActiveSchemeDetail] = useState<HealthScheme | null>(null);
  const [isEligibilityOpen, setIsEligibilityOpen] = useState(false);

  // Load Initial Data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [schemesRes, insuranceRes, claimsRes] = await Promise.all([
          schemeApi.getSchemes({
            category: selectedCategory,
            state: selectedState === 'all' ? undefined : selectedState,
            search: searchQuery || undefined,
            middle_class_only: middleClassOnly
          }),
          schemeApi.getInsurancePolicies(),
          schemeApi.getClaims()
        ]);
        setSchemes(Array.isArray(schemesRes) ? schemesRes : []);
        setInsurancePolicies(Array.isArray(insuranceRes) ? insuranceRes : []);
        setClaims(Array.isArray(claimsRes) ? claimsRes : []);
      } catch (err) {
        console.error('Failed to load schemes data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCategory, selectedState, searchQuery, middleClassOnly]);

  const handleClaimSubmit = async (data: ClaimCreateRequest) => {
    try {
      const newClaim = await schemeApi.submitClaim(data);
      setClaims((prev) => [newClaim, ...prev]);
    } catch (err) {
      console.error('Error submitting claim', err);
    }
  };

  const categories: { key: SchemeCategory; label: string }[] = [
    { key: 'all', label: t('schemes.categories.all') },
    { key: 'operations_surgery', label: t('schemes.categories.operations_surgery') },
    { key: 'critical_illness', label: t('schemes.categories.critical_illness') },
    { key: 'hospitalization', label: t('schemes.categories.hospitalization') },
    { key: 'medicines_diagnostics', label: t('schemes.categories.medicines_diagnostics') },
    { key: 'maternity_child', label: t('schemes.categories.maternity_child') },
    { key: 'opd', label: t('schemes.categories.opd') },
    { key: 'chronic_diseases', label: t('schemes.categories.chronic_diseases') }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl overflow-hidden border border-emerald-900/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{t('schemes.badge')}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {t('schemes.hero_title')}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
              {t('schemes.hero_subtitle')}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() => setIsEligibilityOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition transform active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                <span>{t('schemes.check_eligibility_btn')}</span>
              </button>

              <button
                onClick={() => setActiveTab('claims')}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/15 transition"
              >
                <FileText className="h-4 w-4 text-emerald-400" />
                <span>{t('schemes.track_claim_btn')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('schemes')}
            className={`flex items-center gap-2 pb-3.5 px-4 font-bold text-sm transition relative ${
              activeTab === 'schemes'
                ? 'text-emerald-700 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>{t('schemes.tabs.schemes')}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold ml-1">
              {schemes.length}
            </span>
            {activeTab === 'schemes' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('insurance')}
            className={`flex items-center gap-2 pb-3.5 px-4 font-bold text-sm transition relative ${
              activeTab === 'insurance'
                ? 'text-teal-700 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{t('schemes.tabs.insurance')}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold ml-1">
              {insurancePolicies.length}
            </span>
            {activeTab === 'insurance' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`flex items-center gap-2 pb-3.5 px-4 font-bold text-sm transition relative ${
              activeTab === 'claims'
                ? 'text-blue-700 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>{t('schemes.tabs.claims')}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold ml-1">
              {claims.length}
            </span>
            {activeTab === 'claims' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* TAB 1: SCHEMES CONTENT */}
        {activeTab === 'schemes' && (
          <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                {/* Search input */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('schemes.search_placeholder')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-slate-50/70"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* State selector */}
                <div className="w-full sm:w-48">
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold bg-white"
                  >
                    <option value="all">🌐 {t('schemes.all_states')}</option>
                    <option value="Gujarat">Gujarat (ગુજરાત)</option>
                    <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                  </select>
                </div>

                {/* Middle-Class toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 shrink-0 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 transition">
                  <input
                    type="checkbox"
                    checked={middleClassOnly}
                    onChange={(e) => setMiddleClassOnly(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{t('schemes.filter_middle_class')}</span>
                </label>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schemes Grid */}
            {loading ? (
              <div className="py-16 flex justify-center">
                <LoadingSpinner size="lg" message="Loading verified schemes..." />
              </div>
            ) : schemes.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <HelpCircle className="h-10 w-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-800">No schemes found matching your criteria</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try clearing search terms or selecting 'All Categories' to view full list.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setSelectedState('all');
                    setMiddleClassOnly(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{t('common.reset')}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.id}
                    scheme={scheme}
                    onViewDetails={(s) => setActiveSchemeDetail(s)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AFFORDABLE HEALTH INSURANCE */}
        {activeTab === 'insurance' && (
          <div className="space-y-6">
            <div className="bg-teal-900 text-white p-6 rounded-2xl shadow-md border border-teal-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold">
                  {t('schemes.insurance.title')}
                </h3>
                <p className="text-xs text-teal-200 mt-1 max-w-2xl leading-relaxed">
                  {t('schemes.insurance.subtitle')}
                </p>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-teal-800 border border-teal-700 text-teal-100 shrink-0">
                IRDAI Regulated Plans
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {insurancePolicies.map((policy) => (
                <InsurancePolicyCard key={policy.id} policy={policy} />
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CLAIMS TRACKER */}
        {activeTab === 'claims' && (
          <ClaimsTracker claims={claims} onSubmitClaim={handleClaimSubmit} />
        )}

        {/* Official Disclaimer Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold block text-amber-900">
              {t('schemes.disclaimer.title')}
            </span>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              {t('schemes.disclaimer.body')}
            </p>
          </div>
        </div>
      </div>

      {/* Scheme Detail Modal */}
      <SchemeDetailModal
        scheme={activeSchemeDetail}
        onClose={() => setActiveSchemeDetail(null)}
      />

      {/* Smart Eligibility Wizard Modal */}
      <EligibilityCheckerModal
        isOpen={isEligibilityOpen}
        onClose={() => setIsEligibilityOpen(false)}
      />
    </div>
  );
}

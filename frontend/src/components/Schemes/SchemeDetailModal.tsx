import React from 'react';
import { HealthScheme } from '../../types/scheme';
import { useTranslation } from '../../i18n/I18nContext';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Phone,
  FileCheck2,
  HeartPulse,
  ExternalLink
} from 'lucide-react';

interface SchemeDetailModalProps {
  scheme: HealthScheme | null;
  onClose: () => void;
}

export default function SchemeDetailModal({ scheme, onClose }: SchemeDetailModalProps) {
  const { t, language, formatDate } = useTranslation();

  if (!scheme) return null;

  const displayName = scheme.name_localized?.[language] || scheme.name;
  const displayDesc = scheme.description_localized?.[language] || scheme.short_description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/80">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                {scheme.verification_status}
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                {t('schemes.card.last_verified')}: {formatDate(scheme.last_verified_on)}
              </span>
              <span className="text-[10px] bg-slate-200/80 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                {t('schemes.card.verified_by')}: {scheme.verified_by}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
              {displayName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Description */}
          <p className="text-sm text-slate-700 leading-relaxed bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            {displayDesc}
          </p>

          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                {t('schemes.card.coverage')}
              </span>
              <span className="text-base font-extrabold text-emerald-700 flex items-center gap-0.5 mt-1">
                <IndianRupee className="h-4 w-4" />
                {scheme.coverage_amount}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                {t('schemes.card.income_limit')}
              </span>
              <span className="text-xs font-bold text-slate-800 mt-1 block">
                {scheme.income_limit}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                {t('schemes.card.issuing_authority')}
              </span>
              <span className="text-xs font-bold text-slate-800 mt-1 block">
                {scheme.issuing_authority} ({scheme.state_jurisdiction})
              </span>
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Eligibility Criteria
            </h3>
            <ul className="space-y-2">
              {scheme.eligibility_criteria.map((criteria, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{criteria}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Covered Treatments & Packages */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2.5">
              <HeartPulse className="h-4 w-4 text-rose-500" />
              Covered Treatments & Procedures
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scheme.covered_treatments.map((treatment, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-slate-800"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>{treatment}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Required Documents */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2.5">
              <FileCheck2 className="h-4 w-4 text-teal-600" />
              Required Documents for Enrollment & Pre-Auth
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scheme.required_documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Helpline & Guidance */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200/70 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-amber-700 shrink-0" />
              <div>
                <span className="font-bold">{t('schemes.card.helpline')}: </span>
                <span className="font-extrabold">{scheme.helpline_number}</span>
              </div>
            </div>
            <span className="text-[11px] text-amber-800">Available 24x7 in multiple Indian languages</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
          >
            {t('common.close')}
          </button>

          <a
            href={scheme.application_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition transform active:scale-95"
          >
            <span>{t('schemes.card.apply_official')}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

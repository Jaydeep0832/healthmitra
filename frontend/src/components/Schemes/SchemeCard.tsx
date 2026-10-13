import React from 'react';
import { HealthScheme } from '../../types/scheme';
import { useTranslation } from '../../i18n/I18nContext';
import {
  CheckCircle2,
  ShieldCheck,
  Calendar,
  IndianRupee,
  Building2,
  ExternalLink,
  ChevronRight,
  HeartPulse
} from 'lucide-react';

interface SchemeCardProps {
  key?: React.Key;
  scheme: HealthScheme;
  onViewDetails: (scheme: HealthScheme) => void;
}

export default function SchemeCard({ scheme, onViewDetails }: SchemeCardProps) {
  const { t, language, formatDate } = useTranslation();

  // Pick localized name or fallback
  const displayName = scheme.name_localized?.[language] || scheme.name;
  const displayDesc = scheme.description_localized?.[language] || scheme.short_description;

  const isVerified = scheme.verification_status === 'Verified' || scheme.verification_status === 'Active';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-emerald-300">
      {/* Top Banner / Verification Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Verification Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{isVerified ? t('common.verified') : scheme.verification_status}</span>
          </div>

          {/* Last Verified Date */}
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
            <Calendar className="h-3 w-3 text-slate-600" />
            <span>{t('schemes.card.last_verified')}: {formatDate(scheme.last_verified_on)}</span>
          </div>
        </div>

        {/* Scheme Title & Authority */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
          {displayName}
        </h3>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            <Building2 className="h-3 w-3 text-slate-600" />
            {scheme.issuing_authority} ({scheme.state_jurisdiction})
          </span>

          {scheme.middle_class_friendly && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200/60">
              <ShieldCheck className="h-3 w-3 text-teal-600" />
              {t('schemes.card.middle_class_tag')}
            </span>
          )}
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
          {displayDesc}
        </p>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-600 block">
              {t('schemes.card.coverage')}
            </span>
            <span className="font-extrabold text-emerald-700 text-xs sm:text-sm flex items-center gap-0.5 mt-0.5">
              <IndianRupee className="h-3 w-3" />
              {scheme.coverage_amount}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-600 block">
              {t('schemes.card.income_limit')}
            </span>
            <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate" title={scheme.income_limit}>
              {scheme.income_limit}
            </span>
          </div>
        </div>

        {/* Sample Covered Treatments */}
        <div className="mt-3">
          <span className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1 mb-1.5">
            <HeartPulse className="h-3 w-3 text-rose-500" />
            {t('schemes.card.covered_treatments')}
          </span>
          <div className="flex flex-wrap gap-1">
            {scheme.covered_treatments.slice(0, 3).map((treatment, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium bg-slate-100/90 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60 truncate max-w-[190px]"
              >
                {treatment}
              </span>
            ))}
            {scheme.covered_treatments.length > 3 && (
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                +{scheme.covered_treatments.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
        <button
          onClick={() => onViewDetails(scheme)}
          className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition py-1.5 px-2.5 rounded-lg hover:bg-emerald-50"
        >
          <span>{t('schemes.card.view_details')}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        <a
          href={scheme.application_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
        >
          <span>{t('schemes.card.apply_official')}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

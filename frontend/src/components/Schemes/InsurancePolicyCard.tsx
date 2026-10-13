import React from 'react';
import { InsurancePolicy } from '../../types/scheme';
import { useTranslation } from '../../i18n/I18nContext';
import {
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
  Award,
  BadgeCheck
} from 'lucide-react';

interface InsurancePolicyCardProps {
  key?: React.Key;
  policy: InsurancePolicy;
}

export default function InsurancePolicyCard({ policy }: InsurancePolicyCardProps) {
  const { t, formatDate } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-teal-300">
      <div className="p-5 pb-3">
        {/* Verification & Provider Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
            <BadgeCheck className="h-3.5 w-3.5 text-teal-600" />
            <span>{t('common.verified')}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
            <Calendar className="h-3 w-3 text-slate-600" />
            <span>{t('schemes.card.last_verified')}: {formatDate(policy.last_verified_on)}</span>
          </div>
        </div>

        {/* Policy Name & Provider */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-700 transition leading-snug">
          {policy.policy_name}
        </h3>
        <p className="text-xs font-semibold text-slate-600 mt-1">
          {policy.provider}
        </p>

        {/* Category & IRDAI Reg */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            {policy.category}
          </span>
          <span className="text-[10px] text-slate-600 font-mono">
            {t('schemes.insurance.irdai_reg')}: {policy.irdai_registration}
          </span>
        </div>

        {/* Financials: Premium & Sum Insured */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-600 block">
              {t('schemes.insurance.premium')}
            </span>
            <span className="font-extrabold text-teal-800 text-xs sm:text-sm block mt-0.5">
              {policy.premium_range}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-600 block">
              {t('schemes.insurance.sum_insured')}
            </span>
            <span className="font-bold text-slate-800 text-xs block mt-0.5">
              {policy.sum_insured_range}
            </span>
          </div>
        </div>

        {/* Waiting Periods & Claim Settlement Ratio */}
        <div className="mt-3.5 space-y-2 text-xs">
          <div className="flex items-start gap-2 p-2 rounded-xl bg-amber-50/60 border border-amber-100 text-amber-900 text-[11px]">
            <Clock className="h-3.5 w-3.5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">{t('schemes.insurance.waiting_periods')}: </span>
              <span>{policy.waiting_periods}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-emerald-600" />
              {t('schemes.insurance.csr')}
            </span>
            <span className="font-extrabold text-emerald-800">{policy.claim_settlement_ratio}</span>
          </div>
        </div>

        {/* Key Inclusions */}
        <div className="mt-3.5">
          <span className="text-[10px] uppercase font-bold text-slate-600 block mb-1.5">
            {t('schemes.insurance.key_benefits')}
          </span>
          <div className="space-y-1">
            {policy.key_coverage.slice(0, 3).map((cov, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                <CheckCircle2 className="h-3 w-3 text-teal-600 mt-0.5 shrink-0" />
                <span className="line-clamp-1">{cov}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
        <span className="text-[11px] text-slate-600 font-medium">
          {t('schemes.insurance.entry_age')}: {policy.entry_age}
        </span>
        <a
          href={policy.official_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
        >
          <span>{t('schemes.insurance.official_link')}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nContext';
import LanguageSelector from '../Common/LanguageSelector';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-slate-200/90 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm">
              {t('brand.name')} <span className="text-emerald-600">2.0</span>
            </span>
            <span className="text-slate-400">|</span>
            <span>{t('brand.tagline')}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
            <Link to="/schemes" className="hover:text-emerald-600 flex items-center gap-1 transition">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>{t('nav.schemes')}</span>
            </Link>
            <Link to="/symptoms" className="hover:text-emerald-600 transition">
              {t('nav.symptoms')}
            </Link>
            <Link to="/hospitals" className="hover:text-emerald-600 transition">
              {t('nav.hospitals')}
            </Link>
            <LanguageSelector variant="compact" />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>© 2026 HealthMitra 2.0. Rural Healthcare & Public Health Schemes Aggregator.</p>
          <p className="max-w-xl text-center sm:text-right">
            ⚠️ {t('schemes.disclaimer.title')}: For guidance only. Confirm with official government portals (NHA / MoHFW).
          </p>
        </div>
      </div>
    </footer>
  );
}

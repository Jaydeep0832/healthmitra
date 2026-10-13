import React, { useState } from 'react';
import { PatientClaim, ClaimCreateRequest } from '../../types/scheme';
import { useTranslation } from '../../i18n/I18nContext';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlusCircle,
  FileText,
  Building,
  User,
  ArrowRight,
  Info,
  X
} from 'lucide-react';

interface ClaimsTrackerProps {
  claims: PatientClaim[];
  onSubmitClaim: (data: ClaimCreateRequest) => Promise<void>;
}

export default function ClaimsTracker({ claims, onSubmitClaim }: ClaimsTrackerProps) {
  const { t, formatCurrency, formatDate } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [patientName, setPatientName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [schemeOrPolicy, setSchemeOrPolicy] = useState('Ayushman Bharat PM-JAY');
  const [claimType, setClaimType] = useState<'Cashless Hospitalization' | 'Reimbursement' | 'Government Scheme Direct Pre-Auth'>('Cashless Hospitalization');
  const [amountClaimed, setAmountClaimed] = useState('');
  const [claimReference, setClaimReference] = useState('');
  const [notes, setNotes] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !hospitalName || !amountClaimed) return;

    setSubmitting(true);
    try {
      await onSubmitClaim({
        patient_name: patientName,
        hospital_name: hospitalName,
        scheme_or_policy: schemeOrPolicy,
        claim_type: claimType,
        amount_claimed: parseFloat(amountClaimed),
        claim_reference: claimReference || undefined,
        notes: notes || undefined
      });
      setIsModalOpen(false);
      // Reset form
      setPatientName('');
      setHospitalName('');
      setAmountClaimed('');
      setClaimReference('');
      setNotes('');
    } catch (err) {
      console.error('Failed to submit claim', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'settled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            {t('schemes.claims.status_settled')}
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
            <CheckCircle2 className="h-3 w-3 text-teal-600" />
            {t('schemes.claims.status_verified')}
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="h-3 w-3 text-blue-600" />
            {t('schemes.claims.status_active')}
          </span>
        );
      case 'rejected':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="h-3 w-3 text-rose-600" />
            {t('schemes.claims.status_rejected')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Submit CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-md">
        <div>
          <h3 className="text-lg font-extrabold flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            {t('schemes.claims.title')}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            {t('schemes.claims.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs transition shadow-md shadow-emerald-500/20 active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          {t('schemes.claims.submit_btn')}
        </button>
      </div>

      {/* Verified Data Transparency Notice */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-900">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Data Transparency Notice: </span>
          Claims tagged with <strong className="text-teal-800">Official TPA / PM-JAY API</strong> are verified directly from nodal hospital servers. Entries marked as <strong className="text-amber-800">User Submitted</strong> reflect patient self-reported inquiries awaiting hospital TPA reconciliation.
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {claims.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No claims recorded yet. Click above to track a new hospital claim.
          </div>
        ) : (
          claims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:border-slate-300 transition"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    {claim.claim_reference}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {claim.scheme_or_policy}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {claim.is_verified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      <CheckCircle2 className="h-3 w-3 text-teal-600" />
                      {t('schemes.claims.verified_source')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Clock className="h-3 w-3 text-amber-600" />
                      {t('schemes.claims.unverified_source')}
                    </span>
                  )}
                  {getStatusBadge(claim.status)}
                </div>
              </div>

              {/* Patient & Hospital Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">
                    {t('schemes.claims.patient')}
                  </span>
                  <span className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-600" />
                    {claim.patient_name}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">
                    {t('schemes.claims.hospital')}
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1 truncate" title={claim.hospital_name}>
                    <Building className="h-3 w-3 text-slate-600 shrink-0" />
                    {claim.hospital_name}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">
                    {t('schemes.claims.claimed')}
                  </span>
                  <span className="font-extrabold text-slate-900 mt-0.5 block">
                    {formatCurrency(claim.amount_claimed)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">
                    {t('schemes.claims.approved')}
                  </span>
                  <span className="font-extrabold text-emerald-800 mt-0.5 block">
                    {claim.amount_approved !== null && claim.amount_approved !== undefined
                      ? formatCurrency(claim.amount_approved)
                      : 'Pending TPA Desk'}
                  </span>
                </div>
              </div>

              {/* Next Steps callout */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-xs">
                <ArrowRight className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">{t('schemes.claims.next_steps')}: </span>
                  <span className="text-slate-700">{claim.next_steps}</span>
                  {claim.notes && (
                    <div className="text-[11px] text-slate-600 italic mt-0.5">Note: {claim.notes}</div>
                  )}
                </div>
              </div>

              {/* Dates footer */}
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600">
                <span>Submitted: {formatDate(claim.submitted_date)}</span>
                <span>Last Updated: {formatDate(claim.last_updated)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit Claim Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="text-base font-extrabold text-slate-900">
                {t('schemes.claims.submit_title')}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              {t('schemes.claims.submit_desc')}
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Ramesh K. Patel"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Treating Hospital *
                </label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Civil Hospital Rajkot"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Scheme or Policy
                  </label>
                  <select
                    value={schemeOrPolicy}
                    onChange={(e) => setSchemeOrPolicy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                  >
                    <option value="Ayushman Bharat PM-JAY">Ayushman Bharat PM-JAY</option>
                    <option value="Mukhyamantri Amrutam (MAA)">Mukhyamantri Amrutam (MAA)</option>
                    <option value="Arogya Sanjeevani Policy">Arogya Sanjeevani Policy</option>
                    <option value="Star Health Comprehensive">Star Health Comprehensive</option>
                    <option value="Care Health Insurance">Care Health Insurance</option>
                    <option value="HDFC ERGO Optima Secure">HDFC ERGO Optima Secure</option>
                    <option value="Other Private Policy">Other Policy / Reimbursement</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Claim Type
                  </label>
                  <select
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                  >
                    <option value="Cashless Hospitalization">Cashless Hospitalization</option>
                    <option value="Reimbursement">Reimbursement</option>
                    <option value="Government Scheme Direct Pre-Auth">Government Scheme Pre-Auth</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Amount Claimed (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amountClaimed}
                    onChange={(e) => setAmountClaimed(e.target.value)}
                    placeholder="e.g. 75000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Claim / Policy No. (Optional)
                  </label>
                  <input
                    type="text"
                    value={claimReference}
                    onChange={(e) => setClaimReference(e.target.value)}
                    placeholder="e.g. TPA-889102"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Admission Notes / Ailment
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Admitted in ICU for Dengue treatment. TPA pre-auth requested."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? t('common.loading') : 'Add Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

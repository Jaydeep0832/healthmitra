import React, { useState } from 'react';
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Activity,
  FileCheck,
  RefreshCw,
  Sparkles,
  Stethoscope,
  Info
} from 'lucide-react';
import { api } from '../services/api';

interface Biomarker {
  name: string;
  value: string;
  unit?: string;
  reference_range: string;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'ABNORMAL';
  clinical_note: string;
}

interface ReportResult {
  title: string;
  risk_level: 'HIGH' | 'MODERATE' | 'LOW';
  risk_color: string;
  patient_summary: string;
  biomarkers: Biomarker[];
  critical_findings: string[];
  questions_for_doctor: string[];
  lifestyle_recommendations: string[];
  disclaimer: string;
}

const PRESET_REPORTS = [
  {
    name: '🩸 Complete Blood Count (CBC)',
    text: 'Hemoglobin: 10.2 g/dL (ref 12.0-15.5), WBC Count: 11,800 /mcL (ref 4,500-11,000), Platelets: 210,000 /mcL (ref 150,000-450,000), RBC: 3.8 million/mcL (ref 4.2-5.4). Patient reports mild fatigue.'
  },
  {
    name: '🩺 Diabetes & Glucose Panel',
    text: 'Fasting Blood Sugar: 148 mg/dL (ref 70-99), Post-Prandial Glucose: 210 mg/dL (ref <140), HbA1c: 7.8% (ref <5.7%), Serum Creatinine: 0.9 mg/dL (ref 0.7-1.3).'
  },
  {
    name: '❤️ Lipid Profile (Cholesterol)',
    text: 'Total Cholesterol: 245 mg/dL (ref <200), LDL Cholesterol: 162 mg/dL (ref <100), HDL Cholesterol: 38 mg/dL (ref >40), Triglycerides: 220 mg/dL (ref <150).'
  }
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'text' | 'upload'>('text');
  const [reportText, setReportText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeText = async (textToAnalyze?: string) => {
    const text = textToAnalyze || reportText;
    if (!text.trim()) {
      setError('Please enter or select report text to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<ReportResult>('/api/v1/reports/analyze-text', {
        report_text: text,
        language: 'en'
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to analyze report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a PDF or image report to upload.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('language', 'en');

    try {
      const response = await api.post<ReportResult>('/api/v1/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to process document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'LOW':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'NORMAL':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-red-600 text-white',
          border: 'border-red-300',
          label: 'HIGH RISK · Prompt Medical Follow-up Required'
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500 text-white',
          border: 'border-amber-300',
          label: 'MODERATE RISK · Doctor Consultation Advised'
        };
      default:
        return {
          bg: 'bg-emerald-600 text-white',
          border: 'border-emerald-300',
          label: 'LOW RISK · Parameters Within General Limits'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-white to-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100/70 border border-purple-200 text-purple-800 text-xs font-bold px-3.5 py-1.5 rounded-full mb-3">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" /> AI Diagnostic Document Interpreter
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Medical & Lab Report Analyzer
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w-xl mx-auto">
            Upload your blood test, lipid panel, or diagnostic report. Our clinical AI decodes complex medical numbers into plain, actionable language.
          </p>
        </div>

        {/* Input Card with Tabs */}
        <div className="bg-white rounded-3xl shadow-xl shadow-purple-900/5 border border-gray-100 p-6 sm:p-8 mb-8">
          {/* Tab selector */}
          <div className="flex border-b border-gray-100 mb-6">
            <button
              onClick={() => setActiveTab('text')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === 'text'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4" /> Enter / Paste Report Values
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="h-4 w-4" /> Upload Document (PDF / Image)
            </button>
          </div>

          {activeTab === 'text' ? (
            <div className="space-y-5">
              {/* Presets */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Try a sample diagnostic report:
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_REPORTS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setReportText(preset.text);
                        handleAnalyzeText(preset.text);
                      }}
                      className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 rounded-xl text-xs font-semibold transition"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Enter lab parameters or copy test text:
                </label>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="e.g. Hemoglobin: 11.2 g/dL, Fasting Blood Sugar: 125 mg/dL, Total Cholesterol: 215 mg/dL, Platelets: 250,000..."
                  rows={4}
                  className="w-full rounded-2xl border border-gray-300 p-4 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleAnalyzeText()}
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Decoding Biomarkers with AI...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4" /> Analyze Lab Report
                  </>
                )}
              </button>
            </div>
          ) : (
            <div>
              <div role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                PDF text extraction and image OCR are supported. Review the extracted values with a qualified clinician.
              </div>
              <form onSubmit={handleFileUpload} className="space-y-5">
                <div className="border-2 border-dashed border-purple-200 rounded-3xl p-8 text-center bg-purple-50/30 hover:bg-purple-50/60 transition cursor-pointer">
                  <input
                    type="file"
                    id="report-file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                    className="hidden"
                  />
                  <label htmlFor="report-file" className="cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
                      <Upload className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">
                      {selectedFile ? selectedFile.name : 'Click to upload or drag & drop'}
                    </h3>
                    <p className="text-xs text-gray-500">Supports PDF, JPG, PNG, or WebP (Max: 10MB)</p>
                  </label>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !selectedFile}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Scanning Document...
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-4 w-4" /> Process & Interpret Document
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Results Presentation */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Summary & Risk Level Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Evaluation Title</span>
                  <h2 className="text-2xl font-black text-gray-900">{result.title}</h2>
                </div>
                <div>
                  <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${getRiskBadge(result.risk_level).bg}`}>
                    {getRiskBadge(result.risk_level).label}
                  </span>
                </div>
              </div>

              <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-5 mb-6">
                <h4 className="text-xs font-extrabold text-purple-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-purple-600" /> Patient-Friendly Clinical Summary
                </h4>
                <p className="text-sm text-purple-950 leading-relaxed">{result.patient_summary}</p>
              </div>

              {/* Biomarkers Table */}
              <div className="mb-6">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">
                  Extracted Biomarkers & Reference Ranges:
                </h3>
                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-bold uppercase">
                        <tr>
                          <th className="py-3 px-4">Parameter</th>
                          <th className="py-3 px-4">Value</th>
                          <th className="py-3 px-4">Ref Range</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">What This Means</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-800">
                        {result.biomarkers.map((bm, i) => (
                          <tr key={i} className="hover:bg-gray-50/60 transition">
                            <td className="py-3.5 px-4 font-bold text-gray-900">{bm.name}</td>
                            <td className="py-3.5 px-4 font-black">
                              {bm.value} <span className="text-gray-500 font-normal">{bm.unit}</span>
                            </td>
                            <td className="py-3.5 px-4 text-gray-500">{bm.reference_range}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] border ${getStatusBadge(bm.status)}`}>
                                {bm.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-gray-600 leading-relaxed max-w-xs">{bm.clinical_note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Critical Findings & Doctor Questions */}
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                {/* Findings */}
                <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-5">
                  <h4 className="text-xs font-extrabold text-rose-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-600" /> Key Clinical Observations
                  </h4>
                  <ul className="space-y-2 text-xs text-rose-950">
                    {result.critical_findings.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-bold text-rose-600 mt-0.5">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Questions for doctor */}
                <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5">
                  <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Stethoscope className="h-4 w-4 text-blue-600" /> Questions to Ask Your Doctor
                  </h4>
                  <ul className="space-y-2 text-xs text-blue-950">
                    {result.questions_for_doctor.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-bold text-blue-600 mt-0.5">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Lifestyle Recommendations */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 mb-6">
                <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Actionable Lifestyle & Dietary Advice
                </h4>
                <div className="grid sm:grid-cols-2 gap-2 mt-2">
                  {result.lifestyle_recommendations.map((rec, i) => (
                    <div key={i} className="text-xs text-emerald-950 flex items-start gap-2">
                      <span className="font-bold text-emerald-600 mt-0.5">✓</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-500 flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-400 shrink-0" />
                <span>{result.disclaimer}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import {
  Stethoscope,
  Mic,
  MicOff,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Clock,
  User,
  HeartPulse,
  Sparkles,
  RefreshCw,
  PhoneCall,
  CheckCircle,
  HelpCircle,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface TriageResult {
  urgency_level: 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'SELF_CARE';
  urgency_color: string;
  is_emergency: boolean;
  title: string;
  explanation: string;
  immediate_actions: string[];
  home_care: string[];
  warning_signs: string[];
  recommended_specialist: string;
  emergency_contact: string;
}

const COMMON_SYMPTOMS = [
  'Chest Pain / छाती में दर्द',
  'High Fever / तेज बुखार',
  'Severe Headache / सिरदर्द',
  'Shortness of Breath / सांस लेने में तकलीफ',
  'Stomach Pain / पेट दर्द',
  'Dizziness / चक्कर आना',
  'Persistent Cough / लगातार खांसी',
  'Nausea & Vomiting / उल्टी',
  'Skin Rash / त्वचा पर चकत्ते',
  'Extreme Fatigue / अत्यधिक थकान'
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
];

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [language, setLanguage] = useState('en');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('other');
  const [duration, setDuration] = useState<string>('1-2 days');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Web Speech API
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSymptoms((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your symptoms.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        gu: 'gu-IN',
        mr: 'mr-IN',
        bn: 'bn-IN'
      };
      recognitionRef.current.lang = langMap[language] || 'en-IN';
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleAddTag = (tag: string) => {
    const cleanTag = tag.split('/')[0].trim();
    if (!symptoms.includes(cleanTag)) {
      setSymptoms((prev) => (prev ? `${prev}, ${cleanTag}` : cleanTag));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError('Please describe your symptoms before proceeding.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<TriageResult>('/api/v1/triage/check', {
        symptoms,
        language,
        age: age ? parseInt(age) : null,
        gender,
        duration
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to analyze symptoms. Please check connectivity or try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case 'EMERGENCY':
        return {
          bg: 'bg-red-500 text-white animate-pulse',
          icon: <ShieldAlert className="h-5 w-5" />,
          label: 'EMERGENCY · Immediate Care Needed',
          border: 'border-red-400',
        };
      case 'URGENT':
        return {
          bg: 'bg-amber-500 text-white',
          icon: <AlertTriangle className="h-5 w-5" />,
          label: 'URGENT · Consult Doctor Today',
          border: 'border-amber-300',
        };
      case 'ROUTINE':
        return {
          bg: 'bg-blue-600 text-white',
          icon: <Stethoscope className="h-5 w-5" />,
          label: 'ROUTINE · Scheduled Consultation',
          border: 'border-blue-200',
        };
      default:
        return {
          bg: 'bg-emerald-600 text-white',
          icon: <HeartPulse className="h-5 w-5" />,
          label: 'SELF CARE · Rest & Hydration',
          border: 'border-emerald-200',
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-bold px-3.5 py-1.5 rounded-full mb-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" /> AI Clinical Triage System
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Smart Symptom Checker & Urgency Triage
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w-xl mx-auto">
            Describe how you are feeling in your native language or by voice. Get instant, clinical safety triage and personalized next steps.
          </p>
        </div>

        {/* Form & Input Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 p-6 sm:p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language & Voice Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Language:</span>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLanguage(l.code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        language === l.code
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={toggleVoice}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isListening ? 'Listening... Speak now' : 'Voice Dictation'}
              </button>
            </div>

            {/* Quick symptom pills */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Tap to quickly add symptoms:
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOMS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 transition"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Symptom textarea */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Describe your symptoms in detail:
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: I have high fever with body chills and a dry cough since yesterday. Feeling dizzy when standing..."
                rows={4}
                className="w-full rounded-2xl border border-gray-300 p-4 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            {/* Demographic Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-gray-400" /> Patient Age:
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 35"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Gender:</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-gray-400" /> Duration:
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                >
                  <option value="Less than 24 hours">Less than 24 hours</option>
                  <option value="1-2 days">1 - 2 days</option>
                  <option value="3-5 days">3 - 5 days</option>
                  <option value="More than 1 week">More than 1 week</option>
                  <option value="Chronic / Months">Chronic / Recurring</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Evaluating Symptoms...
                  </>
                ) : (
                  <>
                    <Stethoscope className="h-4 w-4" /> Analyze & Check Urgency
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSymptoms('');
                  setResult(null);
                  setError(null);
                }}
                className="py-3.5 px-5 rounded-2xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Triage Results Display */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Urgency Level Banner */}
            {(() => {
              const badge = getUrgencyBadge(result.urgency_level);
              return (
                <div
                  className={`rounded-3xl p-6 sm:p-8 bg-white border-2 ${badge.border} shadow-xl relative overflow-hidden`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${badge.bg} shadow-md`}>{badge.icon}</div>
                      <div>
                        <span className="text-xs uppercase font-extrabold tracking-wider text-gray-500">
                          Triage Recommendation
                        </span>
                        <h2 className="text-2xl font-black text-gray-900">{result.title}</h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm leading-relaxed mb-6">{result.explanation}</p>

                  {/* If Emergency alert */}
                  {result.is_emergency && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <PhoneCall className="h-6 w-6 text-red-600 shrink-0 animate-bounce" />
                        <div>
                          <h4 className="font-bold text-red-900 text-sm">Critical Warning: Emergency Care Required</h4>
                          <p className="text-xs text-red-700">
                            Immediate hospital dispatch recommended. Call emergency ambulance immediately.
                          </p>
                        </div>
                      </div>
                      <a
                        href="tel:108"
                        className="py-2.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition shrink-0"
                      >
                        <PhoneCall className="h-4 w-4" /> Call 108 Now
                      </a>
                    </div>
                  )}

                  {/* Actions & Guidance Grid */}
                  <div className="grid md:grid-cols-2 gap-5 mb-6">
                    {/* Immediate Actions */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5">
                      <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-blue-600" /> Immediate Recommended Steps
                      </h4>
                      <ul className="space-y-2 text-xs text-blue-950">
                        {result.immediate_actions.map((act, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="font-bold text-blue-600 mt-0.5">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Warning Signs */}
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5">
                      <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-amber-600" /> Warning Signs to Watch For
                      </h4>
                      <ul className="space-y-2 text-xs text-amber-950">
                        {result.warning_signs.map((sign, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="font-bold text-amber-600 mt-0.5">•</span>
                            <span>{sign}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Home care & Specialist advice */}
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-gray-500 font-semibold">Recommended Medical Specialist:</span>
                      <p className="text-sm font-bold text-gray-900">{result.recommended_specialist}</p>
                    </div>

                    <button
                      onClick={() => navigate('/hospitals')}
                      className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <MapPin className="h-4 w-4" /> Find Nearby Hospitals <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

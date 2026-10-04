import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Stethoscope,
  FileText,
  Hospital,
  Activity,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  HeartPulse,
  PhoneCall,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';

const features = [
  {
    icon: Stethoscope,
    title: 'Symptom Triage & Red-Flag Checker',
    desc: 'Describe symptoms via voice or text. Instant clinical triage calculates emergency levels, warnings, and immediate care steps.',
    color: 'from-blue-600 to-cyan-600',
    link: '/symptoms',
    cta: 'Check Symptoms Now',
    tag: 'Urgent Care'
  },
  {
    icon: MessageSquare,
    title: 'Multilingual AI Health Assistant',
    desc: 'Chat freely in Hindi, Gujarati, English, Marathi, or Bengali. Voice-enabled empathetic medical consultation powered by Groq LLaMA-3.',
    color: 'from-indigo-600 to-purple-600',
    link: '/chatbot',
    cta: 'Start AI Consultation',
    tag: '5 Indian Languages'
  },
  {
    icon: FileText,
    title: 'AI Lab & Medical Report Analyzer',
    desc: 'Upload PDF or photo blood reports (CBC, HbA1c, Lipid Profile). AI decodes biomarkers, highlights abnormalities, and prepares doctor questions.',
    color: 'from-purple-600 to-pink-600',
    link: '/reports',
    cta: 'Analyze Lab Report',
    tag: 'Vision Diagnostics'
  },
  {
    icon: Hospital,
    title: 'Geospatial Hospital Locator',
    desc: 'Explore 100+ Gujarat healthcare centers on an interactive map. Filter by ICU beds, ambulance services, specialties, and distance.',
    color: 'from-emerald-600 to-teal-600',
    link: '/hospitals',
    cta: 'Find Nearby Hospitals',
    tag: 'Live 2dsphere GPS'
  },
  {
    icon: Activity,
    title: 'Personal Health Wellness Dashboard',
    desc: 'Encrypted patient portal tracking health scores, consultation timelines, past clinical logs, and customized recovery roadmaps.',
    color: 'from-amber-600 to-orange-600',
    link: '/dashboard',
    cta: 'View Health Records',
    tag: 'HIPAA Encrypted'
  },
];

const stats = [
  { value: '100+', label: 'Gujarat Hospitals' },
  { value: '5', label: 'Indic Languages' },
  { value: '< 2s', label: 'Triage Response' },
  { value: '256-bit', label: 'AES Encryption' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Emergency Alert Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white text-xs sm:text-sm py-2 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-white/20 rounded-full animate-ping">
              <ShieldAlert className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="font-bold">Medical Emergency?</span>
            <span className="hidden md:inline text-red-100">National Ambulance: 108 · All-in-One Helpline: 112</span>
          </div>
          <a
            href="tel:108"
            className="bg-white text-red-700 px-3 py-1 rounded-full font-black text-xs hover:bg-red-50 transition shadow-sm flex items-center gap-1"
          >
            <PhoneCall className="h-3 w-3" /> Dial 108
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white py-20 lg:py-28">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-bold mb-6 border border-white/15">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              <span>Next-Gen Rural Healthcare Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-6">
              Accessible Healthcare AI,{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
                In Your Own Language.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-blue-100/90 mb-8 leading-relaxed max-w-2xl font-normal">
              HealthMitra bridges the healthcare divide across rural and urban India. Check symptoms, translate lab reports into plain language, find 100+ Gujarat hospitals with ICU beds, and track patient wellness securely.
            </p>

            <div className="flex flex-wrap gap-3.5">
              <button
                onClick={() => navigate('/symptoms')}
                className="px-6 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black rounded-2xl hover:brightness-110 transition transform active:scale-95 shadow-xl shadow-cyan-500/25 flex items-center gap-2 text-sm"
              >
                <Stethoscope className="h-4 w-4" /> Check Symptoms Free <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => navigate('/hospitals')}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-2xl font-bold text-white transition text-sm flex items-center gap-2"
              >
                <Hospital className="h-4 w-4" /> Locate Nearby Hospitals
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="bg-white border-b border-gray-100 relative -mt-6 mx-4 sm:mx-8 max-w-7xl lg:mx-auto rounded-2xl shadow-xl shadow-gray-200/50 p-6 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x divide-gray-100">
          {stats.map((s, idx) => (
            <div key={idx} className="p-2">
              <div className="text-2xl sm:text-3xl font-black text-gray-900">{s.value}</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5 Core Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Comprehensive Medical Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3">
            Designed for Human Care & Accessibility
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mt-2">
            Every feature is engineered for high reliability, clinical safety guardrails, and effortless navigation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3.5 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-md group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-100">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-blue-600 transition">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <button
                  onClick={() => navigate(item.link)}
                  className="w-full py-3 px-4 rounded-xl bg-gray-50 hover:bg-blue-600 text-gray-800 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition group/btn shadow-2xs"
                >
                  {item.cta} <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Safety & Trust Pillars */}
      <section className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-base mb-1">Clinical Safety Guardrails</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Strictly non-prescriptive AI models that detect urgent red flags and automatically route to emergency hospital services.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-100 text-blue-700 shrink-0">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-base mb-1">HIPAA & DISHA Aligned</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Personal health identifiers are cryptographically encrypted using 256-bit AES at rest and TLS in transit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-purple-100 text-purple-700 shrink-0">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-base mb-1">Vernacular Language Inclusivity</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Supports zero-shot Hindi, Gujarati, Marathi, Bengali, and English, coupled with microphone voice dictation for low-literacy users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

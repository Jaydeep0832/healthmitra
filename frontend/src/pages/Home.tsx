import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: '🤖',
    title: 'AI Health Assistant',
    desc: 'Chat in Hindi, Gujarati, English, Marathi, or Bengali. Get instant health guidance with voice support.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '🏥',
    title: 'Hospital Locator',
    desc: 'Find 100+ Gujarat hospitals near you. Filter by services, distance, and ratings — all on a map.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: '📊',
    title: 'Health Dashboard',
    desc: 'Track your medical history, consultations, and health score. Your data stays encrypted and private.',
    color: 'from-purple-500 to-indigo-500',
  },
];

const steps = [
  { num: '01', title: 'Sign Up', desc: 'Create your free account in seconds' },
  { num: '02', title: 'Describe Symptoms', desc: 'Talk or type in your language' },
  { num: '03', title: 'Get Guidance', desc: 'Receive AI-powered health advice' },
];

const stats = [
  { value: '100+', label: 'Hospitals' },
  { value: '5', label: 'Languages' },
  { value: '24/7', label: 'Available' },
  { value: 'HIPAA', label: 'Compliant' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Production-Ready Healthcare AI
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Your AI Health
              <span className="block bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                Companion
              </span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-lg leading-relaxed">
              HealthMitra brings AI-powered healthcare to rural India.
              Talk in your language, find nearby hospitals, and track your health — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3.5 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg shadow-white/20"
              >
                Get Started Free →
              </button>
              <button
                onClick={() => navigate('/hospitals')}
                className="px-8 py-3.5 bg-white/10 backdrop-blur border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition"
              >
                🏥 Find Hospitals
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Everything You Need for Better Health
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Three powerful features designed for accessibility and ease of use
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}
              >
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                <div className="text-5xl font-black text-white/10 absolute -top-4 -left-2">
                  {s.num}
                </div>
                <div className="relative z-10 pt-6">
                  <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-gray-400">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 translate-x-1/2 text-gray-600 text-2xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">
            Start Your Health Journey Today
          </h2>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">
            Join thousands of users getting AI-powered health guidance in their language.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-white text-indigo-700 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-xl shadow-blue-900/30 transform hover:scale-105"
          >
            Create Free Account →
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;

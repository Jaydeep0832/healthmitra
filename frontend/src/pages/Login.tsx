import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { authService } from '../services/auth';
import { getApiErrorMessage } from '../services/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Loader2,
  HeartHandshake,
  Building2,
  FileText
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    useChatStore.getState().resetChat();

    try {
      await authService.login(email.trim().toLowerCase(), password);
      await checkAuth();
      useChatStore.getState().resetChat();
      const destination = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (error: unknown) {
      setErrorMsg(getApiErrorMessage(error, 'Incorrect email or password. Please verify and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient Background Decorative Glow Orbs */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-emerald-200/30 via-teal-100/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute -top-20 -right-20 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo Badge */}
        <Link to="/" className="inline-flex items-center gap-3 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200">
            🏥
          </div>
          <div className="text-left">
            <div className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              HealthMitra
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-300">
                2.0
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">Rural Healthcare AI & Benefits</span>
          </div>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Welcome Back
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
          Sign in to access AI medical triage, Gujarat government schemes, and health records
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/80 sm:px-10 relative overflow-hidden">
          {/* Top Decorative Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

          {/* Security Assurance Badge */}
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 rounded-full py-1.5 px-3.5 mb-6 shadow-2xs">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>256-Bit Encrypted Healthcare Session</span>
          </div>

          <form className="space-y-4" onSubmit={handleLogin} noValidate>
            {/* Error Message Alert */}
            {errorMsg && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
              >
                <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold">Authentication Notice</p>
                  <p className="text-rose-700 mt-0.5 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-60"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-60"
                  placeholder="Enter your account password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Redesigned Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="login-submit-btn"
                disabled={loading}
                className="w-full relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-800 shadow-md shadow-emerald-600/25 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in to HealthMitra...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Sign In to HealthMitra</span>
                  </>
                )}
              </button>
            </div>

            {/* Register Link Banner */}
            <div className="pt-4 mt-2 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Don't have an account yet?{' '}
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition"
                >
                  <span>Create an account</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Value Proposition Pills */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/60 shadow-2xs">
            <HeartHandshake className="h-4 w-4 mx-auto text-emerald-600 mb-1" />
            <p className="text-[10px] font-bold text-slate-800">24/7 AI Triage</p>
            <p className="text-[9px] text-slate-500">Gujarati & English</p>
          </div>
          <div className="p-2.5 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/60 shadow-2xs">
            <Building2 className="h-4 w-4 mx-auto text-emerald-600 mb-1" />
            <p className="text-[10px] font-bold text-slate-800">1,200+ Hospitals</p>
            <p className="text-[9px] text-slate-500">Across 33 Districts</p>
          </div>
          <div className="p-2.5 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/60 shadow-2xs">
            <FileText className="h-4 w-4 mx-auto text-emerald-600 mb-1" />
            <p className="text-[10px] font-bold text-slate-800">18+ Schemes</p>
            <p className="text-[9px] text-slate-500">PM-JAY & MA Amrutam</p>
          </div>
        </div>

        {/* Gujarat Helpline Support Box */}
        <div className="mt-4 p-3 bg-white/60 backdrop-blur-xs rounded-xl border border-slate-200/60 text-center text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">Need immediate assistance? </span>
          Gujarat Health: <strong className="text-emerald-700 font-bold">104</strong> • PM-JAY: <strong className="text-emerald-700 font-bold">14555</strong>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { authService } from '../services/auth';
import { getApiErrorMessage } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Loader2,
  Stethoscope,
  KeyRound,
  Check
} from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'patient' | 'asha_worker'>('patient');
  const [ashaPasscode, setAshaPasscode] = useState('');
  const [ashaWorkerId, setAshaWorkerId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isEmailConflict, setIsEmailConflict] = useState(false);
  const [loading, setLoading] = useState(false);
  const { checkAuth } = useAuthStore();
  const navigate = useNavigate();

  const isPasswordLongEnough = password.length >= 7;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailConflict(false);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    if (!isPasswordLongEnough) {
      setErrorMsg('Password must be at least 7 characters long.');
      return;
    }

    if (role === 'asha_worker' && !ashaPasscode.trim()) {
      setErrorMsg('Please enter the authorized ASHA registration passcode (e.g. ASHA2026).');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      useChatStore.getState().resetChat();
      await authService.register({
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName.trim(),
        role,
        asha_passcode: role === 'asha_worker' ? ashaPasscode.trim() : undefined,
        asha_worker_id: role === 'asha_worker' ? ashaWorkerId.trim() : undefined,
      });

      // Automatically login after successful registration and reset chat session
      await authService.login(email.trim().toLowerCase(), password);
      useChatStore.getState().resetChat();
      await checkAuth();
      navigate('/dashboard');
    } catch (error: unknown) {
      const parsedError = getApiErrorMessage(error, 'Registration failed. Please check your details.');
      setErrorMsg(parsedError);
      if (parsedError.toLowerCase().includes('already registered')) {
        setIsEmailConflict(true);
      }
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
        {/* Brand Header */}
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
          Create Your Account
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
          Access AI health consultations, Gujarat benefits eligibility, and medical records
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/80 sm:px-10 relative overflow-hidden">
          {/* Top Decorative Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

          {/* Role Selector Tabs */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Choose Account Type
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => {
                  setRole('patient');
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  role === 'patient'
                    ? 'bg-white text-emerald-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="h-3.5 w-3.5 text-emerald-600" />
                <span>Patient / Citizen</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('asha_worker');
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  role === 'asha_worker'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="h-3.5 w-3.5" />
                <span>ASHA Worker</span>
              </button>
            </div>
          </div>

          {/* ASHA Info Banner */}
          {role === 'asha_worker' && (
            <div className="mb-4 p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200 text-xs text-emerald-900 animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-extrabold">National Health Mission (NHM) Access</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                    ASHA accounts unlock village roster management and emergency referrals. Default demo code: <strong className="font-mono font-bold">ASHA2026</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister} noValidate>
            {/* Error Message with Email Conflict Resolution */}
            {errorMsg && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs animate-in fade-in duration-200 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold">Registration Alert</p>
                    <p className="text-rose-700 mt-0.5 leading-relaxed">{errorMsg}</p>
                  </div>
                </div>

                {isEmailConflict && (
                  <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                    <span className="text-[11px] text-rose-800 font-medium">Already registered?</span>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-rose-300 rounded-lg text-rose-700 font-bold text-xs hover:bg-rose-100 transition shadow-2xs"
                    >
                      <span>Sign In Now</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Full Name Field */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="reg-name"
                  name="fullName"
                  type="text"
                  required
                  disabled={loading}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-60"
                  placeholder="e.g. Ramesh Patel or Sarita Ben"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="reg-email"
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

            {/* Password Field with Validation Indicator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="reg-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className={`text-[10px] font-bold ${isPasswordLongEnough ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {password.length}/7 min characters
                </span>
              </div>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 bg-slate-50/60 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all disabled:opacity-60 ${
                    password.length > 0 && !isPasswordLongEnough
                      ? 'border-amber-300 focus:ring-amber-500 focus:border-amber-500'
                      : password.length >= 7
                      ? 'border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500'
                      : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                  placeholder="At least 7 characters"
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

              {/* Password Requirement Guide Badge */}
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
                    isPasswordLongEnough ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <span className={isPasswordLongEnough ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                  7+ characters requirement {isPasswordLongEnough ? 'met' : ''}
                </span>
              </div>
            </div>

            {/* ASHA Specific Passcode and ID */}
            {role === 'asha_worker' && (
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in duration-200">
                <div>
                  <label htmlFor="reg-asha-passcode" className="block text-xs font-bold text-emerald-950 mb-1">
                    ASHA Passcode <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-700">
                      <KeyRound className="h-3.5 w-3.5" />
                    </div>
                    <input
                      id="reg-asha-passcode"
                      name="ashaPasscode"
                      type="password"
                      required
                      disabled={loading}
                      value={ashaPasscode}
                      onChange={(e) => setAshaPasscode(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      placeholder="Enter code (default: ASHA2026)"
                    />
                  </div>
                  <p className="text-[10px] text-emerald-700 mt-1">
                    Provided by your Taluka Health Officer (THO) or primary health sub-centre.
                  </p>
                </div>

                <div>
                  <label htmlFor="reg-asha-id" className="block text-xs font-bold text-emerald-950 mb-1">
                    ASHA ID / Ward / Taluka (Optional)
                  </label>
                  <input
                    id="reg-asha-id"
                    name="ashaWorkerId"
                    type="text"
                    disabled={loading}
                    value={ashaWorkerId}
                    onChange={(e) => setAshaWorkerId(e.target.value)}
                    className="block w-full px-3 py-2 text-xs text-slate-900 bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. WARD-04-ASHA or SANAND-01"
                  />
                </div>
              </div>
            )}

            {/* Redesigned Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="register-submit-btn"
                disabled={loading || !isPasswordLongEnough}
                className="w-full relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-800 shadow-md shadow-emerald-600/25 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>
                      {role === 'asha_worker' ? 'Register as ASHA Healthcare Worker' : 'Create Free Patient Account'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Sign In Link Banner */}
            <div className="pt-4 mt-2 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Already registered with HealthMitra?{' '}
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition"
                >
                  <span>Sign in here</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Security & Ayushman Bharat Standard Badge */}
        <div className="mt-4 p-3 bg-white/60 backdrop-blur-xs rounded-xl border border-slate-200/60 text-center text-[11px] text-slate-500">
          <div className="flex items-center justify-center gap-1.5 text-slate-600 font-semibold mb-0.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Ayushman Bharat Digital Mission (ABDM) Compatible</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Encrypted end-to-end to protect patient clinical summaries and identity records.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/auth';
import { getApiErrorMessage } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'patient' | 'asha_worker'>('patient');
  const [ashaPasscode, setAshaPasscode] = useState('');
  const [ashaWorkerId, setAshaWorkerId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { checkAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 12) {
      setErrorMsg('Password must be at least 12 characters long.');
      return;
    }

    if (role === 'asha_worker' && !ashaPasscode.trim()) {
      setErrorMsg('Please enter the authorized ASHA registration passcode (e.g. ASHA2026).');
      return;
    }

    setLoading(true);
    try {
      setErrorMsg('');
      await authService.register({
        email,
        password,
        full_name: fullName,
        role,
        asha_passcode: role === 'asha_worker' ? ashaPasscode.trim() : undefined,
        asha_worker_id: role === 'asha_worker' ? ashaWorkerId.trim() : undefined,
      });
      // Automatically login after successful registration
      await authService.login(email, password);
      await checkAuth();
      navigate('/dashboard');
    } catch (error: unknown) {
      setErrorMsg(getApiErrorMessage(error, 'Registration failed. Please check your details.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-2xl mb-2">
            {role === 'asha_worker' ? '🩺' : '🏥'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Create an Account
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Access AI health consultations and community medical records
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="bg-gray-100 p-1 rounded-xl grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'patient'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>👤</span> Patient
          </button>
          <button
            type="button"
            onClick={() => setRole('asha_worker')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'asha_worker'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>🩺</span> ASHA Worker
          </button>
        </div>

        {role === 'asha_worker' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-start gap-2">
            <span className="text-base">ℹ️</span>
            <div>
              <p className="font-bold">National Health Mission Enrollment</p>
              <p className="text-emerald-700 mt-0.5">
                ASHA workers receive village roster management, patient triage, and PHC referral tools. Requires authorized health sub-center passcode.
              </p>
            </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister}>
          {errorMsg && (
            <div className="text-red-600 text-xs text-center bg-red-50 border border-red-200 p-2.5 rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                name="fullName"
                type="text"
                required
                className="block w-full rounded-xl border border-gray-200 py-2.5 px-3 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                placeholder="e.g. Ramesh Patel or Sarita Ben"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="block w-full rounded-xl border border-gray-200 py-2.5 px-3 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
                className="block w-full rounded-xl border border-gray-200 py-2.5 px-3 text-gray-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                placeholder="Minimum 12 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* ASHA Specific Fields */}
            {role === 'asha_worker' && (
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-3 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1">
                    ASHA Passcode <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="ashaPasscode"
                    type="password"
                    required
                    className="block w-full rounded-lg border border-emerald-300 py-2 px-3 text-gray-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none bg-white font-mono"
                    placeholder="Enter code (default: ASHA2026)"
                    value={ashaPasscode}
                    onChange={(e) => setAshaPasscode(e.target.value)}
                  />
                  <p className="text-[10px] text-emerald-700 mt-1">Authorized health sub-center passcode</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-900 mb-1">
                    ASHA ID / Ward (Optional)
                  </label>
                  <input
                    name="ashaWorkerId"
                    type="text"
                    className="block w-full rounded-lg border border-emerald-300 py-2 px-3 text-gray-900 text-sm focus:ring-2 focus:ring-emerald-400 outline-none bg-white"
                    placeholder="e.g. WARD-04-ASHA"
                    value={ashaWorkerId}
                    onChange={(e) => setAshaWorkerId(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white shadow-md transition active:scale-[0.98] ${
                role === 'asha_worker'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              {loading ? 'Creating Account...' : role === 'asha_worker' ? 'Register as ASHA Worker' : 'Create Patient Account'}
            </button>
          </div>

          <div className="text-center text-xs text-gray-500 pt-1">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Log in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

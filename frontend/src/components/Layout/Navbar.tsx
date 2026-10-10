import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  MessageSquare,
  Hospital,
  Home,
  Stethoscope,
  FileText,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import EmergencyModal from '../Common/EmergencyModal';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/symptoms', label: 'Symptom Triage', icon: Stethoscope },
    { to: '/chatbot', label: 'AI Assistant', icon: MessageSquare },
    { to: '/hospitals', label: 'Hospital Locator', icon: Hospital },
    { to: '/reports', label: 'Lab Reports', icon: FileText },
  ];

  if (isAuthenticated) {
    navLinks.push({ to: '/dashboard', label: 'My Health', icon: LayoutDashboard });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-500/20 group-hover:scale-105 transition transform">
                  🏥
                </div>
                <div className="flex flex-col">
                  <div className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
                    Health<span className="text-emerald-600">Mitra</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md border border-emerald-200">
                      2.0
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium -mt-1">Rural Healthcare AI</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1.5">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                        : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1.5 opacity-80" /> {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Emergency SOS & User Controls */}
            <div className="hidden sm:flex items-center space-x-3">
              {/* Emergency SOS Trigger Button */}
              <button
                onClick={() => setIsEmergencyOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs shadow-md shadow-red-500/25 hover:from-red-700 hover:to-rose-700 transition transform active:scale-95 animate-pulse"
              >
                <ShieldAlert className="h-4 w-4" /> 🚨 Emergency SOS
              </button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 py-1 px-3 rounded-full bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition text-xs font-bold text-emerald-900"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black">
                      {user?.full_name ? user.full_name[0].toUpperCase() : 'P'}
                    </div>
                    <span className="max-w-[120px] truncate">{user?.full_name || user?.email}</span>
                    <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full uppercase font-bold">
                      {user?.role === 'asha_worker' ? 'ASHA' : user?.role === 'admin' ? 'ADMIN' : user?.role === 'doctor' ? 'DOCTOR' : 'PATIENT'}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-slate-700 hover:text-emerald-600 px-3.5 py-2 rounded-xl transition"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 transition shadow-emerald-500/20"
                  >
                    Sign up free
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsEmergencyOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white font-extrabold text-xs animate-pulse"
              >
                <ShieldAlert className="h-3.5 w-3.5" /> SOS
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-200 shadow-xl">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                    active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" /> {item.label}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-slate-200">
              {isAuthenticated ? (
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs font-semibold text-slate-600">{user?.full_name || user?.email}</span>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-xs text-red-600 font-bold flex items-center gap-1"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Global Emergency SOS Modal */}
      <EmergencyModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />
    </>
  );
}

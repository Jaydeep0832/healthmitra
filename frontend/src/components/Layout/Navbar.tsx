import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Activity,
  LogOut,
  MessageSquare,
  Hospital,
  Home,
  Stethoscope,
  FileText,
  LayoutDashboard,
  ShieldAlert,
  Menu,
  X,
  User as UserIcon
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
      <nav className="bg-white/95 backdrop-blur border-b border-gray-100 shadow-xs sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2.5 group">
                <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition transform">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-1">
                    HealthMitra <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded-md">2.0</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium -mt-1">Rural Healthcare AI</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center px-3 py-2 rounded-xl text-xs font-bold transition ${
                      active
                        ? 'bg-blue-50 text-blue-700 shadow-2xs'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
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
                <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 py-1 px-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition text-xs font-bold text-gray-700"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                      {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[120px] truncate">{user?.full_name || user?.email}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-gray-700 hover:text-blue-600 px-3 py-2 rounded-xl transition"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition"
                  >
                    Sign up
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
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-200 shadow-xl">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                    active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" /> {item.label}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-gray-100">
              {isAuthenticated ? (
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs font-semibold text-gray-600">{user?.full_name || user?.email}</span>
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
                    className="text-center py-2 text-xs font-bold text-gray-700 border border-gray-200 rounded-xl"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 text-xs font-bold text-white bg-blue-600 rounded-xl"
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

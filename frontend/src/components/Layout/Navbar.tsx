import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Activity, LogOut, MessageSquare, Hospital, Home } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">HealthMitra</span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600">
              <Home className="h-4 w-4 mr-1" /> Home
            </Link>
            <Link to="/chatbot" className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600">
              <MessageSquare className="h-4 w-4 mr-1" /> Chatbot
            </Link>
            <Link to="/hospitals" className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600">
              <Hospital className="h-4 w-4 mr-1" /> Hospitals
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-700 font-medium">
                  {user?.full_name || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

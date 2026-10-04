import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MessageSquare, Hospital, LayoutDashboard } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen p-4 space-y-2">
      <Link to="/" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
        <Home className="h-5 w-5" /> <span>Home</span>
      </Link>
      <Link to="/chatbot" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
        <MessageSquare className="h-5 w-5" /> <span>Chatbot</span>
      </Link>
      <Link to="/hospitals" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
        <Hospital className="h-5 w-5" /> <span>Hospitals</span>
      </Link>
      <Link to="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
        <LayoutDashboard className="h-5 w-5" /> <span>Dashboard</span>
      </Link>
    </aside>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ProfileCard from '../components/Dashboard/ProfileCard';
import MedicalHistory from '../components/Dashboard/MedicalHistory';
import ChatHistoryDashboard from '../components/Dashboard/ChatHistoryDashboard';

interface DashboardStats {
  consultation_count: number;
  last_visit: string | null;
  medical_records_count: number;
  health_score: number;
  profile: any;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', age: '', gender: '', phone: '', language: 'en' });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, historyRes, chatRes] = await Promise.all([
        api.get('/api/v1/patients/me/dashboard'),
        api.get('/api/v1/patients/me/medical-history?limit=20'),
        api.get('/api/v1/patients/me/chat-history?limit=10'),
      ]);
      setStats(statsRes.data);
      setMedicalRecords(historyRes.data.records || []);
      setChatSessions(chatRes.data.sessions || []);

      if (statsRes.data.profile) {
        const p = statsRes.data.profile;
        setEditForm({
          name: p.name || '',
          age: p.age?.toString() || '',
          gender: p.gender || '',
          phone: p.phone || '',
          language: p.language || 'en',
        });
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleSaveProfile = async () => {
    try {
      await api.put('/api/v1/patients/me', {
        name: editForm.name,
        age: editForm.age ? parseInt(editForm.age) : null,
        gender: editForm.gender || null,
        phone: editForm.phone || null,
        language: editForm.language,
      });
      setEditing(false);
      loadDashboard();
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  const healthScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-400 to-emerald-600';
    if (score >= 60) return 'from-amber-400 to-amber-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-6">
        <h1 className="text-2xl font-bold">📊 Dashboard</h1>
        <p className="text-sm text-indigo-200 mt-1">
          Your health overview and medical history
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-4 relative z-10 space-y-4">
        {/* Profile Card */}
        <ProfileCard
          profile={stats?.profile || null}
          onEdit={() => setEditing(true)}
        />

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">✏️ Edit Profile</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Age"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                  >
                    <option value="">Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <input
                  type="tel"
                  placeholder="Phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                />
                <select
                  value={editForm.language}
                  onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="gu">Gujarati</option>
                  <option value="mr">Marathi</option>
                  <option value="bn">Bengali</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Consultations</p>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '—' : stats?.consultation_count || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Medical Records</p>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? '—' : stats?.medical_records_count || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Health Score</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-800">
                {loading ? '—' : stats?.health_score || 85}
              </p>
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${healthScoreColor(stats?.health_score || 85)} flex items-center justify-center text-white text-xs font-bold`}>
                %
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Last Visit</p>
            <p className="text-sm font-medium text-gray-800">
              {loading
                ? '—'
                : stats?.last_visit
                ? new Date(stats.last_visit).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })
                : 'Never'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/chatbot')}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 text-center hover:shadow-lg transition transform hover:scale-[1.02]"
          >
            <div className="text-2xl mb-1">💬</div>
            <p className="text-sm font-medium">Talk to Chatbot</p>
          </button>
          <button
            onClick={() => navigate('/hospitals')}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 text-center hover:shadow-lg transition transform hover:scale-[1.02]"
          >
            <div className="text-2xl mb-1">🏥</div>
            <p className="text-sm font-medium">Find Hospital</p>
          </button>
          <button
            onClick={loadDashboard}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 text-center hover:shadow-lg transition transform hover:scale-[1.02]"
          >
            <div className="text-2xl mb-1">🔄</div>
            <p className="text-sm font-medium">Refresh Data</p>
          </button>
        </div>

        {/* Medical History + Chat History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              🩺 Medical History
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                {medicalRecords.length}
              </span>
            </h3>
            <MedicalHistory records={medicalRecords} loading={loading} />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              💬 Recent Chats
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                {chatSessions.length}
              </span>
            </h3>
            <ChatHistoryDashboard sessions={chatSessions} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

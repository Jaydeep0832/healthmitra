import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import ProfileCard from '../components/Dashboard/ProfileCard';
import MedicalHistory from '../components/Dashboard/MedicalHistory';
import ChatHistoryDashboard from '../components/Dashboard/ChatHistoryDashboard';
import AshaCommunityPortal from '../components/Dashboard/AshaCommunityPortal';

interface DashboardStats {
  consultation_count: number;
  last_visit: string | null;
  medical_records_count: number;
  health_score: number;
  profile: any;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'community'>('personal');
  const [editForm, setEditForm] = useState({ name: '', age: '', gender: '', phone: '', language: 'en' });

  const isAsha = user?.role === 'asha_worker' || user?.role === 'admin';

  useEffect(() => {
    if (user?.role === 'asha_worker') {
      setActiveTab('community');
    }
  }, [user?.role]);

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

      const p = statsRes.data.profile;
      if (p) {
        setEditForm({
          name: p.name || user?.full_name || '',
          age: p.age ? p.age.toString() : '',
          gender: p.gender || '',
          phone: p.phone || '',
          language: p.language || 'en',
        });
      } else if (user) {
        setEditForm({
          name: user.full_name || '',
          age: '',
          gender: '',
          phone: '',
          language: 'en',
        });
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

  const currentProfile = stats?.profile || (user ? {
    name: user.full_name || user.email.split('@')[0],
    language: 'en',
    user_id: user.id,
  } : null);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Banner */}
      <div className={`text-white px-6 py-6 transition-colors ${
        isAsha && activeTab === 'community'
          ? 'bg-gradient-to-r from-teal-700 via-emerald-700 to-cyan-800'
          : 'bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700'
      }`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>📊</span>
              {isAsha && activeTab === 'community' ? 'ASHA Healthcare Portal' : 'Patient Health Dashboard'}
            </h1>
            <p className="text-sm opacity-90 mt-1">
              {isAsha && activeTab === 'community'
                ? 'Community wellness monitoring, village roster, and field care navigation'
                : 'Your personal health records, wellness index, and AI medical consultations'}
            </p>
          </div>

          {/* Role Tabs for ASHA Worker */}
          {isAsha && (
            <div className="bg-white/20 p-1 rounded-xl backdrop-blur-sm border border-white/30 flex gap-1 self-stretch sm:self-auto">
              <button
                onClick={() => setActiveTab('community')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 flex-1 sm:flex-initial justify-center ${
                  activeTab === 'community'
                    ? 'bg-white text-emerald-800 shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span>🩺</span> Community Roster
              </button>
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 flex-1 sm:flex-initial justify-center ${
                  activeTab === 'personal'
                    ? 'bg-white text-indigo-800 shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span>👤</span> My Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-4 relative z-10 space-y-5">
        {/* Profile Card Always Shown at Top */}
        <ProfileCard
          profile={currentProfile}
          fallbackName={user?.full_name}
          role={user?.role}
          onEdit={() => setEditing(true)}
        />

        {/* View Switch: ASHA Community vs. Personal */}
        {isAsha && activeTab === 'community' ? (
          <AshaCommunityPortal />
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">✏️ Edit Profile Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 45"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Preferred Language</label>
                <select
                  value={editForm.language}
                  onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                >
                  <option value="gu">Gujarati (ગુજરાતી)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

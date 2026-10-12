import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

interface CommunityPatient {
  id: string;
  user_id: string;
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  village?: string;
  location?: string;
  primary_condition?: string;
  risk_level?: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  created_at?: string;
  medical_records_count?: number;
  consultation_count?: number;
  home_visits?: Array<{
    date: string;
    bp?: string;
    blood_sugar?: string;
    temperature?: string;
    weight?: string;
    hemoglobin?: string;
    notes?: string;
    action_taken?: string;
    follow_up_date?: string;
  }>;
}

export default function AshaCommunityPortal() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<CommunityPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'URGENT' | 'MATERNAL' | 'NORMAL'>('ALL');
  
  // Modals state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [visitModalPatient, setVisitModalPatient] = useState<CommunityPatient | null>(null);
  const [referralModalPatient, setReferralModalPatient] = useState<CommunityPatient | null>(null);
  
  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const [registerForm, setRegisterForm] = useState({
    name: '',
    age: '',
    gender: 'female',
    phone: '',
    village: 'Ahmedabad Rural - Ward 4',
    primary_condition: 'General Checkup / Antenatal',
    risk_level: 'NORMAL',
    language: 'gu',
  });

  const [visitForm, setVisitForm] = useState({
    bp: '',
    blood_sugar: '',
    temperature: '',
    weight: '',
    hemoglobin: '',
    notes: '',
    action_taken: 'Home visit vitals checked and dietary advice given',
    follow_up_date: '',
    risk_level: 'NORMAL' as 'NORMAL' | 'URGENT' | 'EMERGENCY',
  });

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/patients/community?limit=100');
      setPatients(res.data.patients || []);
    } catch (err) {
      console.error('Failed to load community patients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleRegisterVillager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name.trim()) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/api/v1/patients/community/register', {
        name: registerForm.name.trim(),
        age: registerForm.age ? parseInt(registerForm.age) : null,
        gender: registerForm.gender,
        phone: registerForm.phone.trim() || null,
        village: registerForm.village.trim(),
        primary_condition: registerForm.primary_condition.trim(),
        risk_level: registerForm.risk_level,
        language: registerForm.language,
      });
      setShowRegisterModal(false);
      setRegisterForm({
        name: '',
        age: '',
        gender: 'female',
        phone: '',
        village: 'Ahmedabad Rural - Ward 4',
        primary_condition: 'General Checkup',
        risk_level: 'NORMAL',
        language: 'gu',
      });
      showToast('✅ Villager registered successfully in your community roster!');
      loadPatients();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to register villager.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRisk = async (patient: CommunityPatient, newRisk: 'NORMAL' | 'URGENT' | 'EMERGENCY') => {
    try {
      const pId = patient.id || patient.user_id;
      await api.patch(`/api/v1/patients/community/${pId}`, { risk_level: newRisk });
      setPatients((prev) =>
        prev.map((p) => ((p.id === patient.id || p.user_id === patient.user_id) ? { ...p, risk_level: newRisk } : p))
      );
      showToast(`⚡ Updated ${patient.name || 'Villager'} status to ${newRisk}`);
    } catch (err) {
      console.error('Failed to update risk:', err);
      showToast('❌ Failed to update patient risk status.');
    }
  };

  const handleDeletePatient = async (patient: CommunityPatient) => {
    const name = patient.name || 'this resident';
    if (!window.confirm(`Are you sure you want to discharge/remove ${name} from your active ward roster?`)) {
      return;
    }
    try {
      const pId = patient.id || patient.user_id;
      await api.delete(`/api/v1/patients/community/${pId}`);
      setPatients((prev) => prev.filter((p) => p.id !== patient.id && p.user_id !== patient.user_id));
      showToast(`🗑️ ${name} discharged from active roster.`);
    } catch (err) {
      console.error('Failed to remove patient:', err);
      showToast('❌ Failed to remove villager record.');
    }
  };

  const handleSaveVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitModalPatient) return;
    setSubmitting(true);
    try {
      const pId = visitModalPatient.id || visitModalPatient.user_id;
      await api.post(`/api/v1/patients/community/${pId}/visit`, visitForm);
      setVisitModalPatient(null);
      setVisitForm({
        bp: '',
        blood_sugar: '',
        temperature: '',
        weight: '',
        hemoglobin: '',
        notes: '',
        action_taken: 'Home visit vitals checked and dietary advice given',
        follow_up_date: '',
        risk_level: 'NORMAL',
      });
      showToast(`📝 Health visit vitals recorded for ${visitModalPatient.name}!`);
      loadPatients();
    } catch (err) {
      console.error('Failed to log visit:', err);
      showToast('❌ Could not save visit notes.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (patients.length === 0) return;
    const headers = ['Name', 'Age', 'Gender', 'Phone', 'Village_Ward', 'Primary_Condition', 'Risk_Status', 'Consultations'];
    const rows = patients.map((p) => [
      `"${p.name || 'Resident'}"`,
      p.age || 'N/A',
      p.gender || 'N/A',
      `"${p.phone || 'N/A'}"`,
      `"${p.village || p.location || 'Local Village'}"`,
      `"${p.primary_condition || 'Routine Follow-up'}"`,
      p.risk_level || 'NORMAL',
      p.consultation_count || 0,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `asha_community_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Community roster exported as CSV!');
  };

  const filteredPatients = (patients || []).filter((p) => {
    if (!p) return false;
    const q = (search || '').toLowerCase();
    const nameMatch = p.name ? p.name.toLowerCase().includes(q) : false;
    const phoneMatch = p.phone ? p.phone.includes(q) : false;
    const villageMatch = (p.village || p.location) ? ((p.village || p.location)!.toLowerCase().includes(q)) : false;
    const matchesSearch = nameMatch || phoneMatch || villageMatch;
    if (!matchesSearch) return false;

    if (filterType === 'URGENT') return p.risk_level === 'URGENT' || p.risk_level === 'EMERGENCY';
    if (filterType === 'MATERNAL') return p.gender?.toLowerCase() === 'female' || (p.primary_condition && p.primary_condition.toLowerCase().includes('antenatal'));
    if (filterType === 'NORMAL') return p.risk_level === 'NORMAL' || !p.risk_level;
    return true;
  });

  const urgentCount = (patients || []).filter((p) => p && (p.risk_level === 'URGENT' || p.risk_level === 'EMERGENCY')).length;
  const femaleCount = (patients || []).filter((p) => p && p.gender && p.gender.toLowerCase() === 'female').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <span>{notification}</span>
        </div>
      )}

      {/* ASHA Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/20 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              ASHA Community Field Portal
            </span>
            <span className="text-emerald-100 text-xs">• National Health Mission Support</span>
          </div>
          <h2 className="text-2xl font-bold">Rural Healthcare & Villager Registry</h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            Track vital signs, record home observations, manage high-risk cases, and issue immediate PHC referrals.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition active:scale-95 flex items-center gap-2"
          >
            <span>➕</span> Register Villager
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2"
            title="Download Monthly Roster for Sub-Center Reporting"
          >
            <span>📥</span> Export CSV
          </button>
          <button
            onClick={() => navigate('/symptoms')}
            className="bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-400/30 text-white px-3.5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-1.5"
          >
            <span>🩺</span> Triage
          </button>
        </div>
      </div>

      {/* Community Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => setFilterType('ALL')}
          className={`rounded-xl p-4 shadow-sm border transition cursor-pointer ${
            filterType === 'ALL' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400' : 'bg-white border-gray-100 hover:bg-gray-50'
          }`}
        >
          <p className="text-xs text-gray-500 mb-1">👥 Registered Villagers</p>
          <p className="text-2xl font-bold text-gray-800">{loading ? '—' : patients.length}</p>
          <p className="text-[11px] text-emerald-600 mt-1">Under local ward care</p>
        </div>
        <div
          onClick={() => setFilterType('URGENT')}
          className={`rounded-xl p-4 shadow-sm border transition cursor-pointer ${
            filterType === 'URGENT' ? 'bg-red-50 border-red-300 ring-2 ring-red-400' : 'bg-white border-gray-100 hover:bg-gray-50'
          }`}
        >
          <p className="text-xs text-gray-500 mb-1">🚨 Urgent / Risk Alerts</p>
          <p className="text-2xl font-bold text-red-600">{loading ? '—' : urgentCount}</p>
          <p className="text-[11px] text-red-600 mt-1">Requires PHC visit</p>
        </div>
        <div
          onClick={() => setFilterType('MATERNAL')}
          className={`rounded-xl p-4 shadow-sm border transition cursor-pointer ${
            filterType === 'MATERNAL' ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-400' : 'bg-white border-gray-100 hover:bg-gray-50'
          }`}
        >
          <p className="text-xs text-gray-500 mb-1">🤰 Maternal & Child Care</p>
          <p className="text-2xl font-bold text-teal-600">{loading ? '—' : femaleCount}</p>
          <p className="text-[11px] text-teal-600 mt-1">Antenatal / Immunization</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">🏥 Nearest Health Center</p>
          <p className="text-sm font-bold text-gray-800 mt-1">Civil Hospital & PHC</p>
          <button
            onClick={() => navigate('/hospitals')}
            className="text-[11px] text-cyan-700 hover:underline font-semibold mt-1 inline-block"
          >
            Check bed availability →
          </button>
        </div>
      </div>

      {/* Villagers Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              📋 Village Patient Roster
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                {filteredPatients.length} Shown
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Assigned rural residents with complete health tracking and field controls
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {/* Filter Pills */}
            <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold gap-1">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-lg transition ${filterType === 'ALL' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('URGENT')}
                className={`px-2.5 py-1 rounded-lg transition ${filterType === 'URGENT' ? 'bg-red-600 text-white shadow-xs' : 'text-gray-500'}`}
              >
                🚨 Urgent
              </button>
              <button
                onClick={() => setFilterType('MATERNAL')}
                className={`px-2.5 py-1 rounded-lg transition ${filterType === 'MATERNAL' ? 'bg-teal-600 text-white shadow-xs' : 'text-gray-500'}`}
              >
                🤰 Maternal
              </button>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="🔍 Search name, phone, or ward..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3.5 py-1.5 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-300 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading village patient roster...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-3xl mb-2">🏡</p>
            <p className="text-gray-600 font-medium">No villagers found matching this filter.</p>
            <p className="text-xs text-gray-400 mt-1">
              Switch filter or click "Register Villager" to add a new rural resident.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Villager Name</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Village / Ward</th>
                  <th className="py-3 px-4">Primary Condition</th>
                  <th className="py-3 px-4">Risk Status (Click to Change)</th>
                  <th className="py-3 px-4 text-right">Field Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((patient, idx) => {
                  const isUrgent = patient.risk_level === 'URGENT' || patient.risk_level === 'EMERGENCY';
                  const displayName = patient.name || 'Rural Resident';
                  const displayInitial = displayName.charAt(0).toUpperCase() || 'R';
                  return (
                    <tr key={patient.id || patient.user_id || idx} className="hover:bg-gray-50/75 transition">
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            isUrgent ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {displayInitial}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{displayName}</p>
                            <p className="text-xs text-gray-400">📱 {patient.phone || 'No phone'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-gray-600">
                          {patient.age ? `${patient.age} yrs` : 'Age N/A'} •{' '}
                          {patient.gender ? (patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)) : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600">
                        📍 {patient.village || patient.location || 'Local Village'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-700">
                        {patient.primary_condition || 'Routine Follow-up'}
                      </td>
                      <td className="py-3.5 px-4">
                        {/* Interactive Risk Selector */}
                        <select
                          value={patient.risk_level || 'NORMAL'}
                          onChange={(e) => handleUpdateRisk(patient, e.target.value as any)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider border cursor-pointer outline-none transition ${
                            patient.risk_level === 'EMERGENCY'
                              ? 'bg-red-600 text-white border-red-700'
                              : patient.risk_level === 'URGENT'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          <option value="NORMAL">🟢 Normal</option>
                          <option value="URGENT">🟡 Urgent</option>
                          <option value="EMERGENCY">🔴 Emergency</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        {/* Log Home Visit */}
                        <button
                          onClick={() => {
                            setVisitModalPatient(patient);
                            setVisitForm((f) => ({ ...f, risk_level: patient.risk_level || 'NORMAL' }));
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                          title="Record home visit vitals"
                        >
                          📝 Visit
                        </button>

                        {/* Referral Slip */}
                        <button
                          onClick={() => setReferralModalPatient(patient)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                          title="Generate PHC referral slip"
                        >
                          🚨 Refer
                        </button>

                        {/* Field Triage */}
                        <button
                          onClick={() => navigate('/symptoms')}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                          title="Triage this villager"
                        >
                          🩺 Triage
                        </button>

                        {/* Delete / Discharge */}
                        <button
                          onClick={() => handleDeletePatient(patient)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Discharge from active roster"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal 1: Register Villager ── */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <span>➕</span> Register Villager
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterVillager} className="space-y-4 mt-4">
              {errorMsg && (
                <div className="text-red-600 text-xs bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shakuntala Ben"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    placeholder="e.g. 28"
                    value={registerForm.age}
                    onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
                  <select
                    value={registerForm.gender}
                    onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Village / Ward</label>
                <input
                  type="text"
                  placeholder="e.g. Ward 4, Navsari"
                  value={registerForm.village}
                  onChange={(e) => setRegisterForm({ ...registerForm, village: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Condition / Program</label>
                <input
                  type="text"
                  placeholder="e.g. Antenatal Care, Diabetes, Fever"
                  value={registerForm.primary_condition}
                  onChange={(e) => setRegisterForm({ ...registerForm, primary_condition: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Risk Status</label>
                <select
                  value={registerForm.risk_level}
                  onChange={(e) => setRegisterForm({ ...registerForm, risk_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                >
                  <option value="NORMAL">🟢 Normal (Routine follow-up)</option>
                  <option value="URGENT">🟡 Urgent (Requires PHC evaluation)</option>
                  <option value="EMERGENCY">🔴 Emergency (Immediate ambulance)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  {submitting ? 'Registering...' : 'Register Villager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 2: Record Field Visit & Vitals ── */}
      {visitModalPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <span>📝</span> Record Home Visit Vitals
                </h3>
                <p className="text-xs text-gray-500">Patient: {visitModalPatient.name} • {visitModalPatient.village || 'Ward'}</p>
              </div>
              <button
                onClick={() => setVisitModalPatient(null)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVisit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Pressure (BP)</label>
                  <input
                    type="text"
                    placeholder="e.g. 120/80 mmHg"
                    value={visitForm.bp}
                    onChange={(e) => setVisitForm({ ...visitForm, bp: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Sugar</label>
                  <input
                    type="text"
                    placeholder="e.g. 110 mg/dL"
                    value={visitForm.blood_sugar}
                    onChange={(e) => setVisitForm({ ...visitForm, blood_sugar: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Temperature</label>
                  <input
                    type="text"
                    placeholder="e.g. 98.6 °F"
                    value={visitForm.temperature}
                    onChange={(e) => setVisitForm({ ...visitForm, temperature: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Weight</label>
                  <input
                    type="text"
                    placeholder="e.g. 58 kg"
                    value={visitForm.weight}
                    onChange={(e) => setVisitForm({ ...visitForm, weight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Hemoglobin (Hb)</label>
                  <input
                    type="text"
                    placeholder="e.g. 11.5 g/dL"
                    value={visitForm.hemoglobin}
                    onChange={(e) => setVisitForm({ ...visitForm, hemoglobin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Field Observations / Symptoms</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Mild headache, swelling in feet, fetal movements normal."
                  value={visitForm.notes}
                  onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={visitForm.follow_up_date}
                    onChange={(e) => setVisitForm({ ...visitForm, follow_up_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Update Risk Level</label>
                  <select
                    value={visitForm.risk_level}
                    onChange={(e) => setVisitForm({ ...visitForm, risk_level: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                  >
                    <option value="NORMAL">🟢 Normal</option>
                    <option value="URGENT">🟡 Urgent</option>
                    <option value="EMERGENCY">🔴 Emergency</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVisitModalPatient(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  {submitting ? 'Saving...' : 'Save Visit Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 3: Printable PHC Referral Slip ── */}
      {referralModalPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">National Health Mission Referral Slip</h3>
                  <p className="text-[11px] text-gray-500">Government Primary / Community Health Centre (PHC/CHC)</p>
                </div>
              </div>
              <button
                onClick={() => setReferralModalPatient(null)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 p-4 rounded-xl border-2 border-dashed border-red-200 bg-red-50/50 space-y-3 text-xs text-gray-800">
              <div className="flex justify-between border-b border-red-100 pb-2">
                <div>
                  <p className="font-bold text-sm text-gray-900">{referralModalPatient.name}</p>
                  <p className="text-gray-500">Age: {referralModalPatient.age || 'N/A'} • Gender: {referralModalPatient.gender || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                    {referralModalPatient.risk_level || 'URGENT'}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5">Date: {new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div>
                <p className="font-bold text-gray-700">Ward / Village:</p>
                <p>{referralModalPatient.village || referralModalPatient.location || 'Local Village Ward'}</p>
              </div>

              <div>
                <p className="font-bold text-gray-700">Reason for Referral / Symptoms:</p>
                <p className="font-medium text-red-900">{referralModalPatient.primary_condition || 'Suspected acute condition requiring diagnostic & doctor evaluation.'}</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-red-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-xs">Referred Center:</p>
                  <p className="text-gray-600">Civil Hospital & Community Health Centre</p>
                </div>
                <div className="text-right">
                  <a
                    href="tel:108"
                    className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs"
                  >
                    <span>🚑</span> Call 108
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setReferralModalPatient(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  showToast('🖨️ Referral slip ready to print!');
                }}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <span>🖨️</span> Print Referral Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

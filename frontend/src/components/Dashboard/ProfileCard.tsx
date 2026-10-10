import React from 'react';

interface ProfileCardProps {
  profile: {
    name?: string;
    age?: number;
    gender?: string;
    language?: string;
    phone?: string;
    user_id?: string;
  } | null;
  fallbackName?: string;
  role?: string;
  onEdit: () => void;
}

const languageNames: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  gu: 'Gujarati',
  mr: 'Marathi',
  bn: 'Bengali',
};

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, fallbackName, role = 'patient', onEdit }) => {
  const displayName = profile?.name || fallbackName || 'User';
  const initial = displayName.charAt(0).toUpperCase() || '?';
  const language = profile?.language || 'en';
  const isAsha = role === 'asha_worker';

  return (
    <div
      className={`rounded-2xl p-6 text-white shadow-lg transition-all ${
        isAsha
          ? 'bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700'
          : 'bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-inner">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold truncate">{displayName}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-white/20 border border-white/30">
                {isAsha ? '🩺 ASHA Worker' : role === 'admin' ? '🛡️ Admin' : '👤 Patient'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-blue-100">
              {profile?.age ? (
                <span className="font-medium">🎂 {profile.age} yrs</span>
              ) : (
                <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs text-blue-200">
                  🎂 Age not set
                </span>
              )}

              {profile?.gender ? (
                <span className="font-medium">
                  • {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                </span>
              ) : (
                <span className="bg-white/10 px-2 py-0.5 rounded-md text-xs text-blue-200">
                  • Gender not set
                </span>
              )}

              <span>• 🌐 {languageNames[language] || language}</span>
            </div>

            <div className="text-xs text-blue-200 mt-2 flex flex-wrap items-center gap-3">
              <span>📱 {profile?.phone || 'Phone number not set'}</span>
              {(!profile?.age || !profile?.phone) && (
                <span className="text-amber-200 font-medium">
                  ← Click "Edit Profile" to add age & details
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="self-start sm:self-center bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl px-4 py-2 text-sm font-semibold transition flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <span>✏️</span> Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;

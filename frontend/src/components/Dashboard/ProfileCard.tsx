import React from 'react';

interface ProfileCardProps {
  profile: {
    name: string;
    age?: number;
    gender?: string;
    language: string;
    phone?: string;
    user_id: string;
  } | null;
  onEdit: () => void;
}

const languageNames: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  gu: 'Gujarati',
  mr: 'Marathi',
  bn: 'Bengali',
};

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onEdit }) => {
  if (!profile) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-20 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
          {profile.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate">{profile.name || 'User'}</h2>
          <div className="flex flex-wrap gap-2 mt-1 text-sm text-blue-100">
            {profile.age && <span>🎂 {profile.age} yrs</span>}
            {profile.gender && <span>• {profile.gender}</span>}
            <span>• 🌐 {languageNames[profile.language] || profile.language}</span>
          </div>
          {profile.phone && (
            <p className="text-xs text-blue-200 mt-1">📱 {profile.phone}</p>
          )}
        </div>
        <button
          onClick={onEdit}
          className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 text-sm font-medium transition"
        >
          ✏️ Edit
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;

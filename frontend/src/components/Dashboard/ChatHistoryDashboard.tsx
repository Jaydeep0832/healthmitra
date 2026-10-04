import React from 'react';

interface ChatSession {
  id: string;
  user_id: string;
  messages: any[];
  created_at: string;
  duration_seconds?: number;
  resolved?: boolean;
}

interface ChatHistoryDashboardProps {
  sessions: ChatSession[];
  loading: boolean;
}

const ChatHistoryDashboard: React.FC<ChatHistoryDashboardProps> = ({
  sessions,
  loading,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-xl p-4 h-16" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">💬</div>
        <h3 className="font-medium text-gray-600">No chat history</h3>
        <p className="text-sm text-gray-400 mt-1">
          Start a conversation with HealthMitra
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {sessions.map((session) => {
        const date = new Date(session.created_at);
        const msgCount = session.messages?.length || 0;
        const duration = session.duration_seconds
          ? `${Math.round(session.duration_seconds / 60)} min`
          : '';

        return (
          <div
            key={session.id}
            className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:shadow-sm transition cursor-pointer"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                session.resolved
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-amber-100 text-amber-600'
              }`}
            >
              {session.resolved ? '✅' : '⏳'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                Session • {msgCount} messages
              </p>
              <p className="text-xs text-gray-400">
                {date.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}{' '}
                {date.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {duration && ` • ${duration}`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatHistoryDashboard;

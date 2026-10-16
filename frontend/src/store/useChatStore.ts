import { create } from 'zustand';
import { api } from '../services/api';

export interface ChatMessage {
  user_message: string;
  ai_response: string;
  language: string;
  timestamp?: string;
  confidence?: number;
  ai_diagnosis?: string;
  should_escalate?: boolean;
}

export interface ChatSessionMeta {
  session_id: string;
  title: string;
  created_at: string;
  message_count: number;
}

interface ChatState {
  messages: ChatMessage[];
  currentLanguage: string;
  currentSessionId: string | null;
  activeUserId: string | null;
  sessions: ChatSessionMeta[];
  isLoading: boolean;
  setLanguage: (lang: string) => void;
  resetChat: () => void;
  startNewSession: () => Promise<void>;
  fetchHistory: (userId?: string, sessionId?: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  currentLanguage: 'auto',
  currentSessionId: null,
  activeUserId: null,
  sessions: [],
  isLoading: false,

  setLanguage: (lang) => set({ currentLanguage: lang }),

  resetChat: () =>
    set({
      messages: [],
      currentSessionId: null,
      activeUserId: null,
      sessions: [],
      isLoading: false,
    }),

  startNewSession: async () => {
    try {
      set({ isLoading: true });
      const response = await api.post<{ session_id: string; title: string }>('/api/v1/chatbot/session/new');
      set({
        messages: [],
        currentSessionId: response.data.session_id,
        isLoading: false,
      });
    } catch (error) {
      console.warn('Fallback to local new session generation', error);
      // Fallback: local random session ID
      const localSessionId = 'session_' + Math.random().toString(36).substring(2, 11);
      set({
        messages: [],
        currentSessionId: localSessionId,
        isLoading: false,
      });
    }
  },

  fetchHistory: async (userId?: string, sessionId?: string) => {
    const { activeUserId } = get();

    // If switching to a new user account, immediately wipe previous user's messages
    if (userId && activeUserId && userId !== activeUserId) {
      set({
        messages: [],
        currentSessionId: null,
        activeUserId: userId,
        sessions: [],
      });
    } else if (userId && !activeUserId) {
      set({ activeUserId: userId });
    }

    try {
      set({ isLoading: true });
      const targetSession = sessionId || get().currentSessionId;
      const url = targetSession
        ? `/api/v1/chatbot/history?session_id=${encodeURIComponent(targetSession)}`
        : '/api/v1/chatbot/history';

      const response = await api.get<ChatMessage[]>(url);
      const fetchedMessages = Array.isArray(response.data) ? response.data : [];
      set({
        messages: fetchedMessages,
        currentSessionId: targetSession || null,
        activeUserId: userId || get().activeUserId,
        isLoading: false,
      });
    } catch (error) {
      console.warn('Failed to fetch chat history; initializing clean session', error);
      // If fetching fails (e.g. fresh user with no records or unauthorized), start with clean messages
      set({
        messages: [],
        isLoading: false,
      });
    }
  },

  sendMessage: async (text) => {
    const { currentLanguage, currentSessionId, messages } = get();
    // Optimistic update
    const tempMsg: ChatMessage = {
      user_message: text,
      ai_response: '...',
      language: currentLanguage,
    };
    set({ messages: [...messages, tempMsg], isLoading: true });

    try {
      const response = await api.post('/api/v1/chatbot/message', {
        text,
        language: currentLanguage,
        session_id: currentSessionId || undefined,
      });

      const newMessages = [...get().messages];
      newMessages[newMessages.length - 1] = {
        user_message: text,
        ai_response: response.data.response,
        language: currentLanguage,
        confidence: response.data.confidence,
        ai_diagnosis: response.data.ai_diagnosis,
        should_escalate: response.data.should_escalate,
      };

      set({
        messages: newMessages,
        currentSessionId: response.data.session_id || currentSessionId,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to send message', error);
      const newMessages = [...get().messages];
      newMessages[newMessages.length - 1].ai_response =
        'Sorry, failed to connect to healthcare server. Please retry in a moment.';
      set({ messages: newMessages, isLoading: false });
    }
  },
}));

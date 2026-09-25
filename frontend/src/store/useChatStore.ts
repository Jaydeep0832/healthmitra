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

interface ChatState {
  messages: ChatMessage[];
  currentLanguage: string;
  isLoading: boolean;
  setLanguage: (lang: string) => void;
  fetchHistory: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  currentLanguage: 'auto',
  isLoading: false,

  setLanguage: (lang) => set({ currentLanguage: lang }),

  fetchHistory: async () => {
    try {
      const response = await api.get<ChatMessage[]>('/api/v1/chatbot/history');
      set({ messages: response.data });
    } catch (error) {
      console.error('Failed to fetch chat history', error);
    }
  },

  sendMessage: async (text) => {
    const { currentLanguage, messages } = get();
    // Optimistic update
    const tempMsg: ChatMessage = {
      user_message: text,
      ai_response: '...',
      language: currentLanguage
    };
    set({ messages: [...messages, tempMsg], isLoading: true });

    try {
      const response = await api.post('/api/v1/chatbot/message', {
        text,
        language: currentLanguage
      });
      
      const newMessages = [...get().messages];
      newMessages[newMessages.length - 1] = {
        user_message: text,
        ai_response: response.data.response,
        language: currentLanguage,
        confidence: response.data.confidence,
        ai_diagnosis: response.data.ai_diagnosis,
        should_escalate: response.data.should_escalate
      };
      
      set({ messages: newMessages, isLoading: false });
    } catch (error) {
      console.error('Failed to send message', error);
      const newMessages = [...get().messages];
      newMessages[newMessages.length - 1].ai_response = "Sorry, failed to connect to server.";
      set({ messages: newMessages, isLoading: false });
    }
  }
}));

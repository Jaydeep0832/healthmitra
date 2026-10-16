import { create } from 'zustand';
import { UserResponse } from '../types/models';
import { authService } from '../services/auth';
import { useChatStore } from './useChatStore';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  logout: () => void;
  setUser: (user: UserResponse) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      const user = await authService.getMe();
      const currentUser = get().user;
      // If switching accounts, reset chat session
      if (currentUser && currentUser.id !== user.id) {
        useChatStore.getState().resetChat();
      }
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      authService.logout();
      localStorage.removeItem('user');
      useChatStore.getState().resetChat();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    authService.logout();
    localStorage.removeItem('user');
    useChatStore.getState().resetChat();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    const currentUser = get().user;
    if (currentUser && currentUser.id !== user.id) {
      useChatStore.getState().resetChat();
    }
    set({ user, isAuthenticated: true });
  },
}));

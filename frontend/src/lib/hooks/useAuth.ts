import { create } from 'zustand';
import api, { AuthResponse } from '@/lib/api/auth';

type UserRank = 'お試し' | '退会者' | '初伝' | '中伝' | '奥伝' | '皆伝' | '管理者';

interface User {
  id: string;
  email: string;
  name?: string;
  rank: UserRank;
  mongoId?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (emailOrToken: string, password?: string) => Promise<boolean>;
  logout: () => void;
  setInitialized: (state: boolean) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  login: async (emailOrToken: string, password?: string) => {
    set({ loading: true, error: null });
    try {
      let response;

      if (password) {
        response = await api.post<AuthResponse>('/auth/login', {
          email: emailOrToken,
          password
        });
      } else {
        response = await api.get<AuthResponse>('/auth/verify', {
          headers: {
            Authorization: `Bearer ${emailOrToken}`
          }
        });
      }

      const { success, token, user } = response.data;
      
      if (success && token && user) {
        localStorage.setItem('auth_token', token);
        set({ user, loading: false, error: null });
        return true;
      }

      set({ 
        error: response.data.message || '認証に失敗しました', 
        loading: false 
      });
      return false;

    } catch (error) {
      localStorage.removeItem('auth_token');
      set({ 
        user: null,
        error: '認証に失敗しました', 
        loading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, loading: false, error: null });
  },

  setInitialized: (state) => set({ initialized: state })
}));

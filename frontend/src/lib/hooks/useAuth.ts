import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { AuthResponse } from '@/lib/api/auth';
import { User, UserRank } from '@/types/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (emailOrToken: string, password?: string) => Promise<boolean>;
  logout: () => void;
  setInitialized: (state: boolean) => void;
  checkAuth: () => Promise<void>;
}

const isValidUserRank = (rank: string): rank is UserRank => {
  const validRanks: UserRank[] = ['お試し', '退会者', '初伝', '中伝', '奥伝', '皆伝', '管理者'];
  return validRanks.includes(rank as UserRank);
};

const validateUser = (user: any): User => {
  if (!user.rank || !isValidUserRank(user.rank)) {
    throw new Error('Invalid user rank');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    rank: user.rank as UserRank,
    mongoId: user.mongoId
  };
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      error: null,
      initialized: false,

      checkAuth: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) {
            set({ loading: false });
            return;
          }

          const response = await api.get<AuthResponse>('/auth/verify');
          const { success, user: rawUser } = response.data;
          
          if (success && rawUser) {
            const validatedUser = validateUser(rawUser);
            set({ user: validatedUser, loading: false, error: null });
          } else {
            localStorage.removeItem('auth_token');
            set({ user: null, loading: false });
          }
        } catch (error) {
          localStorage.removeItem('auth_token');
          set({ user: null, loading: false });
        }
      },

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

          const { success, token, user: rawUser } = response.data;
          
          if (success && token && rawUser) {
            const validatedUser = validateUser(rawUser);
            localStorage.setItem('auth_token', token);
            set({ user: validatedUser, loading: false, error: null });
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
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

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
  setLoading: (state: boolean) => void;
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
        console.log('checkAuth: Starting auth check');
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) {
            console.log('checkAuth: No token found');
            set({ loading: false });
            return;
          }

          console.log('checkAuth: Token found, verifying...');
          const response = await api.get<AuthResponse>('/auth/verify');
          const { success, user: rawUser } = response.data;
          
          if (success && rawUser) {
            console.log('checkAuth: Verification successful');
            const validatedUser = validateUser(rawUser);
            set({ user: validatedUser, loading: false, error: null });
          } else {
            console.log('checkAuth: Verification failed');
            localStorage.removeItem('auth_token');
            set({ user: null, loading: false });
          }
        } catch (error) {
          console.error('checkAuth: Error during verification', error);
          localStorage.removeItem('auth_token');
          set({ user: null, loading: false });
        } finally {
          console.log('checkAuth: Complete', {
            state: get(),
            timestamp: new Date().toISOString()
          });
        }
      },

      login: async (emailOrToken: string, password?: string) => {
        console.log('login: Starting login process');
        set({ loading: true, error: null });
        
        try {
          let response;

          if (password) {
            console.log('login: Attempting password login');
            response = await api.post<AuthResponse>('/auth/login', {
              email: emailOrToken,
              password
            });
          } else {
            console.log('login: Attempting token verification');
            response = await api.get<AuthResponse>('/auth/verify', {
              headers: {
                Authorization: `Bearer ${emailOrToken}`
              }
            });
          }

          const { success, token, user: rawUser } = response.data;
          
          if (success && token && rawUser) {
            console.log('login: Login successful');
            const validatedUser = validateUser(rawUser);
            localStorage.setItem('auth_token', token);
            set({ user: validatedUser, loading: false, error: null });
            return true;
          }

          console.log('login: Login failed', response.data);
          set({ 
            error: response.data.message || '認証に失敗しました', 
            loading: false 
          });
          return false;

        } catch (error) {
          console.error('login: Error during login', error);
          localStorage.removeItem('auth_token');
          set({ 
            user: null,
            error: '認証に失敗しました', 
            loading: false 
          });
          return false;
        } finally {
          console.log('login: Complete', {
            state: get(),
            timestamp: new Date().toISOString()
          });
        }
      },

      logout: () => {
        console.log('logout: Starting logout process');
        localStorage.removeItem('auth_token');
        set({ 
          user: null, 
          loading: false, 
          error: null 
        });
        console.log('logout: Complete', {
          timestamp: new Date().toISOString()
        });
      },

      setInitialized: (state) => {
        console.log('setInitialized:', {
          current: get().initialized,
          new: state,
          timestamp: new Date().toISOString()
        });
        set({ 
          initialized: state,
          loading: false // 初期化完了時にloadingをfalseに設定
        });
      },

      setLoading: (state) => {
        console.log('setLoading:', {
          current: get().loading,
          new: state,
          timestamp: new Date().toISOString()
        });
        set({ loading: state });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
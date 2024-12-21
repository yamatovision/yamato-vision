'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { login, logout, initialized, setInitialized } = useAuth();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const success = await login(token);
          if (!success) {
            logout();
          }
        } catch {
          logout();
        }
      }
      setInitialized(true);
    };

    initAuth();
  }, [login, logout, setInitialized]);

  if (!initialized) {
    return null; // または適切なローディング表示
  }

  return <>{children}</>;
}

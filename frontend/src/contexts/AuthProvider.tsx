// AuthProvider.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initialized, setInitialized, loading, setLoading } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!initialized && isMounted) {
        try {
          setLoading(true);
          console.log('Starting initialization');
          await new Promise(resolve => setTimeout(resolve, 0));
          setInitialized(true);
          console.log('Initialization complete');
        } catch (error) {
          console.error('Initialization failed:', error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [initialized, setInitialized, setLoading]);

  console.log('AuthProvider render:', {
    initialized,
    loading,
    timestamp: new Date().toISOString()
  });

  return <>{children}</>;
}
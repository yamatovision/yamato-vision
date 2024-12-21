'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect } from 'react';

export default function RootPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/user/home');
    } else {
      router.push('/login');
    }
  }, [user]);

  return null;  // ローディング表示も不要、すぐにリダイレクト
}
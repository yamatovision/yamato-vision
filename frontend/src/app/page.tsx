'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect } from 'react';

export default function RootPage() {
  const router = useRouter();
  const { user, loading, initialized } = useAuth();

  useEffect(() => {
    console.log('Navigation effect:', { user: !!user, loading, initialized });
    
    // loadingがfalseの時のみナビゲーションを実行
    if (!loading) {
      if (user) {
        console.log('Redirecting to home');
        router.push('/user/home');
      } else {
        console.log('Redirecting to login');
        router.push('/login');
      }
    }
  }, [user, loading, router]); // initialized は依存配列から除外

  // デバッグ用のログ
  console.log('RootPage render:', {
    hasUser: !!user,
    loading,
    initialized,
    timestamp: new Date().toISOString()
  });

  // ローディング中は表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // ローディング完了後はnullを返す（リダイレクトを待つ）
  return null;
}
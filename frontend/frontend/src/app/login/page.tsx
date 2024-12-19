'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { loading } = useAuth();
  const redirectUrl = searchParams.get('redirect');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* ヘッダー部分 */}
          <div className="pt-16 pb-8">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">大和Vision</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                ブルーランプのアカウントでログインしてください
              </p>
            </div>
          </div>

          {/* ログインフォーム */}
          <div className="mt-8">
            <LoginForm redirectUrl={redirectUrl || '/dashboard'} />
          </div>

          {/* 注意書き */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>※ブルーランプのアカウントをお持ちでない方は、</p>
            <p>まずブルーランプでアカウントを作成してください。</p>
            <a 
              href="https://blue-lamp.com/register" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              ブルーランプで登録する →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import LoginForm from './LoginForm';
import { useAuth } from '@/lib/hooks/useAuth';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { loading } = useAuth();
  const redirectUrl = searchParams?.get('redirect') ?? '/user/home';

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
          <div className="pt-16 pb-8">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">大和Vision</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                アカウントでログインしてください
              </p>
            </div>
          </div>

          <div className="mt-8">
            <LoginForm redirectUrl={redirectUrl} />
          </div>
        </div>
      </div>
    </main>
  );
}

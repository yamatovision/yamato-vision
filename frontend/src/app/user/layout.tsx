'use client';

import { useTheme } from '@/contexts/theme';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BottomNavigation } from './shared/BottomNavigation';
export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.rank === '退会者') {
      router.push('/login');
    }
  }, [user]);

  if (!user || user.rank === '退会者') return null;

  return (
    <div className={`min-h-screen pb-20 ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-[#F8FAFC] text-[#1E40AF]'
    }`}>
      <main className="max-w-7xl mx-auto px-4">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
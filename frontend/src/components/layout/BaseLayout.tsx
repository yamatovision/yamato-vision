'use client';

import { useTheme } from '@/context/ThemeContext';
import BottomNavigation from './BottomNavigation';

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

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

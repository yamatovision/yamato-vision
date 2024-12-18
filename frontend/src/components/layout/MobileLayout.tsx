'use client';

import { useTheme } from '@/context/ThemeContext';
import BottomNavigation from './BottomNavigation';
import MobileHeader from './MobileHeader';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-[#F8FAFC] text-[#1E40AF]'
    }`}>
      <MobileHeader />
      <main className="pb-16"> {/* Bottom navigationの高さ分のpadding */}
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}

'use client';

import { useTheme } from '@/context/ThemeContext';
import SideNavigation from './SideNavigation';
import TopHeader from './TopHeader';

export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-[#F8FAFC] text-[#1E40AF]'
    }`}>
      <TopHeader />
      <div className="flex">
        <SideNavigation />
        <main className="flex-1 ml-20 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

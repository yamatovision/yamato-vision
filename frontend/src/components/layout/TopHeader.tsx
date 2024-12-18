'use client';

import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';

export default function TopHeader() {
  const { theme } = useTheme();

  return (
    <header className={`
      fixed top-0 left-20 right-0 z-10 h-16
      ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
      border-b ${theme === 'dark' ? 'border-gray-700' : 'border-[#DBEAFE]'}
    `}>
      <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
        <h1 className="text-xl font-bold">大和ViSiON</h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

'use client';

import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors ${
        theme === 'dark'
          ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300'
          : 'bg-[#DBEAFE] hover:bg-[#93C5FD] text-[#1E40AF]'
      }`}
      aria-label="テーマ切り替え"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}

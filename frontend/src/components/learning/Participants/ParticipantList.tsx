'use client';

import { useTheme } from '@/context/ThemeContext';

export function ParticipantList() {
  const { theme } = useTheme();
  
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="flex -space-x-2">
        <img src="https://placehold.jp/25x25.png" className="w-6 h-6 rounded-full border-2 border-white" />
        <img src="https://placehold.jp/25x25.png" className="w-6 h-6 rounded-full border-2 border-white" />
        <img src="https://placehold.jp/25x25.png" className="w-6 h-6 rounded-full border-2 border-white" />
      </div>
      <span className={`text-sm ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>+5人が同時チャレンジ中</span>
    </div>
  );
}

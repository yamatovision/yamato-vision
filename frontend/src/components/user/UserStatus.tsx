'use client';

import { useTheme } from '@/context/ThemeContext';

export default function UserStatus() {
  const { theme } = useTheme();

  return (
    <div className={`
      ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} 
      rounded-lg p-4 shadow-lg
    `}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              現在の階級：
            </span>
            <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} className="font-bold">
              Gold
            </span>
          </div>
          <div className="text-sm">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              レベル：
            </span>
            <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} className="font-bold">
              25
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400 text-xl">💎</span>
            <span className="font-bold">1,250</span>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} className="text-sm">
              ジェム
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

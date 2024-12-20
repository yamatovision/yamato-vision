'use client';
import { useTheme } from '@/contexts/theme';

export function TimeRemaining() {
  const { theme } = useTheme();
  return (
    <div className="text-center">
      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        残り時間
      </div>
      <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'}`}>
        45:30
      </div>
    </div>
  );
}
'use client';
import { useTheme } from '@/contexts/theme';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const { theme } = useTheme();
  return (
    <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-full h-2`}>
      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
    </div>
  );
}
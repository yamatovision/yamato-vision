'use client';

import { useTheme } from '@/contexts/theme';
import { getRankStyle } from '@/lib/utils/rankStyles';

interface TokenInfoProps {
  unprocessedTokens: number;
  rank: string;
}

export function TokenInfo({ unprocessedTokens, rank }: TokenInfoProps) {
  const { theme } = useTheme();
  const rankStyle = getRankStyle(rank, theme);
  
  // 仮の最大値として10000を設定
  const maxTokens = 10000;
  const percentage = Math.min((unprocessedTokens / maxTokens) * 100, 100);

  return (
    <div className="flex flex-col items-center min-w-[150px]">
      <div className={`text-sm ${rankStyle.tokenText} mb-1 font-medium`}>
        {unprocessedTokens.toLocaleString()} / {maxTokens.toLocaleString()}
      </div>
      <div className={`w-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-full`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
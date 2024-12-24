'use client';

import { useTheme } from '@/contexts/theme';
import { getRankStyle } from '@/lib/utils/rankStyles';

interface TokenInfoProps {
  unprocessedTokens: number;
  maxTokens: number;
  purchasedTokens?: number;
  rank: string;
  isUsable?: boolean;
}

export function TokenInfo({ 
  unprocessedTokens, 
  maxTokens, 
  purchasedTokens, 
  rank, 
  isUsable = true 
}: TokenInfoProps) {
  const { theme } = useTheme();
  const rankStyle = getRankStyle(rank, theme);
  
  // 消費済みトークンの割合を計算
  const consumedTokens = maxTokens - unprocessedTokens;
  const consumedPercentage = Math.max(0, Math.min((consumedTokens / maxTokens) * 100, 100));

  return (
    <div className="w-full space-y-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">トークン残高</h3>
        <span className={`px-2 py-1 rounded-md text-sm ${
          isUsable 
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
        }`}>
          {isUsable ? '利用可能' : '利用不可'}
        </span>
      </div>

      {/* 週トークン */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>週トークン</span>
          <span className={`${rankStyle.tokenText}`}>
            残り {unprocessedTokens.toLocaleString()} / {maxTokens.toLocaleString()}
          </span>
        </div>
        <div className={`relative h-4 rounded-full overflow-hidden ${
          theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
        }`}>
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-300 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
            }`}
            style={{ width: `${consumedPercentage}%` }}
          />
        </div>
      </div>

      {/* 購入トークン（存在する場合のみ表示） */}
      {purchasedTokens !== undefined && purchasedTokens > 0 && (
        <div className={`${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
        } rounded-lg p-4`}>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">購入トークン</div>
              <div className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              } mt-1`}>
                ※週トークンが消費された後に使用されます
              </div>
            </div>
            <div className="text-lg font-bold">
              {purchasedTokens.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/theme';
import { TIME_VALIDATION } from '@/types/timeout';

interface ChapterTimeSettingsProps {
  timeLimit?: number;  // 時間単位
  releaseTime?: number;  // 日数（こちらは日数のまま）
  onUpdate: (settings: { timeLimit?: number; releaseTime?: number }) => Promise<void>;
  disabled?: boolean;
}

export function ChapterTimeSettings({
  timeLimit: initialTimeLimit = 48, // デフォルト48時間
  releaseTime: initialReleaseTime = 0,
  onUpdate,
  disabled = false
}: ChapterTimeSettingsProps) {
  const { theme } = useTheme();
  const [timeLimit, setTimeLimit] = useState(initialTimeLimit);
  const [releaseTime, setReleaseTime] = useState(initialReleaseTime);

  const handleTimeLimitChange = useCallback((value: number) => {
    const newValue = Math.max(0, Math.min(720, value)); // 1時間〜720時間（30日）
    setTimeLimit(newValue);
    onUpdate({ timeLimit: newValue, releaseTime });
  }, [releaseTime, onUpdate]);

  const handleReleaseTimeChange = useCallback((value: number) => {
    const newValue = Math.max(0, Math.min(30, value)); // 0日〜30日
    setReleaseTime(newValue);
    onUpdate({ timeLimit, releaseTime: newValue });
  }, [timeLimit, onUpdate]);

  // 表示用の時間フォーマット関数
  const formatTimeLimit = (hours: number) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 
        ? `${days}日 ${remainingHours}時間` 
        : `${days}日`;
    }
    return `${hours}時間`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 制限時間設定 */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            制限時間（時間）
          </label>
          <div className="relative">
            <input
              type="number"
              value={timeLimit || ''} // 0の場合は空文字列を表示
              onChange={(e) => handleTimeLimitChange(parseInt(e.target.value) || 0)}
              min={0}
              max={720}
              className={`w-full rounded-lg pl-3 pr-12 py-2 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-900 border-gray-200'
              } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              disabled={disabled}
            />
            <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              時間
            </div>
          </div>
          <p className={`mt-1 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {timeLimit === 0 ? '制限なし' : `${formatTimeLimit(timeLimit)}でタイムアウト`}
          </p>
        </div>

        {/* 解放時間設定（日数のまま） */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            コース開始からの解放時間（日）
          </label>
          <div className="relative">
            <input
              type="number"
              value={releaseTime}
              onChange={(e) => handleReleaseTimeChange(parseInt(e.target.value) || 0)}
              min={0}
              max={30}
              className={`w-full rounded-lg pl-3 pr-12 py-2 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-900 border-gray-200'
              } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              disabled={disabled}
            />
            <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              日後
            </div>
          </div>
          <p className={`mt-1 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {releaseTime === 0 ? '即時解放' : `コース開始から${releaseTime}日後に解放`}
          </p>
        </div>
      </div>
    </div>
  );
}
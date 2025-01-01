// frontend/src/app/admin/courses/[courseId]/chapters/components/ChapterTimeSettings.tsx
'use client';

import { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/theme';
import { TIME_VALIDATION } from '@/types/timeout';

interface ChapterTimeSettingsProps {
  timeLimit?: number;  // 日数
  releaseTime?: number;  // 日数
  onUpdate: (settings: { timeLimit?: number; releaseTime?: number }) => Promise<void>;
  disabled?: boolean;
}

export function ChapterTimeSettings({
  timeLimit: initialTimeLimit = 0,
  releaseTime: initialReleaseTime = 0,
  onUpdate,
  disabled = false
}: ChapterTimeSettingsProps) {
  const { theme } = useTheme();
  const [timeLimit, setTimeLimit] = useState(initialTimeLimit);
  const [releaseTime, setReleaseTime] = useState(initialReleaseTime);

  const handleTimeLimitChange = useCallback((value: number) => {
    const newValue = Math.max(
      TIME_VALIDATION.minTimeLimit,
      Math.min(TIME_VALIDATION.maxTimeLimit, value)
    );
    setTimeLimit(newValue);
    onUpdate({ timeLimit: newValue, releaseTime });
  }, [releaseTime, onUpdate]);

  const handleReleaseTimeChange = useCallback((value: number) => {
    const newValue = Math.max(
      TIME_VALIDATION.minReleaseTime,
      Math.min(TIME_VALIDATION.maxReleaseTime, value)
    );
    setReleaseTime(newValue);
    onUpdate({ timeLimit, releaseTime: newValue });
  }, [timeLimit, onUpdate]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 制限時間設定 */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            制限時間（日）
          </label>
          <div className="relative">
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => handleTimeLimitChange(parseInt(e.target.value) || 0)}
              min={TIME_VALIDATION.minTimeLimit}
              max={TIME_VALIDATION.maxTimeLimit}
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
              日
            </div>
          </div>
          <p className={`mt-1 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {timeLimit === 0 ? '制限なし' : `${timeLimit}日間でタイムアウト`}
          </p>
        </div>

        {/* 解放時間設定 */}
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
              min={TIME_VALIDATION.minReleaseTime}
              max={TIME_VALIDATION.maxReleaseTime}
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
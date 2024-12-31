'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/theme';

interface TimeSettingsProps {
  timeLimit?: number;
  releaseTime?: number;
  onUpdate: (settings: { timeLimit?: number; releaseTime?: number }) => Promise<void>;
  disabled?: boolean;
}

export function TimeSettings({
  timeLimit: initialTimeLimit,
  releaseTime: initialReleaseTime,
  onUpdate,
  disabled = false
}: TimeSettingsProps) {
  const { theme } = useTheme();
  const [timeLimit, setTimeLimit] = useState(initialTimeLimit || 0);
  const [releaseTime, setReleaseTime] = useState(initialReleaseTime || 0);

  // 値の更新をdebounce
  const debouncedUpdate = useCallback(() => {
    onUpdate({
      timeLimit,
      releaseTime
    });
  }, [timeLimit, releaseTime, onUpdate]);

  // 初期値の設定
  useEffect(() => {
    setTimeLimit(initialTimeLimit || 0);
  }, [initialTimeLimit]);

  useEffect(() => {
    setReleaseTime(initialReleaseTime || 0);
  }, [initialReleaseTime]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 制限時間設定 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          制限時間（分）
        </label>
        <div className="relative">
          <input
            type="number"
            value={timeLimit}
            onChange={(e) => {
              const newValue = Math.max(0, parseInt(e.target.value) || 0);
              setTimeLimit(newValue);
            }}
            min="0"
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
            分
          </div>
        </div>
        <p className={`mt-1 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          0の場合は制限なし
        </p>
      </div>

      {/* 解放時間設定 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          解放時間（分）
        </label>
        <div className="relative">
          <input
            type="number"
            value={releaseTime}
            onChange={(e) => {
              const newValue = Math.max(0, parseInt(e.target.value) || 0);
              setReleaseTime(newValue);
            }}
            min="0"
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
            分後
          </div>
        </div>
        <p className={`mt-1 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          コース開始からの経過時間
        </p>
      </div>
    </div>
  );
}
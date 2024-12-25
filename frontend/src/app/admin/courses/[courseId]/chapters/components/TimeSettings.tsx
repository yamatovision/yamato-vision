'use client';

import { useTheme } from '@/contexts/theme';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

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
  const [isUpdating, setIsUpdating] = useState(false);
  const [timeLimit, setTimeLimit] = useState(initialTimeLimit || 0);
  const [releaseTime, setReleaseTime] = useState(initialReleaseTime || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isUpdating) return;

    // バリデーション
    if (timeLimit < 0 || releaseTime < 0) {
      toast.error('時間は0以上の値を入力してください');
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate({
        timeLimit: timeLimit || undefined,
        releaseTime: releaseTime || undefined
      });
      toast.success('時間設定を更新しました');
    } catch (error) {
      console.error('Failed to update time settings:', error);
      toast.error('時間設定の更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              onChange={(e) => setTimeLimit(Math.max(0, parseInt(e.target.value) || 0))}
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
              onChange={(e) => setReleaseTime(Math.max(0, parseInt(e.target.value) || 0))}
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

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled || isUpdating}
          className={`px-4 py-2 rounded-lg ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors ${
            (disabled || isUpdating) && 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isUpdating ? '更新中...' : '設定を保存'}
        </button>
      </div>

      {/* 説明文 */}
      <div className={`rounded-lg p-4 ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <h4 className={`text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          時間設定について
        </h4>
        <ul className={`text-sm space-y-2 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <li>• 制限時間を超過すると、得点が1/3に減少します</li>
          <li>• 解放時間に達するまでチャプターにアクセスできません</li>
          <li>• 時間は分単位で設定してください</li>
        </ul>
      </div>
    </form>
  );
}
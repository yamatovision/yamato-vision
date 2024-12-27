'use client';

import { useTheme } from '@/contexts/theme';
import { useState } from 'react';
import type { TaskDescriptionProps } from '@/types/course';

export const TaskDescription: React.FC<TaskDescriptionProps> = ({
  description,
  systemMessage,
  referenceText,
  maxPoints,
  type
}) => {
  const { theme } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async () => {
    // 提出処理の実装
    // API呼び出しなどを行う
  };

  const getThemedTextColor = (isDark: boolean, primary: boolean = false) => 
    isDark 
      ? (primary ? 'text-white' : 'text-gray-300')
      : (primary ? 'text-[#1E40AF]' : 'text-gray-600');

  const getThemedBgColor = (isDark: boolean) =>
    isDark ? 'bg-gray-700' : 'bg-blue-50';

  const getThemedBorderColor = (isDark: boolean) =>
    isDark ? 'border-gray-600' : 'border-blue-100';

  const getThemedInputStyle = (isDark: boolean) =>
    `w-full h-32 rounded-lg p-3 ${
      isDark 
        ? 'bg-gray-700 text-white border-gray-600' 
        : 'bg-white text-gray-900 border-gray-200'
    } border focus:ring-2 focus:ring-blue-500 focus:outline-none`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`font-bold text-lg mb-2 ${getThemedTextColor(theme === 'dark', true)}`}>
          {type === 'practice' ? '実践課題' : '基礎課題'}
        </h2>
        <p className={`text-sm ${getThemedTextColor(theme === 'dark')} mb-4`}>
          {systemMessage}
        </p>
        <div className={`${getThemedBgColor(theme === 'dark')} rounded-lg p-4 border ${getThemedBorderColor(theme === 'dark')}`}>
          <p className={`text-sm ${getThemedTextColor(theme === 'dark', true)}`}>
            {description}
          </p>
          {referenceText && (
            <div className="mt-4">
              <h3 className={`text-sm font-medium mb-2 ${getThemedTextColor(theme === 'dark')}`}>
                参考資料
              </h3>
              <p className={`text-sm ${getThemedTextColor(theme === 'dark')}`}>
                {referenceText}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${getThemedTextColor(theme === 'dark')}`}>
            プロンプト
          </label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className={getThemedInputStyle(theme === 'dark')}
            placeholder="プロンプトを入力してください"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${getThemedTextColor(theme === 'dark')}`}>
            動作結果
          </label>
          <textarea 
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className={getThemedInputStyle(theme === 'dark')}
            placeholder="AIの出力結果を貼り付けてください"
          />
        </div>
        <div className="flex justify-between items-center">
          <div className={`text-sm ${getThemedTextColor(theme === 'dark')}`}>
            配点: {maxPoints}点
          </div>
          <button 
            onClick={handleSubmit}
            className={`${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white px-6 py-3 rounded-lg font-bold transition-colors`}
          >
            課題を提出
          </button>
        </div>
      </div>
    </div>
  );
};
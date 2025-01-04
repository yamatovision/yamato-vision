'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme';

interface Task {
  description: string;
  systemMessage: string;
  referenceText: string;
  maxPoints: number;
}

interface SubmissionFormProps {
  task: Task;
  onSubmit: (prompt: string, result: string) => Promise<void>;
  isSubmitting: boolean;
}

export function SubmissionForm({ task, onSubmit, isSubmitting }: SubmissionFormProps) {
  const { theme } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !result.trim()) return;
    await onSubmit(prompt, result);
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6`}>
      {/* Task Description */}
      <div className={`${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
      } rounded-lg p-4 mb-6`}>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {task.description}
        </p>
        {task.referenceText && (
          <div className="mt-4">
            <h4 className={`text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              参考資料
            </h4>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.referenceText}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            プロンプト
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
            disabled={isSubmitting}
            className={`w-full h-32 rounded-lg p-3 ${
              theme === 'dark'
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            placeholder="プロンプトを入力してください"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            実行結果
          </label>
          <textarea
            value={result}
            onChange={(e) => setResult(e.target.value)}
            required
            disabled={isSubmitting}
            className={`w-full h-32 rounded-lg p-3 ${
              theme === 'dark'
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-white text-gray-900 border-gray-200'
            } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            placeholder="AIの出力結果を貼り付けてください"
          />
        </div>

        <div className="flex justify-between items-center">
          <div className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            配点: {task.maxPoints}点
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50`}
          >
            {isSubmitting ? '提出中...' : '課題を提出'}
          </button>
        </div>
      </form>
    </div>
  );
}
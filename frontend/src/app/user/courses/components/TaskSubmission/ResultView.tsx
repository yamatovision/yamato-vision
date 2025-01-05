'use client';

import { useTheme } from '@/contexts/theme';
import React from 'react';

interface ResultViewProps {
  result: {
    score: number;
    feedback: string;
    nextStep: string;
  };
}

export const ResultView: React.FC<ResultViewProps> = ({ result }) => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6">
      <div className={`${
        theme === 'dark'
          ? 'bg-gradient-to-b from-blue-900 to-purple-900'
          : 'bg-gradient-to-b from-blue-400 to-purple-500'
      } rounded-lg p-6 text-center`}>
        <div className="mb-4">
          <span className="text-yellow-400 text-6xl">{result.score}</span>
          <span className="text-2xl text-white">点</span>
        </div>
        <div className={`${
          theme === 'dark' ? 'text-green-400' : 'text-green-300'
        } text-xl font-bold`}>
          {result.score >= 90 ? 'Excellent! 🎉' : 'Good job! 👍'}
        </div>
      </div>

      <div className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-md'
      } rounded-lg p-6`}>
        <h2 className={`font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          AI評価
        </h2>
        <div className={`${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
        } rounded-lg p-4 text-sm`}>
          <p className={`leading-relaxed ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {result.feedback}
          </p>
        </div>
      </div>

      <div className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white shadow-md'
      } rounded-lg p-6`}>
        <h2 className={`font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          次のステップ
        </h2>
        <div className={`${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
        } rounded-lg p-4 text-sm`}>
          <p className={`leading-relaxed ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {result.nextStep}
          </p>
        </div>
      </div>
    </div>
  );
};

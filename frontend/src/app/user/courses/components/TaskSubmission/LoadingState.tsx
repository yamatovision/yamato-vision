'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme';

interface LoadingStateProps {
  onTimeout?: () => void;
  timeoutDuration?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  onTimeout,
  timeoutDuration = 15000 // 15秒
}) => {
  const { theme } = useTheme();
  const [evaluationMessage, setEvaluationMessage] = useState('AIが課題を分析中...');
  const messages = [
    'AIが課題を分析中...',
    '評価基準と照合中...',
    'フィードバックを生成中...'
  ];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // メッセージ切り替えのアニメーション
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1667); // 約5秒で3つのメッセージを表示

    return () => clearInterval(messageInterval);
  }, []);

  // アナライザーグリッドのアニメーション
  useEffect(() => {
    let cellIndex = 0;
    const cells = document.querySelectorAll('.analyzer-progress');
    
    const analyzerInterval = setInterval(() => {
      cells.forEach((cell, index) => {
        if (index === cellIndex) {
          (cell as HTMLElement).style.opacity = '1';
        } else {
          (cell as HTMLElement).style.opacity = '0';
        }
      });
      
      cellIndex = (cellIndex + 1) % cells.length;
    }, 300);

    return () => clearInterval(analyzerInterval);
  }, []);

  // タイムアウト処理
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onTimeout?.();
    }, timeoutDuration);

    return () => clearTimeout(timeoutId);
  }, [onTimeout, timeoutDuration]);

  return (
    <div className="mb-8">
      <div className={`${
        theme === 'dark' 
          ? 'bg-gray-800 text-gray-100' 
          : 'bg-white text-gray-900 shadow-md'
      } rounded-lg p-8 mb-6`}>
        <div className="flex flex-col items-center space-y-6">
          {/* アナライザーグリッド */}
          <div className={`analyzer-grid w-32 h-32 grid grid-cols-4 gap-0.5 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
          } rounded-lg p-2`}>
            {Array(16).fill(null).map((_, i) => (
              <div 
                key={i} 
                className={`analyzer-cell relative ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                } rounded`}
              >
                <div className={`absolute inset-0 ${
                  theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'
                } opacity-0 rounded analyzer-progress`} />
              </div>
            ))}
          </div>
          {/* メッセージ */}
          <div className={`text-center text-lg ${
            theme === 'dark' ? 'text-blue-200' : 'text-blue-600'
          }`}>
            {messages[currentMessageIndex]}
          </div>
        </div>
      </div>
    </div>
  );
};

// スタイル定義
const styles = `
  .analyzer-cell {
    transition: background-color 0.3s ease;
  }
  .analyzer-progress {
    transition: opacity 0.3s ease;
  }
`;

// frontend/src/app/user/courses/[courseId]/chapters/[chapterId]/examination/components/ExamTimer.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/theme';

interface ExamTimerProps {
  duration: number;    // 分単位での制限時間
  startedAt: Date;    // 試験開始時刻
  onTimeout: () => void;
}

export function ExamTimer({ duration, startedAt, onTimeout }: ExamTimerProps) {
  const { theme } = useTheme();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isWarning, setIsWarning] = useState(false);
  const [isDanger, setIsDanger] = useState(false);

  // 残り時間の計算
  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const endTime = new Date(startedAt.getTime() + duration * 60 * 1000);
    return Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
  }, [startedAt, duration]);

  // 時間のフォーマット
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (hours > 0) {
      parts.push(`${hours}時間`);
    }
    if (minutes > 0 || hours > 0) {
      parts.push(`${minutes}分`);
    }
    parts.push(`${remainingSeconds}秒`);

    return parts.join(' ');
  }, []);

  // 警告状態の更新
  const updateWarningStatus = useCallback((seconds: number) => {
    // 残り15分で警告、残り5分で危険
    setIsWarning(seconds <= 900 && seconds > 300);
    setIsDanger(seconds <= 300);
  }, []);

  useEffect(() => {
    // 初期時間の設定
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      updateWarningStatus(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        onTimeout();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, updateWarningStatus, onTimeout]);

  // スタイルの決定
  const getTimerStyle = () => {
    const baseStyle = 'rounded-lg px-4 py-2 font-mono transition-colors duration-300';
    
    if (isDanger) {
      return `${baseStyle} bg-red-900/50 text-red-300 animate-pulse`;
    }
    if (isWarning) {
      return `${baseStyle} bg-yellow-900/50 text-yellow-300`;
    }
    return `${baseStyle} bg-gray-800/50 text-gray-300`;
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={getTimerStyle()}>
        {formatTime(timeLeft)}
      </div>
      
      {/* 警告メッセージ */}
      {(isWarning || isDanger) && (
        <div className={`text-sm ${
          isDanger ? 'text-red-300 animate-pulse' : 'text-yellow-300'
        }`}>
          {isDanger
            ? '制限時間が迫っています！'
            : '残り時間が少なくなっています'
          }
        </div>
      )}
    </div>
  );
}
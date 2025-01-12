'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/theme';

interface ExamTimerProps {
  duration: number;    // 時間単位での制限時間
  startedAt: Date;    // 試験開始時刻
  onTimeout: () => void;
}

export function ExamTimer({ duration, startedAt, onTimeout }: ExamTimerProps) {
  const { theme } = useTheme();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isWarning, setIsWarning] = useState(false);
  const [isDanger, setIsDanger] = useState(false);


  // 残り時間の計算（ミリ秒→秒）
    const calculateTimeLeft = useCallback(() => {
      const now = new Date();
      const endTime = new Date(startedAt.getTime() + duration * 60 * 60 * 1000); // 時間単位
      return Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
    }, [startedAt, duration]);

  // 時間のフォーマット
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}時間${minutes.toString().padStart(2, '0')}分${remainingSeconds.toString().padStart(2, '0')}秒`;
    }
    return `${minutes}分${remainingSeconds.toString().padStart(2, '0')}秒`;
  }, []);

  // 警告状態の更新
  const updateWarningStatus = useCallback((seconds: number) => {
    const remainingMinutes = seconds / 60;
    // 残り30分で警告、残り10分で危険
    setIsWarning(remainingMinutes <= 30 && remainingMinutes > 10);
    setIsDanger(remainingMinutes <= 10);
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

  const getWarningMessage = () => {
    if (isDanger) {
      return '⚠️ 制限時間が迫っています！';
    }
    if (isWarning) {
      return '残り時間が少なくなっています';
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={getTimerStyle()}>
        {formatTime(timeLeft)}
      </div>
      
      {/* 警告メッセージ */}
      {(isWarning || isDanger) && (
        <div className={`text-sm ${
          isDanger ? 'text-red-300 animate-pulse' : 'text-yellow-300'
        }`}>
          {getWarningMessage()}
        </div>
      )}
    </div>
  );
}
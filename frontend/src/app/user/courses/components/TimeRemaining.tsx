'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/contexts/theme';
import { TimeoutSeverity, TimeConfig, TimeoutType } from '@/types/timeout';

const TIME_CONFIG: TimeConfig = {
  chapter: {
    warningThreshold: 24,  // 24時間
    dangerThreshold: 6     // 6時間
  },
  course: {
    warningThreshold: 360, // 15日 = 360時間
    dangerThreshold: 72    // 3日 = 72時間
  },
  archive: {
    warningThreshold: 48,  // 2日 = 48時間
    dangerThreshold: 12    // 12時間
  }
};

interface Props {
  startTime: Date;
  timeLimit: number; // 時間単位
  type: TimeoutType;
  onTimeout?: () => void;
}

export function TimeRemaining({ 
  startTime,
  timeLimit,
  type,
  onTimeout = () => {}
}: Props) {
  const { theme } = useTheme();
  const [remainingTime, setRemainingTime] = useState(() => {
    const now = new Date();
    const endTime = new Date(startTime.getTime() + (timeLimit * 60 * 60 * 1000)); // 時間を秒に変換
    const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
    return remaining;
  });

  const severity: TimeoutSeverity = useMemo(() => {
    const thresholds = TIME_CONFIG[type];
    const remainingHours = remainingTime / (60 * 60);
    if (remainingHours <= thresholds.dangerThreshold) return 'danger';
    if (remainingHours <= thresholds.warningThreshold) return 'warning';
    return 'normal';
  }, [remainingTime, type]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0) {
          onTimeout();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeout]);

  const formatTime = (seconds: number) => {
    if (type === 'course') {
      const days = Math.floor(seconds / (24 * 60 * 60));
      const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
      return `${days}日${hours}時間`;
    } else if (type === 'archive') {
      const hours = Math.floor(seconds / (60 * 60));
      const minutes = Math.floor((seconds % (60 * 60)) / 60);
      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}日${remainingHours}時間`;
      }
      return `${hours}時間${minutes}分`;
    } else {
      const hours = Math.floor(seconds / (60 * 60));
      const minutes = Math.floor((seconds % (60 * 60)) / 60);
      const secs = seconds % 60;
      if (hours > 0) {
        return `${hours}時間${minutes}分`;
      }
      return `${minutes}分${secs}秒`;
    }
  };

  const getTimeColor = (severity: TimeoutSeverity) => {
    if (type === 'archive') {
      const colors = {
        normal: theme === 'dark' ? 'text-blue-400' : 'text-blue-500',
        warning: 'text-yellow-500',
        danger: 'text-red-500'
      };
      return colors[severity];
    }

    const colors = {
      normal: theme === 'dark' ? 'text-white' : 'text-[#1E40AF]',
      warning: 'text-yellow-500',
      danger: 'text-red-500'
    };
    return colors[severity];
  };

  const getMessage = () => {
    switch (type) {
      case 'archive':
        return 'アーカイブ期限';
      case 'chapter':
        return 'チャプター残り時間';
      case 'course':
        return 'コース残り時間';
    }
  };

  return (
    <div className="text-center">
      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        {getMessage()}
      </div>
      <div className={`text-xl font-bold ${getTimeColor(severity)}`}>
        {formatTime(remainingTime)}
      </div>
      {severity !== 'normal' && (
        <div className={`text-sm mt-1 ${getTimeColor(severity)}`}>
          {severity === 'danger' ? 
            `⚠️ ${type === 'archive' ? 'アーカイブ期限が迫っています' : 
              type === 'chapter' ? '制限時間まで残りわずか' : 
              'コース期限が迫っています'}` : 
            `${type === 'archive' ? 'アーカイブ期限にご注意ください' :
              type === 'chapter' ? '制限時間が近づいています' : 
              '期限にご注意ください'}`
          }
        </div>
      )}
    </div>
  );
}
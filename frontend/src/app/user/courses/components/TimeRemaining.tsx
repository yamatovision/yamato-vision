'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/contexts/theme';
import { TimeoutSeverity, TimeConfig, TimeoutType } from '@/types/timeout';

const TIME_CONFIG: TimeConfig = {
  chapter: {
    warningThreshold: 86400,  // 24時間
    dangerThreshold: 21600    // 6時間
  },
  course: {
    warningThreshold: 1296000, // 15日
    dangerThreshold: 259200    // 3日
  },
  archive: {
    warningThreshold: 172800,  // 2日
    dangerThreshold: 43200     // 12時間
  }
};

interface Props {
  startTime: Date;
  timeLimit: number;
  type: TimeoutType;
  onTimeout?: () => void;
}

export function TimeRemaining({ 
  startTime,
  timeLimit,
  type,
  onTimeout = () => {} // デフォルト値を設定
}: Props) {
  const { theme } = useTheme();
  const [remainingTime, setRemainingTime] = useState(() => {
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    return Math.max(0, timeLimit - elapsed);
  });

  const severity: TimeoutSeverity = useMemo(() => {
    const thresholds = TIME_CONFIG[type];
    if (remainingTime <= thresholds.dangerThreshold) return 'danger';
    if (remainingTime <= thresholds.warningThreshold) return 'warning';
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
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      return `${days}日${hours}時間`;
    } else if (type === 'archive') {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (days > 0) {
        return `${days}日${hours}時間`;
      }
      return `${hours}時間${minutes}分`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
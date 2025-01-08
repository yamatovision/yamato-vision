'use client';

import { useTheme } from '@/contexts/theme';
import { CourseData } from '@/types/course';
import { useEffect, useState } from 'react';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CourseHeaderProps {
  courseData: CourseData;
  onOverviewClick: () => void;
}

export function CourseHeader({ courseData, onOverviewClick }: CourseHeaderProps) {
  const { theme } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!courseData.startedAt || !courseData.course.timeLimit) return;

      const startDate = new Date(courseData.startedAt);
      const timeOutAt = new Date(startDate);
      timeOutAt.setDate(timeOutAt.getDate() + courseData.course.timeLimit);
      
      const now = new Date();
      const total = timeOutAt.getTime() - now.getTime();
      
      if (total <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((total % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    // 初回計算
    calculateTimeRemaining();

    // 1秒ごとに更新
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [courseData.startedAt, courseData.course.timeLimit]);

  // 残り時間表示のカラー設定
  const getTimeColor = (days: number): string => {
    if (days <= 3) return 'text-red-400';
    if (days <= 10) return 'text-yellow-400';
    return 'text-orange-400';
  };

  // 時間表示のフォーマット
  const formatTimeDisplay = () => {
    if (timeRemaining.days > 0) {
      return (
        <div className={`font-bold ${getTimeColor(timeRemaining.days)}`}>
          最終試験まで残り{timeRemaining.days}日
        </div>
      );
    }

    return (
      <div className="text-red-400 font-bold">
        {String(timeRemaining.hours).padStart(2, '0')}:
        {String(timeRemaining.minutes).padStart(2, '0')}:
        {String(timeRemaining.seconds).padStart(2, '0')}
      </div>
    );
  };

  const hasTimeRemaining = 
    timeRemaining.days > 0 || 
    timeRemaining.hours > 0 || 
    timeRemaining.minutes > 0 || 
    timeRemaining.seconds > 0;

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex-1">
        <h2 className={`text-xl font-bold ${
          theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
        }`}>
          {courseData.course.title}
        </h2>
        {hasTimeRemaining && (
          <div className="mt-1">
            {formatTimeDisplay()}
          </div>
        )}
      </div>

      <button 
        onClick={onOverviewClick}
        className={`px-4 py-2 ml-4 ${
          theme === 'dark' 
            ? 'bg-gray-700 hover:bg-gray-600' 
            : 'bg-gray-100 hover:bg-gray-200'
        } rounded-lg text-sm transition-colors`}
        aria-label="コース概要を表示"
      >
        コース概要
      </button>
    </div>
  );
}
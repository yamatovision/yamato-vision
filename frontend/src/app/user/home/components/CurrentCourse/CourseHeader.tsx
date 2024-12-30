'use client';

import { useTheme } from '@/contexts/theme';
import { CourseData } from '@/types/course';
import { useEffect, useState } from 'react';

interface CourseHeaderProps {
  courseData: CourseData;
}

export function CourseHeader({ courseData }: CourseHeaderProps) {
  const { theme } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState<number>(
    courseData.course.timeLimit * 60 * 1000 // ミリ秒に変換
  );

  useEffect(() => {
    // 1日以上ある場合は1分ごとに更新、1日未満は1秒ごとに更新
    const interval = timeRemaining > 24 * 60 * 60 * 1000 ? 60000 : 1000;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - interval));
    }, interval);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTimeDisplay = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
    
    if (days > 0) {
      const timeColor = 
        days <= 3 ? 'text-red-400' :
        days <= 10 ? 'text-yellow-400' :
        'text-orange-400';

      return (
        <div className={`font-bold ${timeColor}`}>
          最終試験まで残り{days}日
        </div>
      );
    }

    // 1日未満の場合はカウントダウン表示
    const hours = Math.floor((milliseconds / (60 * 60 * 1000)) % 24);
    const minutes = Math.floor((milliseconds / (60 * 1000)) % 60);
    const seconds = Math.floor((milliseconds / 1000) % 60);

    return (
      <div className="text-red-400 font-bold">
        {String(hours).padStart(2, '0')}:
        {String(minutes).padStart(2, '0')}:
        {String(seconds).padStart(2, '0')}
      </div>
    );
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className={`text-xl font-bold mb-1 ${
          theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
        }`}>
          {courseData.course.title}
        </h2>
      </div>

      {timeRemaining > 0 && (
        <div className="flex items-center space-x-4">
          {formatTimeDisplay(timeRemaining)}
          <button className={`px-4 py-2 ${
            theme === 'dark' 
              ? 'bg-gray-700 hover:bg-gray-600' 
              : 'bg-gray-100 hover:bg-gray-200'
          } rounded-lg text-sm transition-colors`}>
            コース概要
          </button>
        </div>
      )}
    </div>
  );
}
'use client';

import { useTheme } from '@/contexts/theme';
import { CourseData } from '@/types/course';
import { useEffect, useState } from 'react';

interface CourseHeaderProps {
  courseData: CourseData;
}

export function CourseHeader({ courseData }: CourseHeaderProps) {
  const { theme } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
  }, [courseData]);

  const formatTimeDisplay = () => {
    if (timeRemaining.days > 0) {
      const color = 
        timeRemaining.days <= 3 ? 'text-red-400' :
        timeRemaining.days <= 10 ? 'text-yellow-400' :
        'text-orange-400';
      
      return (
        <div className={`font-bold ${color}`}>
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

  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h2 className={`text-xl font-bold mb-1 ${
          theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
        }`}>
          {courseData.course.title}
        </h2>
      </div>

      {(timeRemaining.days > 0 || timeRemaining.hours > 0 || timeRemaining.minutes > 0 || timeRemaining.seconds > 0) && (
        <div className="flex items-center space-x-4">
          {formatTimeDisplay()}
         
        </div>
      )}
    </div>
  );
}
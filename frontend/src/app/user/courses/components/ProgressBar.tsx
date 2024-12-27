// src/app/user/courses/components/ProgressBar.tsx
import { useEffect, useState } from 'react';
import { courseApi } from '@/lib/api/courses';

interface ProgressBarProps {
  progress: number;
  courseId?: string;  // オプショナルに変更
}
export function ProgressBar({ progress, courseId }: ProgressBarProps) {
  const [currentProgress, setCurrentProgress] = useState(progress);

  useEffect(() => {
    if (!courseId) return;
    
    const fetchProgress = async () => {
      try {
        const response = await courseApi.getCurrentUserCourse(courseId);
        if (response.success && response.data) {
          setCurrentProgress(response.data.progress);
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      }
    };

    fetchProgress();
  }, [courseId]);

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${currentProgress}%` }}
      />
    </div>
  );
}
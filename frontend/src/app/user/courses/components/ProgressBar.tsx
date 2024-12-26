// frontend/src/app/user/courses/components/ProgressBar.tsx
import { useEffect, useState } from 'react';
import { courseApi } from '@/lib/api/courses';

interface ProgressBarProps {
  courseId: string;
  totalChapters: number;
}

export function ProgressBar({ courseId, totalChapters }: ProgressBarProps) {
  const [completedChapters, setCompletedChapters] = useState(0);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const course = await courseApi.getCurrentUserCourse(courseId);
        if (course.success && course.data) {
          const completed = course.data.chapters.filter(
            chapter => chapter.userProgress?.status === 'COMPLETED'
          ).length;
          setCompletedChapters(completed);
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      }
    };

    fetchProgress();
  }, [courseId]);

  const progress = (completedChapters / totalChapters) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
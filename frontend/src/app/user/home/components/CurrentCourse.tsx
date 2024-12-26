'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { courseApi } from '@/lib/api/courses';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// APIレスポンスの型定義
interface CourseData {
  id: string;
  userId: string;
  courseId: string;
  isActive: boolean;
  status: string;
  startedAt: string;
  completedAt: null | string;
  progress: number;
  course: {
    id: string;
    title: string;
    description: string;
    level: number;
    gemCost: number;
    rankRequired: string;
    levelRequired: number;
    timeLimit: number;
    chapters: Array<{
      id: string;
      courseId: string;
      title: string;
      subtitle: string;
      orderIndex: number;
      timeLimit: number;
      isVisible: boolean;
    }>;
  };
}

export function CurrentCourse() {
  const { theme } = useTheme();
  const router = useRouter();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentCourse = async () => {
      try {
        const response = await courseApi.getCurrentUserCourse();
        if (response.success && response.data) {
          setCourseData(response.data);
        }
      } catch (error) {
        console.error('Failed to load current course:', error);
        toast.error('コース情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadCurrentCourse();
  }, []);

  if (loading) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
        </div>
      </div>
    );
  }

  if (!courseData || !courseData.course) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
        <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          現在受講中のコースはありません
        </p>
      </div>
    );
  }

  const currentChapter = courseData.course.chapters[0];
  const timeRemaining = courseData.course.timeLimit || 0;

  const formatTimeRemaining = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
  };

  const handleContinueLearning = async () => {
    if (!courseData) return;
    
    try {
      const chapterResponse = await courseApi.getCurrentChapter(courseData.courseId);
      if (chapterResponse.success && chapterResponse.data) {
        router.push(`/user/courses/${courseData.courseId}/chapters/${chapterResponse.data.id}`);
      } else {
        toast.error('チャプター情報の取得に失敗しました');
      }
    } catch (error) {
      console.error('Error navigating to current chapter:', error);
      toast.error('チャプターへの移動に失敗しました');
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'}`}>
            現在のコース
          </h2>
          <p className="text-blue-400">
            {courseData.course.title}
          </p>
        </div>
        {timeRemaining > 0 && (
          <div className="text-right">
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              残り時間
            </div>
            <div className="text-xl font-bold text-orange-400">
              {formatTimeRemaining(timeRemaining)}
            </div>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-full h-2 mb-4`}>
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
          style={{width: `${courseData.progress}%`}}
        ></div>
      </div>

      <button 
        onClick={handleContinueLearning}
        className={`w-full mt-4 ${
          theme === 'dark' 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-blue-400 hover:bg-blue-500'
        } text-white py-4 rounded-lg text-lg font-bold transition-colors shadow-lg`}
      >
        続きから学習する
      </button>
    </div>
  );
}
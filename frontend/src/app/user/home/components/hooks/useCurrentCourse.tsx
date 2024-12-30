import { useState, useEffect } from 'react';
import { courseApi } from '@/lib/api/courses';
import { CourseData } from '@/types/course';
import { toast } from 'react-hot-toast';

export type ChapterStatusType = 
  | 'LESSON_IN_PROGRESS' 
  | 'TASK_AWAITING' 
  | 'EXCELLENT' 
  | 'GOOD' 
  | 'OK' 
  | 'FAILED' 
  | 'NEXT_CHAPTER';

export interface ChapterProgressInfo {
  type: ChapterStatusType;
  icon: string;
  label: string;
  color: string;
}

interface ExtendedChapter {
  id: string;
  courseId: string;
  title: string;
  subtitle: string;
  orderIndex: number;
  timeLimit: number;
  isVisible: boolean;
  mediaProgress?: {
    completed: boolean;
    position: number;
  };
  submission?: {
    score: number;
    status: string;
  };
}

export const useCurrentCourse = () => {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentCourse = async () => {
      try {
        setLoading(true);
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

  const determineChapterProgress = (chapter: ExtendedChapter): ChapterProgressInfo => {
    if (!chapter.mediaProgress?.completed) {
      return {
        type: 'LESSON_IN_PROGRESS',
        icon: '▶️',
        label: 'レッスン受講中',
        color: 'blue'
      };
    }

    if (!chapter.submission) {
      return {
        type: 'TASK_AWAITING',
        icon: '✏️',
        label: '課題',
        color: 'yellow'
      };
    }

    const score = chapter.submission.score;
    if (score >= 95) {
      return {
        type: 'EXCELLENT',
        icon: '🏆',
        label: 'EXCELLENT',
        color: 'yellow'
      };
    } else if (score >= 80) {
      return {
        type: 'GOOD',
        icon: '⭐️',
        label: 'GOOD',
        color: 'blue'
      };
    } else if (score >= 60) {
      return {
        type: 'OK',
        icon: '✓',
        label: 'OK',
        color: 'green'
      };
    } else {
      return {
        type: 'FAILED',
        icon: '✓',
        label: 'OK',
        color: 'red'
      };
    }
  };

  const getActiveChapters = () => {
    if (!courseData?.course.chapters) return [];
    
    return courseData.course.chapters
      .slice(0, 3)
      .map(chapter => ({
        ...chapter,
        progress: determineChapterProgress(chapter as ExtendedChapter)
      }));
  };

  return {
    courseData,
    loading,
    determineChapterProgress,
    getActiveChapters
  };
};
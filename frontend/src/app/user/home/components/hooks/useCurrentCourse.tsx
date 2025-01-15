// src/app/user/home/components/hooks/useCurrentCourse.tsx

import { useState, useEffect, useCallback } from 'react';
import { courseApi } from '@/lib/api/courses';
import { Chapter, ChapterContent,CourseData } from '@/types/course';
import { ChapterProgressStatus } from '@/types/status';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export const isReleaseTimeValid = (releaseTime: number, courseStartDate: string | null): boolean => {
  if (!courseStartDate) return true;
  const startDate = new Date(courseStartDate);
  const releaseDate = new Date(startDate.getTime() + releaseTime * 24 * 60 * 60 * 1000);
  return new Date() >= releaseDate;
};

// フックで使用する状態の型定義　
interface UseCurrentCourseState {
  courseData: CourseData | null;
  loading: boolean;
}

interface ButtonState {
  mainText: string;
  nextUnstartedChapter?: {
    id: string;
    title: string;
    orderIndex: number;
  };
}

interface ButtonState {
  mainText: string;  // メインボタンのテキスト
  nextChapter?: {    // 次のチャプターの情報（存在する場合）
    id: string;
    title: string;
    orderIndex: number;
  };
}

// 戻り値の型定義
interface UseCurrentCourseReturn {
  courseData: CourseData | null;
  loading: boolean;
  buttonState: ButtonState;
  determineChapterProgress: (chapter: any) => ChapterProgressStatus;
  handleContinueLearning: (chapterId?: string) => Promise<void>;  // ここを修正
  parseChapterContent: (chapter: any) => ChapterContent | null;  // 一時的な修正として
  refreshCourse: () => Promise<void>;
}
export const useCurrentCourse = (): UseCurrentCourseReturn => {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const getButtonState = useCallback((): ButtonState => {
    if (!courseData?.course?.chapters?.length) {
      return {
        mainText: 'このコースを学習する'
      };
    }
  
    const currentChapter = courseData.course.chapters[0];  // 表示中のチャプター
  
    return {
      mainText: 'このコースを学習する',
      nextChapter: currentChapter ? {
        id: currentChapter.id,
        title: currentChapter.title,
        orderIndex: currentChapter.orderIndex
      } : undefined
    };
  }, [courseData]);










  // タイムアウトをチェックする関数
  const checkTimeRemaining = (timeRemaining?: { 
    days: number;
    hours: number;
    minutes: number;
    timeOutAt: string;
  }) => {
    if (!timeRemaining) return false;
    
    const now = new Date();
    const timeOutAt = new Date(timeRemaining.timeOutAt);
    return now >= timeOutAt;
  };

  // チャプターの進捗状態を判定
  const determineChapterProgress = (chapter: any): ChapterProgressStatus => {
    if (!chapter) return 'NOT_STARTED';

    switch (chapter.status) {
      case 'COMPLETED':
        return 'COMPLETED';
      case 'LESSON_IN_PROGRESS':
        return 'LESSON_IN_PROGRESS';
      case 'LESSON_COMPLETED':
        return 'LESSON_COMPLETED';
      case 'TASK_IN_PROGRESS':
        return 'TASK_IN_PROGRESS';
      case 'FAILED':
        return 'FAILED';
      default:
        return 'NOT_STARTED';
    }
  };
  const parseChapterContent = (chapter: Chapter): ChapterContent | null => {
    if (!chapter || !chapter.content) return null;
  
    // ChapterContent型に厳密に合わせた返り値
    return {
      type: chapter.content.type,
      videoId: chapter.content.videoId,
      transcription: chapter.content.transcription,
      thumbnailUrl: chapter.content.thumbnailUrl
    };
  };
const loadCurrentCourse = async () => {
  try {
    console.log('【Step 1】loadCurrentCourse開始');
    setLoading(true);

    // コースデータ取得
    const response = await courseApi.getCurrentUserCourse();
    console.log('【Step 2】getCurrentUserCourse結果:', response);

    if (!response.success || !response.data) {
      throw new Error('コースデータの取得に失敗しました');
    }

    // コースデータのフォーマット
    const formattedData: CourseData = {
      id: response.data.id,
      userId: response.data.userId || '',
      courseId: response.data.id,
      isActive: response.data.status === 'active',
      status: response.data.status,
      startedAt: response.data.timeInfo.startedAt,
      completedAt: response.data.timeInfo.completedAt || null,
      progress: response.data.progress || 0,
      course: {
        id: response.data.id,
        title: response.data.title,
        description: response.data.description,
        level: response.data.levelRequired,
        rankRequired: response.data.rankRequired,
        levelRequired: response.data.levelRequired,
        timeLimit: response.data.timeLimit,
        timeRemaining: response.data.timeRemaining,
        chapters: response.data.chapters || []
      }
    };

    // 現在のチャプターを取得
    console.log('【Step 3】getCurrentChapter呼び出し開始', {
      courseId: formattedData.courseId
    });

    const chapterResponse = await courseApi.getCurrentChapter(formattedData.courseId);
    console.log('【Step 4】getCurrentChapter結果:', chapterResponse);

// loadCurrentCourse 関数内の該当部分を修正
if (chapterResponse.success && chapterResponse.data) {
  // 現在のチャプターを取得と統合
  const currentChapter = chapterResponse.data?.chapterId 
    ? formattedData.course.chapters.find(
        chapter => chapter.id === chapterResponse.data?.chapterId
      )
    : null;

  if (currentChapter) {
    // chapterResponse.dataの情報を現在のチャプターにマージ
    const mergedChapter = {
      ...currentChapter,
      startedAt: chapterResponse.data.startedAt,
      status: chapterResponse.data.status,
      isTimedOut: chapterResponse.data.isTimedOut,
      lessonWatchRate: chapterResponse.data.lessonWatchRate,
      score: chapterResponse.data.score
    };

    // マージしたチャプターで更新
    formattedData.course.chapters = [mergedChapter];
  }
}
    setCourseData(formattedData);
    console.log('【Step 5】コースデータ更新完了');

    // タイムアウトチェックは最後に
    if (checkTimeRemaining(formattedData.course.timeRemaining)) {
      console.log('【タイムアウト検知】データ更新必要');
      setTimeout(loadCurrentCourse, 1000);
    }

  } catch (error) {
    console.error('【エラー】loadCurrentCourse失敗:', error);
    toast.error('コース情報の取得に失敗しました');
  } finally {
    setLoading(false);
  }
};

const handleContinueLearning = async (targetChapterId?: string) => {
  if (!courseData) return;
  
  try {
    // タイムアウトチェック
    if (checkTimeRemaining(courseData.course.timeRemaining)) {
      await loadCurrentCourse();
      return;
    }

    const response = await courseApi.getCurrentChapter(courseData.courseId);

    if (response.success && response.data) {
      const chapterId = targetChapterId || response.data.chapterId;
      if (!chapterId) {
        throw new Error('Chapter ID not found');
      }

      await loadCurrentCourse();
      router.push(`/user/courses/${courseData.courseId}/chapters/${chapterId}`);
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error in handleContinueLearning:', error);
    toast.error('チャプターへの移動に失敗しました');
  }
};


  // 初回ロード時にデータを取得
  useEffect(() => {
    loadCurrentCourse();
  }, []);

  // タイムアウト時の自動更新チェック
  useEffect(() => {
    if (courseData?.course.timeRemaining) {
      const timeOutAt = new Date(courseData.course.timeRemaining.timeOutAt);
      const now = new Date();
      
      if (timeOutAt > now) {
        // タイムアウトまでの時間を計算
        const timeoutDelay = timeOutAt.getTime() - now.getTime();
        
        // タイムアウト時に自動更新するタイマーをセット
        const timer = setTimeout(() => {
          console.log('タイムアウトによる自動更新を実行します');
          loadCurrentCourse();
        }, timeoutDelay);

        return () => clearTimeout(timer);
      }
    }
  }, [courseData?.course.timeRemaining]);

 
return {
  courseData,
  loading,
  buttonState: getButtonState(),
  determineChapterProgress,
  handleContinueLearning,
  parseChapterContent,
  refreshCourse: loadCurrentCourse
};
};

// 単純にエクスポート
export default useCurrentCourse;
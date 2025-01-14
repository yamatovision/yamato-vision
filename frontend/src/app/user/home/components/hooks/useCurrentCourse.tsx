// src/app/user/home/components/hooks/useCurrentCourse.tsx

import { useState, useEffect, useCallback } from 'react';
import { courseApi } from '@/lib/api/courses';
import { CourseData } from '@/types/course';
import { ChapterProgressStatus } from '@/types/status';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// フックで使用する状態の型定義　
interface UseCurrentCourseState {
  courseData: CourseData | null;
  loading: boolean;
}

interface ButtonState {
  mainText: string;
  showNewChapterButton: boolean;
  nextUnstartedChapter?: {
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
  handleContinueLearning: () => Promise<void>;
  parseChapterContent: (any) => any | null;
  refreshCourse: () => Promise<void>;
}
export const useCurrentCourse = (): UseCurrentCourseReturn => {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getButtonState = useCallback((): ButtonState => {
    if (!courseData?.course?.chapters?.length) {
      return {
        mainText: 'このコースを学習する',
        showNewChapterButton: false
      };
    }
    const currentChapter = courseData.course.chapters[0];
    const chapters = courseData.course.chapters;

    // 未着手チャプターを探す（現在のチャプターより後ろのチャプターから）
    const nextUnstartedChapter = chapters.find(chapter => 
      chapter.orderIndex > currentChapter.orderIndex && 
      chapter.status === 'NOT_STARTED'
    );

    // 現在のチャプターが完了している場合
    if (currentChapter.status === 'COMPLETED') {
      return {
        mainText: 'このコースを学習する',
        showNewChapterButton: Boolean(nextUnstartedChapter),
        nextUnstartedChapter: nextUnstartedChapter ? {
          id: nextUnstartedChapter.id,
          title: nextUnstartedChapter.title,
          orderIndex: nextUnstartedChapter.orderIndex
        } : undefined
      };
    }

    // その他の場合
    return {
      mainText: 'このコースを学習する',
      showNewChapterButton: false
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
    if (!chapter) return null;
    const currentProgress = chapter.progress || {};
  
    return {
      id: chapter.id,
      title: chapter.title,
      subtitle: chapter.subtitle,
      orderIndex: chapter.orderIndex,
      status: chapter.status || 'NOT_STARTED',
      evaluationStatus: chapter.evaluationStatus,
      score: chapter.score,
      timeOutAt: chapter.timeOutAt,
      releaseTime: chapter.releaseTime,
      thumbnailUrl: chapter.thumbnailUrl,
      lessonWatchRate: chapter.lessonWatchRate || 0,
      isLocked: chapter.isLocked || false,
      canAccess: chapter.canAccess || true,
      nextUnlockTime: chapter.nextUnlockTime,
      isFinalExam: chapter.isFinalExam || false,
      content: chapter.content ? {
        type: chapter.content.type || 'video',
        videoId: chapter.content.videoId,
        thumbnailUrl: chapter.content.thumbnailUrl
      } : undefined,
      examSettings: chapter.examSettings ? {
        sections: chapter.examSettings.sections || [],
        thumbnailUrl: chapter.examSettings.thumbnailUrl,
        maxPoints: chapter.examSettings.maxPoints,
        timeLimit: chapter.examSettings.timeLimit,
        type: 'exam'
      } : undefined
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

    if (chapterResponse.success && chapterResponse.data) {
      // 現在のチャプターを取得と統合
      const currentChapter = formattedData.course.chapters.find(
        chapter => chapter.id === chapterResponse.data.chapterId
      );

      if (currentChapter) {
        // chapterResponse.dataの情報を現在のチャプターにマージ
        const mergedChapter = {
          ...currentChapter,
          startedAt: chapterResponse.data.startedAt,
          status: chapterResponse.data.status,
          isTimedOut: chapterResponse.data.isTimedOut,
          lessonWatchRate: chapterResponse.data.lessonWatchRate,
          score: chapterResponse.data.score  // スコアを追加
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
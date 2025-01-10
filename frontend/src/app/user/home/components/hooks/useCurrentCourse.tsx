// src/app/user/home/components/hooks/useCurrentCourse.tsx

import { useState, useEffect } from 'react';
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

// 戻り値の型定義
interface UseCurrentCourseReturn {
  courseData: CourseData | null;
  loading: boolean;
  determineChapterProgress: (chapter: any) => ChapterProgressStatus;
  handleContinueLearning: () => Promise<void>;
  parseChapterContent: (chapter: any) => any | null;
  refreshCourse: () => Promise<void>;
}

export const useCurrentCourse = (): UseCurrentCourseReturn => {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  // チャプターのコンテンツをパース
  // useCurrentCourse.tsxの修正
// useCurrentCourse.tsxのparseChapterContent関数を修正
const parseChapterContent = (chapter: any) => {
  console.log('【parseChapterContent Input】', chapter); // デバッグ用
  const currentProgress = chapter.progress || {};  // progressが存在しない場合は空オブジェクトを使用

  return {
    id: chapter.id,
    courseId: chapter.courseId,
    title: chapter.title,
    subtitle: chapter.subtitle,
    orderIndex: chapter.orderIndex,
    timeLimit: chapter.timeLimit,
    isVisible: chapter.isVisible,
    isPerfectOnly: chapter.isPerfectOnly,
    isFinalExam: chapter.isFinalExam,
    content: {
      type: chapter.content?.type || 'video',
      videoId: chapter.content?.videoId || '',
      transcription: chapter.content?.transcription,
      id: chapter.content?.id
    },
    lessonWatchRate: chapter.lessonWatchRate || 0,
    progress: {
      status: chapter.status || 'NOT_STARTED',
      startedAt: chapter.startedAt || null,
      timeOutAt: chapter.timeOutAt || null,
      isTimedOut: chapter.isTimedOut || false,
      score: chapter.progress?.score  // ここを修正！ progressオブジェクトから取得
    }
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



  // 学習を継続する処理
  const handleContinueLearning = async () => {
    if (!courseData) return;
    
    try {
      // タイムアウトチェック
      if (checkTimeRemaining(courseData.course.timeRemaining)) {
        await loadCurrentCourse(); // 最新データを取得
        return; // タイムアウト時は遷移せずに更新のみ
      }

      const response = await courseApi.getCurrentChapter(courseData.courseId);

      if (response.success && response.data) {
        const chapterId = response.data.chapterId;
        if (!chapterId) {
          throw new Error('Chapter ID not found in response');
        }

        // チャプター遷移前にコースデータを更新
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
    determineChapterProgress,
    handleContinueLearning,
    parseChapterContent,
    refreshCourse: loadCurrentCourse
  };
};

// 単純にエクスポート
export default useCurrentCourse;
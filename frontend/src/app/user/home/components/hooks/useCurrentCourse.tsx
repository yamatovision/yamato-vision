// src/app/user/home/components/hooks/useCurrentCourse.tsx

import { useState, useEffect, useCallback } from 'react';
import { courseApi } from '@/lib/api/courses';
import { formatTime } from '@/lib/utils/formatTime';
import { Chapter, ChapterContent, CourseData,  ExamSettings 
} from '@/types/course';
import { 
  ChapterPreviewData,
  ChapterEvaluationStatus  // 追加
} from '@/types/chapter';
import { ChapterProgressStatus,CourseStatus } from '@/types/status';

import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export const isReleaseTimeValid = (releaseTime: number, courseStartDate: string | null): boolean => {
  if (!courseStartDate) return true;
  const startDate = new Date(courseStartDate);
  const releaseDate = new Date(startDate.getTime() + releaseTime * 24 * 60 * 60 * 1000);
  return new Date() >= releaseDate;
};
interface NavigationChapter {
  id: string;
  title: string;
  orderIndex: number;
  status: ChapterProgressStatus;
  isLocked: boolean;
  canAccess: boolean;
  lessonWatchRate: number;  // 追加
  isFinalExam: boolean;     // 追加
  content?: ChapterContent; // 追加
  subtitle?: string;        // 追加
  timeOutAt?: Date | null;  // 追加
  releaseTime?: Date | null;// 追加
  thumbnailUrl?: string;    // 追加
  score?: number;           // 追加
  evaluationStatus?: ChapterEvaluationStatus; // 追加
  nextUnlockTime?: Date;    // 追加
  examSettings?: ExamSettings; // 追加
}

interface NavigationState {
  prevChapter: NavigationChapter | null;
  nextChapter: NavigationChapter | null;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
}

interface UseCurrentCourseState {
  courseData: CourseData | null;
  loading: boolean;
  navigationState: NavigationState;
}

interface ButtonState {
  mainText: string;
  showButton: boolean;
  isWaitingForRelease: boolean;
  releaseTimeMessage?: string;
  nextChapter?: {
    id: string;
    title: string;
    orderIndex: number;
  };
}

interface UseCurrentCourseReturn {
  courseData: CourseData | null;
  loading: boolean;
  buttonState: ButtonState;
  navigationState: NavigationState;
  determineChapterProgress: (chapter: any) => ChapterProgressStatus;
  handleContinueLearning: (chapterId?: string) => Promise<void>;
  parseChapterContent: (chapter: any) => ChapterContent | null;
  refreshCourse: () => Promise<void>;
  switchToChapter: (newChapter: ChapterPreviewData) => Promise<void>;
  getChapterDisplayState: (
    chapter: ChapterPreviewData,
    courseStatus: CourseStatus,
    previousChapter?: ChapterPreviewData | null
  ) => ChapterDisplayState;
}


const formatReleaseTime = (date: Date | string): string => {
  const releaseDate = new Date(date);
  const now = new Date();
  const diffHours = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  return `解放まであと${diffHours}時間`;
};

const formatTimeRemaining = (timeOutAt: Date | string): string => {
  const endTime = new Date(timeOutAt);
  const now = new Date();
  const remainingMs = endTime.getTime() - now.getTime();
  
  if (remainingMs <= 0) return '完了';
  
  return `残り${formatTime(Math.floor(remainingMs / 1000))}`;
};

// チャプター表示状態の型定義を追加
interface ChapterDisplayState {
  canShowPreview: boolean;
  message: string | null;
  showTimer: boolean;
}

// useCurrentCourse.tsx に追加する基本的な状態判定関数
const getChapterDisplayState = (
  chapter: ChapterPreviewData,
  courseStatus: CourseStatus,
  previousChapter?: ChapterPreviewData | null
) => {
  console.log('【チャプター表示状態の判定】', {
    チャプターID: chapter.id,
    チャプタータイトル: chapter.title,
    解放時間設定: chapter.nextUnlockTime,
    現在時刻: new Date().toISOString(),
    解放時間到達判定: chapter.nextUnlockTime ? new Date() < new Date(chapter.nextUnlockTime) : '設定なし',
    チャプターステータス: chapter.status,
    コースステータス: courseStatus,
    前のチャプター状態: previousChapter ? {
      ID: previousChapter.id,
      ステータス: previousChapter.status
    } : '前のチャプターなし'
  });
  // 1. コース完了系の状態判定
  if (['COMPLETED', 'FAILED', 'PERFECT'].includes(courseStatus)) {
    return {
      canShowPreview: true,
      message: '完了',
      showTimer: false
    };
  }

  // 2. 前のチャプターによるアクセス判定
  if (previousChapter && previousChapter.status !== 'COMPLETED') {
    return {
      canShowPreview: false,
      message: null,
      showTimer: false
    };
  }


  // 3. 時間待ち判定
  if (chapter.nextUnlockTime && new Date() < new Date(chapter.nextUnlockTime)) {
    return {
      canShowPreview: true,
      message: formatReleaseTime(chapter.nextUnlockTime),
      showTimer: true
    };
  }

  // 4. チャプター状態による表示判定
  if (chapter.status === 'NOT_STARTED') {
    return {
      canShowPreview: true,
      message: 'このチャプターを学習しましょう',
      showTimer: false
    };
  }

  // 5. 制限時間の表示
  return {
    canShowPreview: true,
    message: chapter.timeOutAt ? formatTimeRemaining(chapter.timeOutAt) : '完了',
    showTimer: !!chapter.timeOutAt
  };
};
export const useCurrentCourse = (): UseCurrentCourseReturn => {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [navigationState, setNavigationState] = useState<NavigationState>({
    prevChapter: null,
    nextChapter: null,
    canNavigatePrev: false,
    canNavigateNext: false,
  });
  const router = useRouter();


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


  const getButtonState = useCallback((): ButtonState => {
  if (!courseData?.course?.chapters?.length) {
    return {
      mainText: 'このコースを学習する',
      showButton: true,
      isWaitingForRelease: false
    };
  }

  const currentChapter = courseData.course.chapters[0];
  const chapterStatus = determineChapterProgress(currentChapter);

  // 解放待ち状態のチェック
  if (currentChapter.nextUnlockTime && new Date() < new Date(currentChapter.nextUnlockTime)) {
    return {
      mainText: 'このチャプターを学習する',
      showButton: false,
      isWaitingForRelease: true,
      releaseTimeMessage: formatReleaseTime(currentChapter.nextUnlockTime),
      nextChapter: {
        id: currentChapter.id,
        title: currentChapter.title,
        orderIndex: currentChapter.orderIndex
      }
    };
  }

  // 通常状態
  let mainText = 'このチャプターを学習する';
  if (chapterStatus === 'COMPLETED') {
    mainText = 'このチャプターを復習する';
  } else if (chapterStatus === 'LESSON_IN_PROGRESS' || chapterStatus === 'TASK_IN_PROGRESS') {
    mainText = 'このチャプターを学習する';
  }

  return {
    mainText,
    showButton: true,
    isWaitingForRelease: false,
    nextChapter: currentChapter ? {
      id: currentChapter.id,
      title: currentChapter.title,
      orderIndex: currentChapter.orderIndex
    } : undefined
  };
}, [courseData, determineChapterProgress]);
  const updateNavigationState = useCallback(async (currentChapter: CourseData['course']['chapters'][0]) => {
    if (!courseData?.course?.chapters) return;
  
    const response = await courseApi.getChaptersProgress(courseData.courseId);
    if (!response.success || !response.data) return;
  
    const chapters = response.data;
    const currentIndex = chapters.findIndex(ch => ch.id === currentChapter.id);
    
    const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
  
    const canNavigatePrev = !!prevChapter;
    const canNavigateNext = !!nextChapter && currentChapter.status === 'COMPLETED';
  
    setNavigationState({
      prevChapter: prevChapter ? {
        ...prevChapter, // ChapterPreviewDataの全プロパティを展開
        status: prevChapter.status,
        isLocked: prevChapter.isLocked,
        canAccess: prevChapter.canAccess
      } : null,
      nextChapter: nextChapter ? {
        ...nextChapter, // ChapterPreviewDataの全プロパティを展開
        status: nextChapter.status,
        isLocked: nextChapter.isLocked,
        canAccess: nextChapter.canAccess
      } : null,
      canNavigatePrev,
      canNavigateNext
    });
  }, [courseData]);
  const switchToChapter = async (newChapter: ChapterPreviewData) => {
    if (!courseData) return;
  
    // アクセス制御のチェック

    try {
      setLoading(true);
      const response = await courseApi.getChaptersProgress(courseData.courseId);
      
      if (!response.success || !response.data) {
        throw new Error('チャプター情報の取得に失敗しました');
      }
  
      // 最新のチャプター情報を取得
      const latestChapterInfo = response.data.find(ch => ch.id === newChapter.id);
      if (!latestChapterInfo) {
        throw new Error('チャプター情報が見つかりません');
      }
  
      // 前のチャプターが完了していない場合はアクセス不可
      const prevChapter = response.data.find(ch => ch.orderIndex === latestChapterInfo.orderIndex - 1);
      if (prevChapter && prevChapter.status !== 'COMPLETED' && !latestChapterInfo.canAccess) {
        toast.error('前のチャプターを完了させてください');
        return;
      }
  
      const updatedChapter = {
        ...latestChapterInfo,
        courseId: courseData.courseId
      };
  
      const updatedCourseData: CourseData = {
        ...courseData,
        course: {
          ...courseData.course,
          chapters: [updatedChapter]
        }
      };
      
      setCourseData(updatedCourseData);
      await updateNavigationState(updatedCourseData.course.chapters[0]);
  
    } catch (error) {
      toast.error('チャプターの切り替えに失敗しました');
    } finally {
      setLoading(false);
    }
  };

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

  const parseChapterContent = (chapter: Chapter): ChapterContent | null => {
    if (!chapter || !chapter.content) return null;
  
    // ChapterContent型に厳密に合わせた返り値
    return {
      type: chapter.content.type,
      videoId: chapter.content.videoId,
      transcription: chapter.content.transcription,
      thumbnailUrl: chapter.content.thumbnailUrl,
      submission: chapter.submission,  // submission情報を追加
      lessonWatchRate: chapter.lessonWatchRate
    };
  };

  const loadCurrentCourse = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getCurrentUserCourse();

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
      
   // loadCurrentCourse 関数内の該当部分を修正
if (chapterResponse.success && chapterResponse.data) {
  const currentChapter = chapterResponse.data?.chapterId 
    ? formattedData.course.chapters.find(
        chapter => chapter.id === chapterResponse.data?.chapterId
      )
    : null;

  if (currentChapter) {
    // chapterResponse.dataの情報を現在のチャプターにマージ
    const mergedChapter = {
      ...currentChapter,
      startedAt: chapterResponse.data.startedAt 
        ? new Date(chapterResponse.data.startedAt).toISOString() 
        : undefined,
      status: chapterResponse.data.status,
      isTimedOut: chapterResponse.data.isTimedOut,
      lessonWatchRate: chapterResponse.data.lessonWatchRate,
      score: chapterResponse.data.score,
      // CourseData['course']['chapters'][0]の型に合わせて必須プロパティを追加
      courseId: formattedData.courseId,
      title: currentChapter.title,
      subtitle: currentChapter.subtitle,
      orderIndex: currentChapter.orderIndex,
      timeLimit: currentChapter.timeLimit,
      isVisible: currentChapter.isVisible,
      content: currentChapter.content,
      isLocked: false,
      canAccess: true
    };

    // マージしたチャプターで更新
    formattedData.course.chapters = [mergedChapter];
    await updateNavigationState(mergedChapter);
  }
}
    setCourseData(formattedData);

    if (checkTimeRemaining(formattedData.course.timeRemaining)) {
      setTimeout(loadCurrentCourse, 1000);
    }

  } catch (error) {
    console.error('loadCurrentCourse失敗:', error);
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

    // 現在表示中のチャプターのIDを使用
    const currentChapter = courseData.course.chapters[0];
    const chapterId = currentChapter?.id;

    if (!chapterId) {
      throw new Error('Chapter ID not found');
    }

    await loadCurrentCourse();
    router.push(`/user/courses/${courseData.courseId}/chapters/${chapterId}`);
  } catch (error) {
    console.error('Error in handleContinueLearning:', error);
    toast.error('チャプターへの移動に失敗しました');
  }
};

useEffect(() => {
  loadCurrentCourse();
}, []);

useEffect(() => {
  if (courseData?.course?.chapters?.[0]) {
    updateNavigationState(courseData.course.chapters[0]);
  }
}, [courseData?.course?.chapters, updateNavigationState]);

useEffect(() => {
  if (!courseData?.course?.chapters?.[0]?.nextUnlockTime) return;

  const nextUnlockTime = new Date(courseData.course.chapters[0].nextUnlockTime);
  const now = new Date();
  
  if (now < nextUnlockTime) {
    const timeout = setTimeout(() => {
      loadCurrentCourse();
    }, nextUnlockTime.getTime() - now.getTime());
    
    return () => clearTimeout(timeout);
  }
}, [courseData?.course?.chapters]);


 return {
    courseData,
    loading,
    buttonState: getButtonState(),
    navigationState,
    determineChapterProgress,
    handleContinueLearning,
    parseChapterContent,
    refreshCourse: loadCurrentCourse,
    switchToChapter,
    getChapterDisplayState
  };
};

export default useCurrentCourse;
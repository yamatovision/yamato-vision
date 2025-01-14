'use client';

import { useTheme } from '@/contexts/theme';
import { useCurrentCourse } from './hooks/useCurrentCourse';
import { CourseHeader } from './CurrentCourse/CourseHeader';
import { ProgressStages } from './CurrentCourse/ProgressStages';
import { ChapterPreview } from './CurrentCourse/ChapterPreview';
import { useState } from 'react';
import { CourseOverviewModal } from './CurrentCourse/CourseOverviewModal';

// LoadingStateコンポーネント
const LoadingState = ({ theme }: { theme: string }) => (
  <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
    </div>
  </div>
);

// EmptyStateコンポーネント
const EmptyState = ({ theme }: { theme: string }) => (
  <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
    <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
      現在受講中のコースはありません
    </p>
  </div>
);

// メインコンポーネント
export function CurrentCourse() {
  const { theme } = useTheme();
  const {
    courseData,
    loading,
    determineChapterProgress,
    handleContinueLearning,
    parseChapterContent
  } = useCurrentCourse();
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);

  // ローディング中の表示
  if (loading) {
    return <LoadingState theme={theme} />;
  }

  // コースデータが存在しない場合の表示
  if (!courseData || !courseData.course) {
    return <EmptyState theme={theme} />;
  }

  // 現在のチャプターを取得と処理
  const currentChapter = courseData.course.chapters[0];
  const parsedChapter = currentChapter ? parseChapterContent(currentChapter) : null;
  
  console.log('【ProgressStages Props Debug】', {
    lessonWatchRate: parsedChapter?.lessonWatchRate,
    submission: parsedChapter?.submission,
    status: currentChapter ? determineChapterProgress(currentChapter) : null,
    raw: {
      currentChapter,
      parsedChapter
    }
  });
  
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
      {/* コースヘッダー */}
      <CourseHeader 
        courseData={courseData} 
        onOverviewClick={() => setIsOverviewModalOpen(true)}
      />

{currentChapter && parsedChapter && (
  <ProgressStages
    lessonWatchRate={parsedChapter.lessonWatchRate || 0}
    status={determineChapterProgress(currentChapter)}
    score={parsedChapter.score}
  />
)}


      {/* チャプタープレビュー */}
      {currentChapter && parsedChapter && (
  <ChapterPreview
    chapter={{
      ...parsedChapter,
      timeLimit: parsedChapter.timeLimit
    }}
    progress={{
      status: determineChapterProgress(currentChapter),
      startedAt: parsedChapter.progress?.startedAt || null,
      completedAt: parsedChapter.progress?.completedAt || null,
      timeOutAt: courseData.course.timeRemaining?.timeOutAt
    }}
  />
)}


      {/* 続きから学習するボタン */}
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

      {/* コース概要モーダル */}
      {courseData && (
        <CourseOverviewModal
          isOpen={isOverviewModalOpen}
          onClose={() => setIsOverviewModalOpen(false)}
          courseData={courseData}
        />
      )}
    </div>
  );
}
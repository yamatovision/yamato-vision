'use client';

import { useTheme } from '@/contexts/theme';
import { useCurrentCourse, isReleaseTimeValid } from './hooks/useCurrentCourse';
import { CourseHeader } from './CurrentCourse/CourseHeader';
import { ProgressStages } from './CurrentCourse/ProgressStages';
import { ChapterPreview } from './CurrentCourse/ChapterPreview';
import { useState } from 'react';
import { CourseOverviewModal } from './CurrentCourse/CourseOverviewModal';
import { motion, AnimatePresence } from 'framer-motion'; // アニメーション用に追加


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
const NavigationButton = ({ 
  direction, 
  onClick, 
  disabled, 
  label 
}: { 
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled: boolean;
  label: string;
}) => {
  const { theme } = useTheme();
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center p-2 rounded-full
        transition-all duration-200
        ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={label}
    >
      {direction === 'prev' ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
};
// メインコンポーネント
// メインコンポーネント
export function CurrentCourse() {
  const { theme } = useTheme();
  const {
    courseData,
    loading,
    determineChapterProgress,
    handleContinueLearning,
    parseChapterContent,
    navigationState,
    switchToChapter,
    buttonState,  // ここに追加
  } = useCurrentCourse();
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  // ローディング中の表示
  if (loading) {
    return <LoadingState theme={theme} />;
  }

  // コースデータが存在しない場合の表示
  if (!courseData || !courseData.course) {
    return <EmptyState theme={theme} />;
  }

  // ナビゲーション処理
  const handleNavigation = async (direction: 'prev' | 'next') => {
    const targetChapter = direction === 'prev' 
      ? navigationState.prevChapter 
      : navigationState.nextChapter;

    if (!targetChapter) return;

    setSlideDirection(direction === 'prev' ? 'right' : 'left');
    await switchToChapter(targetChapter);
  };

  // 現在のチャプターを取得と処理
  const currentChapter = courseData.course.chapters[0];
  const parsedChapter = currentChapter ? parseChapterContent(currentChapter) : null;
  const currentStatus = currentChapter ? determineChapterProgress(currentChapter) : null;
  
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
      {/* コースヘッダー */}
      <CourseHeader 
        courseData={courseData} 
        onOverviewClick={() => setIsOverviewModalOpen(true)}
      />
      
      {/* ナビゲーションとコンテンツ */}
      <div className="relative mt-4">
        {/* ナビゲーションボタン */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 -ml-4 z-10">
          <NavigationButton
            direction="prev"
            onClick={() => handleNavigation('prev')}
            disabled={!navigationState.canNavigatePrev}
            label="前のチャプター"
          />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-0 -mr-4 z-10">
          <NavigationButton
            direction="next"
            onClick={() => handleNavigation('next')}
            disabled={!navigationState.canNavigateNext}
            label="次のチャプター"
          />
        </div>

        {/* チャプターコンテンツ */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentChapter?.id}
            initial={{ opacity: 0, x: slideDirection === 'left' ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDirection === 'left' ? -50 : 50 }}
            transition={{ duration: 0.3 }}
          >
            {currentChapter && parsedChapter && (
              <>
                <ProgressStages
                  lessonWatchRate={currentChapter.lessonWatchRate || 0}
                  status={currentStatus || 'NOT_STARTED'}
                  score={currentChapter.score}
                />
                <ChapterPreview
                  chapter={{
                    ...currentChapter,
                    content: currentChapter.content,
                    lessonWatchRate: currentChapter.lessonWatchRate,
                    submission: currentChapter.submission
                  }}
                  progress={{
                    status: currentStatus || 'NOT_STARTED',
                    startedAt: parsedChapter.progress?.startedAt || null,
                    completedAt: parsedChapter.progress?.completedAt || null,
                    timeOutAt: courseData.course.timeRemaining?.timeOutAt
                  }}
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 学習ボタン */}
      {buttonState.showButton ? (
        <button 
          onClick={() => handleContinueLearning(courseData.course.chapters[0]?.id)}
          className={`w-full mt-4 ${
            theme === 'dark' 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-blue-400 hover:bg-blue-500'
          } text-white py-4 rounded-lg text-lg font-bold transition-colors shadow-lg`}
        >
          {buttonState.mainText}
        </button>
      ) : buttonState.isWaitingForRelease && (
        <div className={`w-full mt-4 p-4 ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
        } rounded-lg`}>
          <p className={`text-center ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {buttonState.releaseTimeMessage}
          </p>
        </div>
      )}

      {/* コース概要モーダル */}
      {courseData && (
        <CourseOverviewModal
          isOpen={isOverviewModalOpen}
          onClose={() => setIsOverviewModalOpen(false)}
          courseData={courseData}
          switchToChapter={switchToChapter}  // 追加
        />
      )}
    </div>
  );
}

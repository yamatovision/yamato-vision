'use client';

import { useTheme } from '@/contexts/theme';
import { useCurrentCourse, isReleaseTimeValid } from './hooks/useCurrentCourse';
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
      <>
        {/* デバッグログを先に配置 */}
        {console.log('【スコア情報 Debug】', {
          currentChapterScore: currentChapter?.submission?.score,
          status: determineChapterProgress(currentChapter),
          rawChapter: currentChapter
        })}

        {/* その後にコンポーネントを配置 */}
        <ProgressStages
          lessonWatchRate={currentChapter.lessonWatchRate || 0}
          status={determineChapterProgress(currentChapter)}
          score={currentChapter.score} // ここを修正
        />
      </>
    )}

      {/* チャプタープレビュー */}
      {currentChapter && parsedChapter && (
  <ChapterPreview
    chapter={{
      ...currentChapter,  // parsedChapterではなくcurrentChapterを使用
      content: currentChapter.content,
      lessonWatchRate: currentChapter.lessonWatchRate,
      submission: currentChapter.submission
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
  onClick={() => handleContinueLearning()}  // アロー関数で包む
  className={`w-full mt-4 ${
    theme === 'dark' 
      ? 'bg-blue-600 hover:bg-blue-700' 
      : 'bg-blue-400 hover:bg-blue-500'
  } text-white py-4 rounded-lg text-lg font-bold transition-colors shadow-lg`}
>
  このチャプターを学習する
</button>

{/* 次のチャプターボタン */}
{(() => {
  // 現在のチャプター情報を取得
  const currentIndex = courseData.course.chapters.findIndex(ch => ch.id === currentChapter?.id);
  const nextChapter = currentIndex !== -1 ? courseData.course.chapters[currentIndex + 1] : null;

  // デバッグログ
  console.log('【次のチャプターボタン判定】', {
    現在のチャプター: currentChapter?.id,
    現在のインデックス: currentIndex,
    次のチャプター: nextChapter?.id,
    リリース時間: nextChapter?.releaseTime,
    開始日: courseData.startedAt,
    ステータス: nextChapter ? determineChapterProgress(nextChapter) : null
  });

  // 次のチャプターが存在し、アンロックされており、未開始の場合のみボタンを表示
  if (nextChapter && 
      (!nextChapter.releaseTime || isReleaseTimeValid(nextChapter.releaseTime, courseData.startedAt)) && 
      determineChapterProgress(nextChapter) === 'NOT_STARTED') {
    return (
      <button 
        onClick={() => handleContinueLearning(nextChapter.id)}
        className={`w-full mt-2 ${
          theme === 'dark' 
            ? 'bg-yellow-600 hover:bg-yellow-700' 
            : 'bg-yellow-500 hover:bg-yellow-600'
        } text-white py-4 rounded-lg text-lg font-bold transition-colors shadow-lg`}
      >
        次のチャプター「{nextChapter.title}」に進む
      </button>
    );
  }
  return null;
})()}
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
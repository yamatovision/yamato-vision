'use client';

import { useTheme } from '@/contexts/theme';
import { useCurrentCourse } from './hooks/useCurrentCourse';
import { CourseHeader } from './CurrentCourse/CourseHeader';
import { ProgressStages } from './CurrentCourse/ProgressStages';
import { ChapterPreview } from './CurrentCourse/ChapterPreview';
import { ActiveUsers } from './CurrentCourse/ActiveUsers';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { courseApi } from '@/lib/api/courses';

export function CurrentCourse() {
  const { theme } = useTheme();
  const router = useRouter();
  const { courseData, loading, determineChapterProgress } = useCurrentCourse();

  const handleContinueLearning = async () => {
    if (!courseData) return;
    
    try {
      const chapterResponse = await courseApi.getCurrentChapter(courseData.courseId);
      
      if (!chapterResponse.success || !chapterResponse.data) {
        toast.error('チャプター情報の取得に失敗しました');
        return;
      }
  
      const { nextUrl } = chapterResponse.data;
      
      if (!nextUrl) {
        toast.error('次のチャプターが見つかりません');
        return;
      }
  
      router.push(nextUrl);
    } catch (error) {
      console.error('Error navigating to current chapter:', error);
      toast.error('チャプターへの移動に失敗しました');
    }
  };

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

  // 最初の3つのチャプターの進捗状態を取得
  const activeChapters = courseData.course.chapters
    .slice(0, 3)
    .map(chapter => ({
      status: determineChapterProgress(chapter),
      title: chapter.title
    }));

  // 現在のチャプターを取得（最初のチャプターを使用）
  const currentChapter = courseData.course.chapters[0];

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
      {/* ヘッダー部分 */}
      <CourseHeader courseData={courseData} />

      {/* 進捗トラッカー */}
      <ProgressStages stages={activeChapters} />

      {/* チャプタープレビュー */}
      <ChapterPreview
        chapter={currentChapter}
        currentContent={{
          type: 'video', // この部分は実際のデータに応じて変更
          url: '', // 実際のURLを設定
          duration: '12:30' // 実際の動画/音声の長さを設定
        }}
      />

      {/* アクティブユーザー */}
      <ActiveUsers
        users={[]} // 実際のユーザーデータを設定
        totalCount={0} // 実際の総数を設定
      />

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
    </div>
  );
}

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

interface ChapterContent {
  type: 'video' | 'audio';
  videoId: string;
  transcription?: string;
}

export function CurrentCourse() {
  const { theme } = useTheme();
  const router = useRouter();
  const { courseData, loading, determineChapterProgress } = useCurrentCourse();
  
  const handleContinueLearning = async () => {
    if (!courseData) return;
    
    try {
      console.log('Starting handleContinueLearning for course:', courseData.courseId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/user/${courseData.courseId}/current-chapter`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          credentials: 'include'
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to fetch current chapter');
      }
  
      const data = await response.json();
      console.log('Current chapter response:', data);
  
      if (data.success && data.data) {
        const chapterId = data.data.id || data.data.chapterId;
        if (!chapterId) {
          throw new Error('Chapter ID not found in response');
        }
        console.log('Redirecting to chapter:', chapterId);
        router.push(`/user/courses/${courseData.courseId}/chapters/${chapterId}`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error in handleContinueLearning:', error);
      toast.error('チャプターへの移動に失敗しました');
    }
  };

  // ローディング中の表示
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

  // コースデータが存在しない場合の表示
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
    const parseContent = (contentString: string | any): ChapterContent => {
      try {
        // すでにオブジェクトの場合はそのまま返す
        if (typeof contentString === 'object' && contentString !== null) {
          return {
            type: contentString.type || 'video',
            videoId: contentString.videoId || '',
            transcription: contentString.transcription || ''
          };
        }
    
        // 文字列の場合はJSONパースを試みる
        const parsed = JSON.parse(contentString);
        return {
          type: parsed.type || 'video',
          videoId: parsed.videoId || '',
          transcription: parsed.transcription || ''
        };
      } catch (error) {
        console.error('コンテンツ解析エラー:', error);
        return {
          type: 'video',
          videoId: '',
          transcription: ''
        };
      }
    };

  // 現在のチャプターを取得と処理
  const currentChapter = courseData.course.chapters[0];
  let parsedChapter;

  // チャプターが存在する場合のみログを出力と処理を実行
  if (currentChapter) {
    console.group('チャプター情報');
    console.log('取得したチャプター:', {
      ID: currentChapter.id,
      タイトル: currentChapter.title,
      コンテンツ: currentChapter.content
    });
    console.log('コンテンツ型:', typeof currentChapter.content);

    // パース処理
    parsedChapter = {
      ...currentChapter,
      content: parseContent(currentChapter.content as string)
    };
    
    console.log('パース後のチャプター:', parsedChapter);
    console.groupEnd();
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
      {/* ヘッダー部分 */}
      <CourseHeader courseData={courseData} />

      {/* 進捗トラッカー */}
      <ProgressStages stages={activeChapters} />

      {/* チャプタープレビュー - チャプターが存在する場合のみ表示 */}
      {currentChapter && parsedChapter && (
        <ChapterPreview
          chapter={parsedChapter}
          progress={{
            status: determineChapterProgress(currentChapter),
            startedAt: courseData.startedAt,
            completedAt: courseData.completedAt,
            timeOutAt: courseData.course.timeRemaining?.timeOutAt
          }}
        />
      )}

      {/* アクティブユーザー */}
      <ActiveUsers
        users={[]} 
        totalCount={0}
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
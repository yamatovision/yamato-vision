'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { Chapter } from '@/types/course';
import { courseApi } from '@/lib/api/courses';
import { toast } from 'react-hot-toast';
import { VideoPlayer } from '@/app/user/courses/components/VideoPlayer';
import { AudioPlayer } from '@/app/user/courses/components/AudioPlayer';
import { TimeRemaining } from '@/app/user/courses/components/TimeRemaining';
import { ActiveUsers } from '@/app/user/shared/ActiveUsers';
import { TaskSubmission } from '@/app/user/courses/components/TaskSubmission/TaskSubmission';  // 追加
import { PeerSubmissions } from '@/app/user/courses/components/PeerSubmissions';


interface ChapterPageProps {
  params: { 
    courseId: string; 
    chapterId: string;
  };
}

interface ChapterContent {
  type: 'video' | 'audio';
  videoId: string;
  url?: string;
  transcription?: string;
}

interface ChapterProgress {
  status: string;
  startedAt: string | null;
  completedAt?: string | null;
  timeOutAt?: string | null;
}

interface LoadingState {
  chapter: boolean;
  media: boolean;
  task: boolean;
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const { theme } = useTheme();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [parsedContent, setParsedContent] = useState<ChapterContent | null>(null);
  const [progress, setProgress] = useState<ChapterProgress | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    chapter: true,
    media: false,
    task: false
  });
  const extractContent = (systemMessage: string, tag: string): string => {
    if (!systemMessage) return '';
    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's');
    const match = systemMessage.match(regex);
    return match ? match[1].trim() : '';
  };
  

  const parseContent = (contentString: string): ChapterContent => {
    try {
      const parsed = typeof contentString === 'string' ? JSON.parse(contentString) : contentString;
      return {
        type: parsed.type || 'video',
        videoId: parsed.videoId || '',
        url: parsed.url || '',
        transcription: parsed.transcription || ''
      };
    } catch (error) {
      console.error('コンテンツ解析エラー:', error);
      return {
        type: 'video',
        videoId: '',
        url: '',
        transcription: ''
      };
    }
  };

  useEffect(() => {
    const initializeChapter = async () => {
      try {
        console.log('チャプター初期化開始:', {
          courseId: params.courseId,
          chapterId: params.chapterId
        });

        const chapterResponse = await courseApi.getChapter(
          params.courseId,
          params.chapterId
        );

        if (!chapterResponse.success) {
          throw new Error('チャプターの取得に失敗しました');
        }

        const chapterData = chapterResponse.data;
        console.log('チャプターデータ:', {
          title: chapterData.title,
          hasProgress: !!chapterData.userProgress?.length,
          startTime: chapterData.userProgress?.[0]?.startedAt
        });

        setChapter(chapterData);
        
        if (chapterData.content) {
          setParsedContent(parseContent(chapterData.content));
        }

        // 進捗情報の設定
        if (chapterData.userProgress?.[0]) {
          setProgress({
            status: chapterData.userProgress[0].status,
            startedAt: chapterData.userProgress[0].startedAt,
            completedAt: chapterData.userProgress[0].completedAt,
            timeOutAt: chapterData.userProgress[0].timeOutAt
          });
        }

        setLoading(prev => ({ ...prev, chapter: false }));

      } catch (error) {
        console.error('Error initializing chapter:', error);
        toast.error('チャプターの読み込みに失敗しました');
      }
    };

    initializeChapter();
  }, [params.courseId, params.chapterId]);

  if (loading.chapter) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 text-center`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            チャプターが見つかりません
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      {/* ヘッダー部分 */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mb-6`}>
        <div className="p-6">
          <h1 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
          }`}>
            Chapter {chapter.orderIndex + 1}: {chapter.title}
          </h1>
          {chapter.subtitle && (
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {chapter.subtitle}
            </p>
          )}
        </div>

        <div className="px-6 pb-4 flex justify-between items-center">
          {progress?.startedAt && chapter.timeLimit && (
            <TimeRemaining
              startTime={new Date(progress.startedAt)}
              timeLimit={chapter.timeLimit}
              type="chapter"
              onTimeout={() => {
                toast.error('制限時間を超過しました');
              }}
            />
          )}
  <ActiveUsers courseId={params.courseId} />
  </div>
      </div>

      {/* メディアコンテンツ */}
      {loading.media ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : parsedContent?.type === 'video' && parsedContent.videoId ? (
        <VideoPlayer
          videoId={parsedContent.videoId}
          courseId={params.courseId}
          chapterId={params.chapterId}
          transcription={parsedContent.transcription}
        />
      ) : parsedContent?.type === 'audio' && parsedContent.url ? (
        <AudioPlayer
          url={parsedContent.url}
          courseId={params.courseId}
          chapterId={params.chapterId}
          transcription={parsedContent.transcription}
        />
      ) : null}
 {(chapter?.taskContent || chapter?.task) && (
  <div className={`mt-8 ${
    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  } rounded-lg shadow-lg p-6`}>
    <h2 className={`text-xl font-bold mb-4 ${
      theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
    }`}>
      課題
    </h2>

          {/* リッチテキストによる課題説明 */}
          {chapter.taskContent?.description && (
            <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none mb-6`}>
              <div dangerouslySetInnerHTML={{ __html: chapter.taskContent.description }} />
            </div>
          )}

          {/* 従来の課題説明（taskContent がない場合のフォールバック） */}
          {!chapter.taskContent?.description && chapter.task?.description && (
            <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none mb-6`}>
              <div dangerouslySetInnerHTML={{ __html: chapter.task.description }} />
            </div>
          )}

           {/* 他の受講生の提出を表示 - ここに追加 */}
    {chapter.task && (
      <div className="mb-8">
        <PeerSubmissions
          courseId={params.courseId}
          chapterId={params.chapterId}
        />
      </div>
    )}

  {chapter.task && (
      <TaskSubmission
        task={{
          ...chapter.task,
          materials: extractContent(chapter.task.systemMessage, 'materials'),
          task: extractContent(chapter.task.systemMessage, 'task'),
          evaluationCriteria: extractContent(chapter.task.systemMessage, 'evaluation_criteria')
        }}
        courseId={params.courseId}
        chapterId={params.chapterId}
      />
    )}
  </div>
)}
    </div>
  );
}
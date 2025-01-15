'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/theme';
import { Chapter, UserChapterProgress } from '@/types/course';
import { courseApi } from '@/lib/api/courses';
import { ChapterProgressStatus } from '@/types/status';

import { toast } from 'react-hot-toast';
import { ChapterWithUserProgress } from '@/types/chapter';  // パスを変更
import { VideoPlayer } from '@/app/user/courses/components/VideoPlayer';
import { AudioPlayer } from '@/app/user/courses/components/AudioPlayer';
import { TimeRemaining } from '@/app/user/courses/components/TimeRemaining';
import { ActiveUsers } from '@/app/user/shared/ActiveUsers';
import { TaskSubmission } from '@/app/user/courses/components/TaskSubmission/TaskSubmission';
import { PeerSubmissions } from '@/app/user/courses/components/PeerSubmissions';
import { SubmissionState } from '@/types/submission';
import Script from 'next/script';

interface ChapterPageProgress {
  status: ChapterProgressStatus;
  lessonWatchRate: number;
  startedAt: string | null;
  completedAt: string | null;
}

interface ChapterPageProps {
  params: { 
    courseId: string; 
    chapterId: string;
  };
}


export default function ChapterPage({ params }: ChapterPageProps) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]); 
  const [pageProgress, setPageProgress] = useState<ChapterPageProgress | null>(null);
  const { theme } = useTheme();
  const [chapter, setChapter] = useState<ChapterWithUserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserChapterProgress | null>(null);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    hasSubmitted: false,
    peerSubmissions: [], // 必ず配列として初期化
    timeoutStatus: {
      isTimedOut: false
    }
  });

  const BestScoreDisplay = () => {
    if (!submissionState.bestScore) return null;

    return (
      <button
        onClick={() => router.push(`/user/courses/${params.courseId}/chapters/${params.chapterId}/evaluation`)}
        className={`absolute top-4 right-4 px-4 py-2 rounded-lg ${
          theme === 'dark'
            ? 'bg-gray-700 hover:bg-gray-600'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <span className={`font-bold text-xl ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {submissionState.bestScore}
        </span>
        <span className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          点
        </span>
      </button>
    );
  };
  const handleRefreshPeerSubmissions = async () => {
    try {
      const response = await courseApi.getChapterPeerSubmissions(
        params.courseId,
        params.chapterId,
        false  // isEvaluationPage: false
      );

      if (!response.success) {
        throw new Error('Failed to fetch peer submissions');
      }

      setSubmissionState(prev => ({
        ...prev,
        peerSubmissions: response.data.submissions,
        timeoutStatus: response.data.timeoutStatus || { isTimedOut: false }
      }));
    } catch (error) {
      console.error('Error refreshing peer submissions:', error);
      toast.error('他の受講生の提出を更新できませんでした');
    }
  };
  useEffect(() => {
    const initializeChapter = async () => {
      try {
        setLoading(true);
  
        try {
          await courseApi.handleFirstAccess(
            params.courseId,
            params.chapterId
          );
        } catch (error) {
          console.error('First access handling error:', error);
        }
  
        const chapterResponse = await courseApi.getChapter(
          params.courseId,
          params.chapterId
        );
  
        if (chapterResponse.success && chapterResponse.data) {
          const chapterData = chapterResponse.data;
          
          // 試験モードの場合はリダイレクト
          if (chapterData.isFinalExam) {
            router.push(`/user/courses/${params.courseId}/chapters/${params.chapterId}/examination`);
            return;
          }

          const chapterWithProgress: ChapterWithUserProgress = {
            ...chapterData,
            progress: {
              startedAt: chapterData.progress?.startedAt ?? null,
              completedAt: chapterData.progress?.completedAt ?? null,
              lessonWatchRate: chapterData.lessonWatchRate ?? 0,
              score: chapterData.score
            }
          };
  
          // ここでchapterDataをそのまま設定（型変換を削除）
          setChapter(chapterWithProgress);  // 変換したデータを設定
          
          // 新しい型で進捗情報を設定
         if (chapterData.progress) {
    setPageProgress({
      status: chapterData.status,
      lessonWatchRate: chapterData.lessonWatchRate,
      startedAt: chapterData.progress.startedAt,
      completedAt: chapterData.progress.completedAt
    });
  }
          await handleRefreshPeerSubmissions();
        } else {
          toast.error('チャプターの読み込みに失敗しました');
        }
      } catch (error) {
        console.error('Error initializing chapter:', error);
        toast.error('チャプターの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
  
    initializeChapter();
  }, [params.courseId, params.chapterId]);
  
  useEffect(() => {
    if (params.courseId && params.chapterId) {
      courseApi.trackChapterAccess(params.courseId, params.chapterId);
    }
  }, [params.courseId, params.chapterId]);
  useEffect(() => {
    if (params.courseId && params.chapterId) {
      courseApi.trackChapterAccess(params.courseId, params.chapterId);
    }
  }, [params.courseId, params.chapterId]);

  if (loading) {
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
    <>
  <Script 
      src="https://cdn.jsdelivr.net/npm/@mux/mux-player" 
      strategy="afterInteractive"
      onLoad={() => {
        console.log('Muxスクリプトが読み込まれました');
      }}
    />
      
      <div className="max-w-4xl mx-auto p-4 pb-20">
        <div className={`relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mb-6`}>
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

          {submissionState.bestScore && <BestScoreDisplay />}
        </div>

        {chapter.content?.type === 'video' && chapter.content.videoId && (
          <VideoPlayer
            videoId={chapter.content.videoId}
            courseId={params.courseId}
            chapterId={params.chapterId}
            transcription={chapter.content.transcription}
          />
        )}

{chapter.content?.type === 'audio' && chapter.content.videoId && (
  <AudioPlayer
    videoId={chapter.content.videoId}
    courseId={params.courseId}
    chapterId={params.chapterId}
    transcription={chapter.content.transcription}
  />
)}

        {(chapter.taskContent || chapter.task) && (
          <div className={`mt-8 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } rounded-lg shadow-lg p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
            }`}>
              課題
            </h2>

            {chapter.taskContent?.description && (
              <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none mb-6`}>
                <div dangerouslySetInnerHTML={{ __html: chapter.taskContent.description }} />
              </div>
            )}

            {(!submissionState?.timeoutStatus?.isTimedOut) && chapter.task && (
              <TaskSubmission
                task={chapter.task}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
            )}

            {/* PeerSubmissionsコンポーネントを使用 */}
            <div className="mt-8">




              <PeerSubmissions
                courseId={params.courseId}
                chapterId={params.chapterId}
                isEvaluationPage={false}
                timeoutStatus={submissionState.timeoutStatus}
                onRefresh={handleRefreshPeerSubmissions}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
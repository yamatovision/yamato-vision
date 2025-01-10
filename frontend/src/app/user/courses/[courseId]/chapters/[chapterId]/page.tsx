'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/theme';
import { Chapter, UserChapterProgress } from '@/types/course';
import { courseApi } from '@/lib/api/courses';
import { toast } from 'react-hot-toast';
import { VideoPlayer } from '@/app/user/courses/components/VideoPlayer';
import { AudioPlayer } from '@/app/user/courses/components/AudioPlayer';
import { TimeRemaining } from '@/app/user/courses/components/TimeRemaining';
import { ActiveUsers } from '@/app/user/shared/ActiveUsers';
import { TaskSubmission } from '@/app/user/courses/components/TaskSubmission/TaskSubmission';
import { PeerSubmissions } from '@/app/user/courses/components/PeerSubmissions';
import { SubmissionState } from '@/types/submission';
import Script from 'next/script';

interface ChapterPageProps {
  params: { 
    courseId: string; 
    chapterId: string;
  };
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [chapter, setChapter] = useState<Chapter | null>(null);
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
        false
      );
  
      console.log('【DEBUG】APIレスポンス:', {
        'レスポンス全体': response,
        'success状態': response.success,
        'データ構造': {
          data: response.data,
          submissions: response.data?.data?.submissions
        },
        'submissionsの型': typeof response.data?.data?.submissions,
        'Array判定': Array.isArray(response.data?.data?.submissions)
      });
  
      const submissions = response.data?.data?.submissions;
      if (response.success && Array.isArray(submissions)) {
        setSubmissionState(prev => ({
          ...prev,
          hasSubmitted: true,  // これを追加
          peerSubmissions: submissions,
          timeoutStatus: response.data.data.timeoutStatus || { isTimedOut: false }
        }));
      }
    } catch (error) {
      console.error('【ChapterPage】更新エラー:', error);
    }
  };
  useEffect(() => {
    // page.tsx の initializeChapter 関数内
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
      setChapter(chapterResponse.data);
      if (chapterResponse.data.userProgress?.[0]) {
        setProgress(chapterResponse.data.userProgress[0]);
      }
      await handleRefreshPeerSubmissions(); // ここで直接呼び出し
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

        {chapter.content?.type === 'audio' && chapter.content.url && (
          <AudioPlayer
            url={chapter.content.url}
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

{submissionState.hasSubmitted && (
  <div className="mt-8">
    {/* PeerSubmissionsコンポーネントの代わりに直接実装 */}
    <div className="space-y-6">
      <div className="flex justify-between items-center">
      <h2 className={`text-lg font-semibold ${
  theme === 'dark' ? 'text-white' : 'text-gray-900'
}`}>
  他の受講生の提出 ({submissionState.peerSubmissions?.length || 0}件)
</h2>

        <button
          onClick={handleRefreshPeerSubmissions}
          className={`px-4 py-2 rounded-lg text-sm ${
            theme === 'dark'
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          更新
        </button>
      </div>

      {(submissionState.peerSubmissions?.length || 0) > 0 ? (
  <div className="space-y-4">
    {submissionState.peerSubmissions?.map((submission) => (
            <div
              key={submission.id}
              className={`${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } rounded-lg shadow-sm p-4`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={submission.user.avatarUrl || '/default-avatar.png'}
                    alt={submission.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {submission.user.name}
                      {submission.user.isCurrentUser && ' (あなた)'}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {submission.user.rank}
                    </div>
                  </div>
                </div>
                {(submissionState.timeoutStatus.isTimedOut || submission.user.isCurrentUser) && submission.points && (
                  <div className={`text-lg font-bold ${
                    submission.points >= 95
                      ? 'text-yellow-500'
                      : submission.points >= 80
                        ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {submission.points}点
                  </div>
                )}
              </div>

              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <pre className={`whitespace-pre-wrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {submission.content}
                </pre>
              </div>

              {(submissionState.timeoutStatus.isTimedOut || submission.user.isCurrentUser) && submission.feedback && (
                <div className={`mt-4 p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'
                }`}>
                  <h3 className={`text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    フィードバック
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {submission.feedback}
                  </p>
                </div>
              )}

              <div className={`mt-4 text-right text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {new Date(submission.submittedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-8 text-center rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'
        }`}>
          提出はまだありません
        </div>
      )}
    </div>
  </div>
)}
          </div>
        )}
      </div>
    </>
  );
}
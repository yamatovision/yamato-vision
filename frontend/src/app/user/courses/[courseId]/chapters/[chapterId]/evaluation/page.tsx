'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/theme';
import { LoadingState } from '@/app/user/courses/components/TaskSubmission/LoadingState';
import { ResultView } from '@/app/user/courses/components/TaskSubmission/ResultView';
import { PeerSubmission } from '@/types/submission';  // 正しいインポートパス
import { toast } from 'react-hot-toast';
import { courseApi } from '@/lib/api/courses';

interface EvaluationPageProps {
  params: {
    courseId: string;
    chapterId: string;
  };
}
interface SubmissionResult {
  score: number;
  feedback: string;
  nextStep: string;
}


type EvaluationStatus = 'evaluating' | 'completed' | 'error';

export default function EvaluationPage({ params }: EvaluationPageProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const [submissions, setSubmissions] = useState<PeerSubmission[]>([]);
  const [status, setStatus] = useState<EvaluationStatus>('evaluating');
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    nextStep: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeoutStatus, setTimeoutStatus] = useState({
    isTimedOut: false,
    timeOutAt: undefined as Date | undefined
  });

  const handleRefreshPeerSubmissions = async () => {
    try {
      const response = await courseApi.getChapterPeerSubmissions(
        params.courseId,
        params.chapterId,
        true
      );
  
      if (!response.success) {
        throw new Error('Failed to fetch peer submissions');
      }
  
      // submissionsの更新を追加
      if (response.data.submissions) {
        setSubmissions(response.data.submissions);
      }
  
      // タイムアウト状態の更新
      if (response.data.timeoutStatus) {
        setTimeoutStatus({
          isTimedOut: response.data.timeoutStatus.isTimedOut,
          timeOutAt: response.data.timeoutStatus.timeOutAt 
            ? new Date(response.data.timeoutStatus.timeOutAt)
            : undefined
        });
      }
    } catch (error) {
      console.error('Error refreshing peer submissions:', error);
      toast.error('他の受講生の提出を更新できませんでした');
    }
  };
// evaluation/page.tsx の修正

// courseApi.submitTask の response.data.submission の型を正しく扱う部分を修正
useEffect(() => {
  const submissionKey = `submission_${params.courseId}_${params.chapterId}`;
  const savedSubmission = sessionStorage.getItem(submissionKey);
  
  if (!savedSubmission) {
    router.push(`/user/courses/${params.courseId}/chapters/${params.chapterId}`);
    return;
  }

  const evaluateSubmission = async () => {
    try {
      const response = await courseApi.submitTask(
        params.courseId,
        params.chapterId,
        { submission: savedSubmission }
      );

      if (response.success && response.data) {
        setResult({
          score: response.data.submission.points,
          feedback: response.data.submission.feedback || '',
          nextStep: response.data.submission.nextStep || ''
        });
        setStatus('completed');
        
        // 評価完了後にピア提出を取得
        handleRefreshPeerSubmissions();
      }
    } catch (error) {
      setStatus('error');
      toast.error('評価中にエラーが発生しました');
    } finally {
      sessionStorage.removeItem(submissionKey);
    }
  };

  evaluateSubmission();

  return () => {
    sessionStorage.removeItem(submissionKey);
  };
}, [params.courseId, params.chapterId, router]);

  const handleBack = () => {
    router.push(`/user/courses/${params.courseId}/chapters/${params.chapterId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className={`${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow-lg p-6`}>
        {/* ヘッダー */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            評価結果
          </h1>
          <button
            onClick={handleBack}
            className={`px-4 py-2 rounded-lg ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            課題に戻る
          </button>
        </div>

        {/* 評価結果表示 */}
        {status === 'evaluating' && (
          <LoadingState
            onTimeout={() => {
              setError('評価処理がタイムアウトしました');
              setStatus('error');
              toast.error('評価処理がタイムアウトしました');
            }}
            timeoutDuration={90000}
          />
        )}

        {status === 'error' && error && (
          <div className={`rounded-lg p-4 ${
            theme === 'dark'
              ? 'bg-red-900/50 border border-red-700'
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`${
              theme === 'dark' ? 'text-red-200' : 'text-red-800'
            }`}>
              {error}
            </p>
          </div>
        )}

        {status === 'completed' && result && (
          <ResultView result={result} />
        )}

        {/* ピア提出一覧 - 評価中でも表示 */}
        <div className="mt-8">
          <PeerSubmissions
            courseId={params.courseId}
            chapterId={params.chapterId}
            isEvaluationPage={true}
            timeoutStatus={timeoutStatus}
            onRefresh={handleRefreshPeerSubmissions}
            submissions={submissions}  // submissionsを追加
          />
        </div>
      </div>
    </div>
  );
}
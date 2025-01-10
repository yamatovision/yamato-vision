'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/theme';
import { LoadingState } from '@/app/user/courses/components/TaskSubmission/LoadingState';
import { ResultView } from '@/app/user/courses/components/TaskSubmission/ResultView';
import { PeerSubmissions } from '@/app/user/courses/components/PeerSubmissions';
import { toast } from 'react-hot-toast';
import { courseApi } from '@/lib/api/courses';

interface EvaluationPageProps {
  params: {
    courseId: string;
    chapterId: string;
  };
}

interface PeerSubmission {
  id: string;
  content: string;
  points: number;
  feedback: string;
  nextStep?: string;
  submittedAt: Date;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    rank: string;
    isCurrentUser: boolean;
  };
}

type EvaluationStatus = 'evaluating' | 'completed' | 'error';

export default function EvaluationPage({ params }: EvaluationPageProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const submission = searchParams.get('submission');
  const [status, setStatus] = useState<EvaluationStatus>('evaluating');
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    nextStep: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [peerSubmissions, setPeerSubmissions] = useState<PeerSubmission[]>([]);
  const [timeoutStatus, setTimeoutStatus] = useState({
    isTimedOut: false,
    timeOutAt: undefined as Date | undefined
  });

  const fetchPeerSubmissions = async () => {
    try {
      const response = await courseApi.getChapterPeerSubmissions(
        params.courseId,
        params.chapterId,
        true
      );

      if (!response.success) {
        throw new Error('ピア提出の取得に失敗しました');
      }

      setPeerSubmissions(response.data.submissions);
      if (response.data.timeoutStatus) {
        setTimeoutStatus({
          isTimedOut: response.data.timeoutStatus.isTimedOut,
          timeOutAt: response.data.timeoutStatus.timeOutAt 
            ? new Date(response.data.timeoutStatus.timeOutAt)
            : undefined
        });
      }
    } catch (error) {
      console.error('【エラー】ピア提出取得失敗:', error);
      toast.error('他の受講生の提出を取得できませんでした');
      setPeerSubmissions([]);
    }
  };

  useEffect(() => {
    const submissionKey = `submission_${params.courseId}_${params.chapterId}`;
    const savedSubmission = sessionStorage.getItem(submissionKey);
    
    if (!savedSubmission) {
      // 提出データがない場合は課題ページに戻る
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
  
        // 結果の処理
        if (response.success && response.data) {
          setResult({
            score: response.data.submission.points,
            feedback: response.data.submission.feedback,
            nextStep: response.data.submission.nextStep
          });
          setStatus('completed');
        }
      } catch (error) {
        setStatus('error');
        toast.error('評価中にエラーが発生しました');
      } finally {
        // 必ずセッションストレージをクリア
        sessionStorage.removeItem(submissionKey);
      }
    };
  
    evaluateSubmission();
  
    // クリーンアップ関数
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

        {/* ピア提出一覧 */}
        {Array.isArray(peerSubmissions) && peerSubmissions.length > 0 && (
          <div className="mt-8">
            <PeerSubmissions
              submissions={peerSubmissions}
              timeoutStatus={timeoutStatus}
              onRefresh={fetchPeerSubmissions}
            />
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/theme';
import { LoadingState } from '@/app/user/courses/components/TaskSubmission/LoadingState';
import { ResultView } from '@/app/user/courses/components/TaskSubmission/ResultView';
import { PeerSubmissions } from '@/app/user/courses/components/PeerSubmissions';
import { toast } from 'react-hot-toast';
import { courseApi } from '@/lib/api/courses';
import { SubmissionResult, PeerSubmission } from '@/types/submission';

interface EvaluationPageProps {
  params: {
    courseId: string;
    chapterId: string;
  };
}

type EvaluationStatus = 'evaluating' | 'completed' | 'error';

export default function EvaluationPage({ params }: EvaluationPageProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [status, setStatus] = useState<EvaluationStatus>('evaluating');
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [peerSubmissions, setPeerSubmissions] = useState<PeerSubmission[]>([]);
  const [timeoutStatus, setTimeoutStatus] = useState({
    isTimedOut: false,
    timeOutAt: undefined as Date | undefined
  });

  // 評価結果の取得
  const fetchLatestSubmission = async () => {
    try {
      const response = await courseApi.getLatestSubmission(
        params.courseId,
        params.chapterId
      );

      if (!response.success || !response.data) {
        throw new Error('評価結果の取得に失敗しました');
      }

      setResult({
        score: response.data.points,
        feedback: response.data.feedback,
        nextStep: response.data.nextStep
      });
      setStatus('completed');

    } catch (error) {
      console.error('Error fetching evaluation result:', error);
      if (status === 'evaluating') {
        // エラーの場合も再度取得を試みる
        setTimeout(fetchLatestSubmission, 1000);
      }
    }
  };

  // ピア提出の取得
  // app/user/courses/[courseId]/chapters/[chapterId]/evaluation/page.tsx

const fetchPeerSubmissions = async () => {
  try {
    const response = await courseApi.getChapterPeerSubmissions(
      params.courseId,
      params.chapterId,
      true  // isEvaluationPage = true
    );

    if (response.success && response.data) {
      setPeerSubmissions(response.data.submissions || []); // nullish対応
      setTimeoutStatus(response.data.timeoutStatus);
    }
  } catch (error) {
    console.error('Error fetching peer submissions:', error);
    toast.error('他の受講生の提出状況の取得に失敗しました');
  }
};

  // 初期データ取得
  useEffect(() => {
    fetchLatestSubmission();
    fetchPeerSubmissions();
  }, [params.courseId, params.chapterId]);

  const handleBack = () => {
    router.push(`/user/courses/${params.courseId}/chapters/${params.chapterId}`);
  };

  const handleTimeout = () => {
    setError('評価処理がタイムアウトしました');
    setStatus('error');
    toast.error('評価処理がタイムアウトしました');
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
            onTimeout={handleTimeout}
            timeoutDuration={90000}
          />
        )}

        {status === 'error' && (
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
        {peerSubmissions.length > 0 && (
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
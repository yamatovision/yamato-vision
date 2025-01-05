'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/theme';
import { LoadingState } from '@/app/user/courses/components/TaskSubmission/LoadingState';
import { ResultView } from '@/app/user/courses/components/TaskSubmission/ResultView';
import { toast } from 'react-hot-toast';

interface EvaluationPageProps {
  params: {
    courseId: string;
    chapterId: string;
  };
}

type EvaluationStatus = 'evaluating' | 'completed' | 'error';

interface EvaluationResult {
  score: number;
  feedback: string;
  nextStep: string;
}

export default function EvaluationPage({ params }: EvaluationPageProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [status, setStatus] = useState<EvaluationStatus>('evaluating');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  // frontend/src/app/user/courses/[courseId]/chapters/[chapterId]/evaluation/page.tsx

const fetchLatestSubmission = async () => {
  try {
    const response = await fetch(
      `/api/users/courses/${params.courseId}/chapters/${params.chapterId}/submission`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          })
        },
      }
    );

    if (!response.ok) {
      throw new Error('評価結果の取得に失敗しました');
    }

    const data = await response.json();
    
    // データの存在チェックを追加
    if (!data || !data.data) {
      throw new Error('無効な評価データ形式です');
    }

    // data.dataから値を取得するように修正
    setResult({
      score: data.data.points,
      feedback: data.data.feedback,
      nextStep: data.data.nextStep
    });
    setStatus('completed');

  } catch (error) {
    console.error('Error fetching evaluation result:', error);
    setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    setStatus('error');
    toast.error('評価結果の取得に失敗しました');
  }
};

    fetchLatestSubmission();
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

        {/* メインコンテンツ */}
        {status === 'evaluating' && (
          <LoadingState
            onTimeout={handleTimeout}
            timeoutDuration={15000}
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
      </div>
    </div>
  );
}
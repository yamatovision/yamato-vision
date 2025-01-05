'use client';

import { useState } from 'react';
import { SubmissionForm } from '../SubmissionForm';
import { LoadingState } from './LoadingState';
import { ResultView } from './ResultView';
import { Task } from '@/types/course';
import { courseApi } from '@/lib/api/courses';
import { toast } from 'react-hot-toast';

interface TaskSubmissionProps {
  task: Task;
  courseId: string;
  chapterId: string;
}

type SubmissionStatus = 'idle' | 'submitting' | 'evaluating' | 'completed' | 'error';

// ResultViewPropsに合わせて型を修正
interface SubmissionResult {
  score: number;      // points から score に変更
  feedback: string;
  nextStep: string;   // next_step から nextStep に変更
}

export function TaskSubmission({ task, courseId, chapterId }: TaskSubmissionProps) {
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (submission: string) => {
    try {
      setStatus('submitting');
      setError(null);

      // 提出処理
      const response = await courseApi.submitTask(courseId, chapterId, {
        submission: submission.trim()
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || '課題の提出に失敗しました');
      }

      // 評価中状態に移行
      setStatus('evaluating');

      // 評価結果を設定（キー名を修正）
      const evaluationResult = {
        score: response.data.evaluation.total_score,
        feedback: response.data.evaluation.feedback,
        nextStep: response.data.evaluation.next_step
      };

      setResult(evaluationResult);
      setStatus('completed');
      toast.success('課題を提出しました！');

    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
      setStatus('error');
      toast.error('課題の提出中にエラーが発生しました');
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setError(null);
    setResult(null);
  };

  // ローディング中のタイムアウト処理
  const handleTimeout = () => {
    setStatus('error');
    setError('評価処理がタイムアウトしました。もう一度お試しください。');
    toast.error('評価処理がタイムアウトしました');
  };

  return (
    <div className="space-y-6">
      {status === 'idle' && (
        <SubmissionForm
          task={task}
          courseId={courseId}
          chapterId={chapterId}
          onSubmit={handleSubmit}
        />
      )}

      {(status === 'submitting' || status === 'evaluating') && (
        <LoadingState
          onTimeout={handleTimeout}
          timeoutDuration={50000} // 50秒
        />
      )}

      {status === 'completed' && result && (
        <ResultView result={result} />
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            もう一度試す
          </button>
        </div>
      )}
    </div>
  );
}

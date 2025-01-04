// frontend/src/app/user/courses/[courseId]/chapters/[chapterId]/components/TaskSubmission/index.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { courseApi } from '@/lib/api/courses';
import { SubmissionForm } from './SubmissionForm';
import { LoadingState } from './LoadingState';
import { ResultView } from './ResultView';

interface TaskSubmissionProps {
  courseId: string;
  chapterId: string;
  task: {
    description: string;
    systemMessage: string;
    referenceText: string;
    maxPoints: number;
    type: string;
  };
  onComplete: () => Promise<void>;
}

type SubmissionState = 'input' | 'evaluating' | 'completed';

export const TaskSubmission: React.FC<TaskSubmissionProps> = ({
  courseId,
  chapterId,
  task,
  onComplete
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [state, setState] = useState<SubmissionState>('input');
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const handleSubmit = async (prompt: string, result: string) => {
    try {
      setState('evaluating');
      
      // 課題提出APIの呼び出し
      const submission = await courseApi.submitTask(courseId, chapterId, {
        prompt,
        result
      });

      if (!submission.success) {
        throw new Error(submission.error || '提出に失敗しました');
      }

      setEvaluationResult(submission.data);
      setState('completed');

      // チャプター完了処理
      await onComplete();

      // 評価結果表示後、次のチャプターまたはホームに遷移
      const response = await courseApi.completeChapter(courseId, chapterId);
      
      if (response.success && response.data.nextChapterId) {
        router.push(`/user/courses/${courseId}/chapters/${response.data.nextChapterId}`);
      } else {
        router.push('/user/home');
      }

    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('課題の提出に失敗しました');
      setState('input');
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6`}>
      {state === 'input' && (
        <SubmissionForm
          task={task}
          onSubmit={handleSubmit}
        />
      )}
      
      {state === 'evaluating' && (
        <LoadingState />
      )}
      
      {state === 'completed' && evaluationResult && (
        <ResultView
          result={evaluationResult}
        />
      )}
    </div>
  );
};
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/theme';
import { Task } from '@/types/course';
import { courseApi } from '@/lib/api/courses';
import { toast } from 'react-hot-toast';

interface SubmissionFormProps {
  task: Task;
  courseId: string;
  chapterId: string;
  onSubmit: (submission: string) => Promise<void>;  // 追加

}

export function SubmissionForm({ task, courseId, chapterId }: SubmissionFormProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [submission, setSubmission] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const submissionKey = `submission_${courseId}_${chapterId}`;
      sessionStorage.setItem(submissionKey, submission.trim());
      router.push(`/user/courses/${courseId}/chapters/${chapterId}/evaluation`);
    } catch (error) {
      setIsSubmitting(false);
      toast.error('提出の準備に失敗しました');
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          回答
        </label>
        <textarea
          value={submission}
          onChange={(e) => setSubmission(e.target.value)}
          required
          disabled={isSubmitting}
          className={`w-full h-32 rounded-lg p-3 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white border-gray-600'
              : 'bg-white text-gray-900 border-gray-200'
          } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
          placeholder="回答を入力してください"
        />
      </div>

      <div className="flex justify-between items-center">
        <div className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          配点: {task.maxPoints}点
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50`}
        >
          {isSubmitting ? '提出中...' : '課題を提出'}
        </button>
      </div>
    </form>
  );
}
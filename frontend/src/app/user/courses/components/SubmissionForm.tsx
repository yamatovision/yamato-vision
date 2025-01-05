'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { Task } from '@/types/course';

interface SubmissionFormProps {
  task: Task;
  courseId: string;
  chapterId: string;
  onSubmit: (submission: string) => Promise<void>;
}

export function SubmissionForm({ 
  task, 
  courseId, 
  chapterId,
  onSubmit 
}: SubmissionFormProps) {
  const { theme } = useTheme();
  const [submission, setSubmission] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission.trim() || isSubmitting) return;
  
    setIsSubmitting(true);
    try {
      await onSubmit(submission);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
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
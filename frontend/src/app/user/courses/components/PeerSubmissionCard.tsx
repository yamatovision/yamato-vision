// frontend/src/app/user/courses/[courseId]/chapters/[chapterId]/components/PeerSubmissionCard.tsx
'use client';

import { useTheme } from '@/contexts/theme';
import { formatDate } from '@/lib/utils/dateUtils';

interface PeerSubmissionCardProps {
  submission: {
    id: string;
    content: string;
    points: number;
    feedback: string;
    nextStep: string;
    submittedAt: Date;
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
      rank: string;
    };
  };
}

export function PeerSubmissionCard({ submission }: PeerSubmissionCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`rounded-lg shadow-sm p-4 mb-4 ${
      isDark ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* ヘッダー: ユーザー情報と点数 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={submission.user.avatarUrl || '/default-avatar.png'}
            alt={submission.user.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className={`font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {submission.user.name}
            </div>
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {submission.user.rank}
            </div>
          </div>
        </div>
        <div className={`text-lg font-bold ${
          isDark 
            ? submission.points >= 95 ? 'text-blue-400' : 'text-gray-400'
            : submission.points >= 95 ? 'text-blue-600' : 'text-gray-600'
        }`}>
          {submission.points}点
        </div>
      </div>

      {/* 提出内容 */}
      <div className={`p-4 rounded-lg mb-4 ${
        isDark ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <h3 className={`text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          提出内容
        </h3>
        <p className={`whitespace-pre-wrap ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {submission.content}
        </p>
      </div>

      {/* フィードバック */}
      <div className={`p-4 rounded-lg mb-3 ${
        isDark ? 'bg-gray-700/50' : 'bg-blue-50'
      }`}>
        <h3 className={`text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          フィードバック
        </h3>
        <p className={`text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {submission.feedback}
        </p>
      </div>

      {/* 提出日時 */}
      <div className={`text-right text-sm ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`}>
        提出日時: {formatDate(new Date(submission.submittedAt))}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { PeerSubmission, PeerSubmissionsProps } from '@/types/submission';

export function PeerSubmissions({ 
  submissions = [],
  paginationInfo = { total: 0, page: 1, perPage: 10 },  // 追加
  timeoutStatus = { isTimedOut: false },
  onRefresh 
}: PeerSubmissionsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  console.log('【PeerSubmissions】マウント時のprops:', {
    submissionsの型: typeof submissions,
    submissions実体: submissions,
    isArray: Array.isArray(submissions),
    length: submissions?.length,
    ページ情報: paginationInfo  // 追加
  });

  const getSubmittedAtTime = (date: string | Date): number => {
    return new Date(date).getTime();
  };

  const getSortedSubmissions = (): PeerSubmission[] => {
    if (!Array.isArray(submissions)) {
      console.log('【警告】submissions が配列ではありません', submissions);
      return [];
    }

    console.log('【getSortedSubmissions】ソート前', {
      提出数: submissions.length
    });

    const filtered = timeoutStatus?.isTimedOut
      ? submissions.filter(sub => (sub.points || 0) >= 80)
      : submissions;

    return filtered.sort((a, b) => {
      if (timeoutStatus?.isTimedOut) {
        const pointsDiff = (b.points || 0) - (a.points || 0);
        return pointsDiff !== 0 
          ? pointsDiff 
          : getSubmittedAtTime(b.submittedAt) - getSubmittedAtTime(a.submittedAt);
      }
      return getSubmittedAtTime(b.submittedAt) - getSubmittedAtTime(a.submittedAt);
    });
  };

  const sortedSubmissions = getSortedSubmissions();

  console.log('【PeerSubmissions】表示直前の状態', {
    ソート後の提出数: sortedSubmissions.length,
    表示データ: sortedSubmissions
  });

  return (
    <div className="space-y-6">
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-center">
        <h2 className={`text-lg font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          他の受講生の提出 ({paginationInfo.total}件) {/* 修正 */}
        </h2>
        {onRefresh && (
          <button
            onClick={() => {
              console.log('【更新ボタン】クリックされました');
              onRefresh();
            }}
            className={`px-4 py-2 rounded-lg text-sm ${
              isDark
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            更新
          </button>
        )}
      </div>

      {/* 提出一覧 */}
      {sortedSubmissions.length > 0 ? (
        <div className="space-y-4">
          {sortedSubmissions.map((submission) => (
            <div
              key={submission.id}
              className={`${
                isDark ? 'bg-gray-800' : 'bg-white'
              } rounded-lg shadow-sm p-4`}
            >
              {/* ヘッダー: ユーザー情報と点数 */}
              <div className="flex justify-between items-start mb-4">
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
                      {submission.user.isCurrentUser && ' (あなた)'}
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {submission.user.rank}
                    </div>
                  </div>
                </div>
                {(timeoutStatus.isTimedOut || submission.user.isCurrentUser) && submission.points && (
                  <div className={`text-lg font-bold ${
                    submission.points >= 95
                      ? 'text-yellow-500'
                      : submission.points >= 80
                        ? isDark ? 'text-blue-400' : 'text-blue-600'
                        : isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {submission.points}点
                  </div>
                )}
              </div>

              {/* 提出内容 */}
              <div className={`p-4 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <pre className={`whitespace-pre-wrap text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {submission.content}
                </pre>
              </div>

              {/* フィードバック（タイムアウト後または自分の提出のみ表示） */}
              {(timeoutStatus.isTimedOut || submission.user.isCurrentUser) && submission.feedback && (
                <div className={`mt-4 p-4 rounded-lg ${
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
              )}

              {/* 提出日時 */}
              <div className={`mt-4 text-right text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {new Date(submission.submittedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-8 text-center rounded-lg ${
          isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'
        }`}>
          提出はまだありません
        </div>
      )}
    </div>
  );
}
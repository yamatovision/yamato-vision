'use client';

import { useTheme } from '@/contexts/theme';
import { useEffect, useState } from 'react';  // useEffectとuseStateを追加
import { courseApi } from '@/lib/api/courses';  // courseApiをインポート
import { toast } from 'react-hot-toast';  // toastをインポート


interface PeerSubmission {
  id: string;
  content: string;
  points: number | null;
  feedback: string | null;
  nextStep: string | null;
  submittedAt: Date;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    nickname: string | null;
    rank: string;
    isCurrentUser: boolean;
  };
  visibility: {
    canViewContent: boolean;
    canViewScore: boolean;
    canViewFeedback: boolean;
    canViewNextStep: boolean;
  };
}

interface TimeoutStatus {
  isTimedOut: boolean;
  timeOutAt?: Date;
}

interface PeerSubmissionsProps {
  courseId: string;
  chapterId: string;
  isEvaluationPage: boolean;
  timeoutStatus: TimeoutStatus;
  onRefresh: () => void;
  submissions: PeerSubmission[];  // submissionsを追加
}

export function PeerSubmissions({
  courseId,
  chapterId,
  isEvaluationPage,
  timeoutStatus,
  onRefresh
}: Omit<PeerSubmissionsProps, 'submissions'>) {  // submissionsをpropsから除外
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [submissions, setSubmissions] = useState<PeerSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchSubmissions = async () => {
    try {
      console.log('【データ取得開始】fetchSubmissions:', {
        パラメータ: {
          courseId,
          chapterId,
          isEvaluationPage
        }
      });
  
      setIsLoading(true);
      const response = await courseApi.getChapterPeerSubmissions(
        courseId,
        chapterId,
        isEvaluationPage
      );
  
      console.log('【API応答】getChapterPeerSubmissions:', {
        成功状態: response.success,
        データ構造: {
          submissions: response.data?.data?.submissions,  // data.dataの参照に修正
          isArray: Array.isArray(response.data?.data?.submissions),
          件数: response.data?.data?.submissions?.length
        },
        レスポンス全体: response
      });
  
      if (response.success && response.data?.data?.submissions) {  // data.dataの存在確認
        console.log('【State更新前】submissions:', {
          現在のデータ: submissions,
          更新データ: response.data.data.submissions  // data.dataの参照に修正
        });
        setSubmissions(response.data.data.submissions);  // data.dataの参照に修正
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('提出データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    // 4. コンポーネントマウント時のログ
    console.log('【コンポーネントマウント】PeerSubmissions:', {
      props: {
        courseId,
        chapterId,
        isEvaluationPage,
        timeoutStatus
      }
    });
    fetchSubmissions();
  }, [courseId, chapterId, isEvaluationPage]);

  const handleRefresh = async () => {
    await fetchSubmissions();
    onRefresh?.();
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-center">
        <h2 className={`text-lg font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          提出済みの課題
        </h2>
        <div className="flex items-center space-x-4">
          {timeoutStatus.timeOutAt && (
            <span className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {timeoutStatus.isTimedOut 
                ? '制限時間が終了しました'
                : `制限時間: ${new Date(timeoutStatus.timeOutAt).toLocaleString()}`
              }
            </span>
          )}
          <button
            onClick={handleRefresh}
            className={`px-4 py-2 rounded-lg text-sm ${
              isDark
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            更新
          </button>
        </div>
      </div>

      {/* 提出一覧 */}
      {isLoading ? (
        <div className={`p-8 text-center rounded-lg ${
          isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'
        }`}>
          データを読み込み中...
        </div>
      ) : submissions && submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className={`${
                isDark ? 'bg-gray-800' : 'bg-white'
              } rounded-lg shadow-sm p-4`}
            >
              {/* ユーザー情報と得点 */}
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
                      {submission.user.nickname || submission.user.name}
                      {submission.user.isCurrentUser && ' (あなた)'}
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {submission.user.rank}
                    </div>
                  </div>
                </div>
                {submission.visibility.canViewScore && submission.points !== null && (
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
              {submission.visibility.canViewContent && (
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <pre className={`whitespace-pre-wrap text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {submission.content}
                  </pre>
                </div>
              )}

              {/* フィードバック */}
              {submission.visibility.canViewFeedback && submission.feedback && (
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

              {/* 次のステップ（自分の提出のみ表示） */}
              {submission.visibility.canViewNextStep && submission.nextStep && (
                <div className={`mt-4 p-4 rounded-lg ${
                  isDark ? 'bg-gray-700/50' : 'bg-green-50'
                }`}>
                  <h3 className={`text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    次のステップ
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {submission.nextStep}
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
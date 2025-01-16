'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { courseApi } from '@/lib/api/courses';
import { CourseRankingResponse } from '@/types/ranking';
import { useRouter } from 'next/navigation';
import { useCurrentCourse } from './hooks/useCurrentCourse';

export function WeeklyRanking() {
  const { theme } = useTheme();
  const router = useRouter();
  const { courseData, loading } = useCurrentCourse();
  const [ranking, setRanking] = useState<CourseRankingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      if (!courseData?.courseId) return;
      
      try {
        const response = await courseApi.getCourseRanking(courseData.courseId);
        console.log('【クライアント側でのランキングデータ受信】', {
          成功: response.success,
          データ全体: response.data,
          アクティブユーザー: response.data?.activeUsers,
          アクティブユーザー数: response.data?.activeUsers?.length,
          データ型: response.data ? typeof response.data : 'undefined',
          response全体: response
        });
  
        if (response.success && response.data) {
          setRanking(response.data);
        } else {
          setError(response.error || 'Failed to fetch ranking data');
        }
      } catch (error) {
        console.error('Error fetching ranking:', error);
        setError('Failed to fetch ranking data');
      }
    };
  
    fetchRanking();
  }, [courseData?.courseId]);
  
  // コンポーネントのデバッグログを追加
  console.log('【WeeklyRankingコンポーネントの状態】', {
    ranking,
    loading,
    error,
    アクティブユーザー: ranking?.activeUsers,
    アクティブユーザー数: ranking?.activeUsers?.length
  });
  // ローディング中、データがない、またはエラーの場合は早期リターン
  if (loading || !courseData) return null;
  if (error) return null; // またはエラーメッセージを表示
  if (!ranking || !ranking.activeUsers) return null;

  const handleClick = () => {
    router.push(`/user/courses/${courseData.courseId}/ranking`);
  };

  // アクティブユーザーの上位5名を表示（安全なアクセス）
  const topUsers = ranking.activeUsers.slice(0, 5);

  if (topUsers.length === 0) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
        <h2 className={`text-xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
        }`}>週間ランキング</h2>
        <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          まだデータがありません
        </p>
      </div>
    );
  }
  
  
  return (
    <div 
      className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 cursor-pointer hover:opacity-90 transition-opacity`}
      onClick={handleClick}
    >
      <h2 className={`text-xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
      }`}>週間ランキング</h2>
      
      {topUsers.map((user, index) => (
        <div 
          key={user.userId}
          className={`${
            index === 0 
              ? theme === 'dark' 
                ? 'bg-gradient-to-r from-yellow-900 to-yellow-700' 
                : 'bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-100 border border-blue-200'
              : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          } rounded-lg p-4 ${index !== topUsers.length - 1 ? 'mb-3' : ''} ${index === 0 ? 'shadow-sm' : ''}`}
        >
          <div className="flex items-center space-x-3">
            <div className={`${
              index === 0
                ? theme === 'dark'
                  ? 'text-yellow-400'
                  : 'bg-blue-500/10 text-blue-600'
                : theme === 'dark'
                  ? 'bg-gray-600 text-gray-300'
                  : 'bg-gray-200 text-gray-600'
            } w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm`}>
              {index + 1}
            </div>
            <img 
              src={user.avatarUrl || "https://placehold.jp/30x30.png"} 
              className="w-8 h-8 rounded-full"
              alt={user.name || "ユーザー"}
            />
            <div>
              <div className={`font-bold ${
                theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
              }`}>{user.name}</div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${
                  index === 0
                    ? theme === 'dark' ? 'text-gray-300' : 'text-blue-600'
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>{user.averageScore.toFixed(1)} pts</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  index === 0
                    ? theme === 'dark'
                      ? 'bg-yellow-900/50 text-yellow-400'
                      : 'bg-blue-100 text-blue-600'
                    : theme === 'dark'
                      ? 'bg-gray-600 text-gray-300'
                      : 'bg-gray-200 text-gray-600'
                }`}>{user.rank}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="text-center mt-3">
        <span className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          クリックして詳細を表示
        </span>
      </div>
    </div>
  );
}

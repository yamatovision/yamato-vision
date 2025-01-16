'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { courseApi } from '@/lib/api/courses';
import { CourseRankingResponse } from '@/types/ranking';
import { RankingTabs } from './components/RankingTabs';

export default function RankingPage({ params }: { params: { courseId: string } }) {
  const { theme } = useTheme();
  const [ranking, setRanking] = useState<CourseRankingResponse | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await courseApi.getCourseRanking(params.courseId);
        if (response.success && response.data) {
          setRanking(response.data);
          // アクティブユーザーが10人未満の場合、デフォルトで歴代タブを表示
          if (response.data.activeUserCount < 10) {
            setSelectedTab(1);
          }
        }
      } catch (error) {
        console.error('Error fetching ranking:', error);
      }
    };

    fetchRanking();
  }, [params.courseId]);

  if (!ranking) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
      <h2 className={`text-xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
      }`}>コースランキング</h2>

      <RankingTabs 
        activeUsers={ranking.activeUsers}
        historicalUsers={ranking.historicalUsers}
        activeUserCount={ranking.activeUserCount}
        selectedIndex={selectedTab}
        onChangeTab={setSelectedTab}
      />
    </div>
  );
}
'use client';

import React from 'react';
import { useTheme } from '@/contexts/theme';
import { CourseStatus } from './types';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';  // ファイルの先頭に追加
import { courseApi } from '@/lib/api/courses';  // この行を追加



interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  gemCost?: number;
  levelRequired?: number;
  rankRequired?: string;
  gradient: string;
  onUnlock: () => void;
  lastAccessedChapterId?: string;
  completion?: {
    badges?: {
      completion?: boolean;
      excellence?: boolean;
    };
  };
}

export function CourseCard({
  id,
  title,
  description,
  status,
  gemCost,
  levelRequired,
  rankRequired,
  gradient,
  onUnlock,
  lastAccessedChapterId,
  completion
}: CourseCardProps) {
  const { theme } = useTheme();
  const router = useRouter();


  const getStatusBadge = () => {
    const badges = {
      active: 
      {
        text: '受講中',
  color: 'bg-gradient-to-r from-green-700 via-green-600 to-green-700 animate-shimmer text-green-100 shadow-lg border border-green-500/50'
      }
      ,
      unlocked: { 
        text: '解放済み', 
        color: 'bg-green-500' 
      },
      available: { 
        text: 'ジェム解放可能', 
        color: 'bg-yellow-500' 
      },
      level_locked: { 
        text: 'レベル制限', 
        color: 'bg-purple-500' 
      },
      rank_locked: { 
        text: `${rankRequired}限定`, 
        color: 'bg-red-500' 
      },
      complex: { 
        text: '特別コース', 
        color: 'bg-amber-500' 
      },
      completed: { 
        text: '修了済み', 
        color: 'bg-blue-500' 
      },
      perfect: { 
        text: 'Perfect', 
        color: 'bg-gradient-to-r from-purple-500 to-pink-500' 
      },
      failed: { 
        text: '再受講可能', 
        color: 'bg-gray-500' 
      }
    };
    const badge = badges[status];
    return (<span className={`absolute top-2 right-2 ${badge.color} text-xs px-2 py-1 rounded-full
        ${status === 'perfect' ? 'animate-pulse' : ''}`}>
        {badge.text}
      </span>
    );
  };
  const getGradientStyle = () => {
    if (status === 'perfect') {
      return 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient';
    }
    if (status === 'completed' || status === 'failed') {
      return `${gradient} grayscale-[50%]`;
    }
    return gradient;
  };
// frontend/src/app/user/shop/CourseCard.tsx// CourseCard.tsx内のhandleUnlock関数を以下のように修正
const handleUnlock = async () => {
  if (status === 'active') {
    try {
      console.log('Fetching current course:', id);
      // getCurrentChapterを使用して直接次のチャプターを取得
      const currentChapterResponse = await courseApi.getCurrentChapter(id);
      
      if (currentChapterResponse.success && currentChapterResponse.data) {
        const chapter = currentChapterResponse.data;
        console.log('Navigating to chapter:', chapter);
        
        // チャプターページに遷移
        router.push(`/user/courses/${id}/chapters/${chapter.id}`);
      } else {
        toast.error('利用可能なチャプターが見つかりませんでした');
        router.push('/user/courses');
      }
    } catch (error) {
      console.error('Error in handleUnlock:', error);
      toast.error('チャプター情報の取得に失敗しました');
      router.push('/user/courses');
    }
  } else {
    onUnlock();
  }
};
  
  const getButtonLabel = () => {
    switch (status) {
      case 'active':
        return '学習を続ける';
      case 'unlocked':
        return '受講開始';
      case 'available':
        return 'ジェムで解放';
      case 'completed':
      case 'perfect':
        return '再受講';
      case 'failed':
        return '再チャレンジ';
      case 'level_locked':
        return `レベル${levelRequired}で解放`;
      default:
        return `${rankRequired}にアップグレード`;
    }
  };

  const getButtonStyle = () => {
    if (status === 'active') {
      return theme === 'dark'
        ? 'bg-blue-600 hover:bg-blue-700 text-white'
        : 'bg-blue-500 hover:bg-blue-600 text-white';
    }
    if (status === 'unlocked') {
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
    if (status === 'available') {
      return theme === 'dark'
        ? 'bg-gray-700 hover:bg-gray-600 text-white'
        : 'bg-[#DBEAFE] hover:bg-[#3B82F6] hover:text-white text-[#3B82F6]';
    }
    if (status === 'completed' || status === 'perfect' || status === 'failed') {
      return 'bg-green-600 hover:bg-green-700 text-white';
    }
    return theme === 'dark'
      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
      : 'bg-gray-100 text-gray-400 cursor-not-allowed';
  };

  const getCost = () => {
    if (status === 'completed' || status === 'perfect' || status === 'failed') {
      return Math.floor((gemCost || 0) / 10);
    }
    return gemCost;
  };

  return (
    <div className={`relative ${
      theme === 'dark' 
        ? 'bg-gray-800' 
        : 'bg-white border border-[#DBEAFE] shadow-sm'
    } rounded-lg overflow-hidden ${
      !['unlocked', 'available', 'completed', 'perfect', 'failed', 'active'].includes(status) ? 'opacity-75' : ''
    }`}>
      <div className={`h-40 ${getGradientStyle()} relative`}>
        {getStatusBadge()}
        {completion?.badges && (
          <div className="absolute bottom-2 left-2 flex space-x-2">
            {completion.badges.completion && (
              <span className={`text-2xl ${!completion.badges.excellence ? 'grayscale-[50%]' : ''}`}>
                🏆
              </span>
            )}
            {completion.badges.excellence && (
              <span className="text-2xl animate-bounce">⭐️</span>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className={`font-bold text-lg mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
        }`}>
          {title}
        </h3>
        <p className={`text-sm mb-4 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {description}
        </p>
        {(getCost() || levelRequired || rankRequired) && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              {levelRequired && (
                <>
                  <span className={theme === 'dark' ? 'text-blue-400' : 'text-[#3B82F6]'}>
                    Lv.{levelRequired}
                  </span>
                  {rankRequired && (
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      かつ
                    </span>
                  )}
                </>
              )}
              {rankRequired && (
                <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>
                  {rankRequired}階級
                </span>
              )}
            </div>
            {getCost() && (
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">💎</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'}>
                  {getCost()}
                </span>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleUnlock}
          className={`w-full py-2 rounded-lg ${getButtonStyle()}`}
          disabled={!['unlocked', 'available', 'completed', 'perfect', 'failed', 'active'].includes(status)}
        >
          {getButtonLabel()}
        </button>
      </div>
    </div>
  );
}
// frontend/src/app/shop/CourseCard.tsx
'use client';
import React from 'react';
import { useTheme } from '@/contexts/theme';
import { CourseStatus } from '@/types/course';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { courseApi } from '@/lib/api/courses';
import { TimeRemaining } from '@/app/user/courses/components/TimeRemaining';

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
  archiveUntil?: string;
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
  archiveUntil,
  completion
}: CourseCardProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const badges: Record<CourseStatus, { text: string; color: string }> = {
    active: {
      text: '受講中',
      color: 'bg-gradient-to-r from-green-700 via-green-600 to-green-700 animate-shimmer text-green-100 shadow-lg border border-green-500/50'
    },
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
      text: '条件あり', 
      color: 'bg-orange-500' 
    },
    perfect: { 
      text: 'Perfect',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse'
    },
    completed_archive: { 
      text: '復習期間中', 
      color: 'bg-blue-500' 
    },
    repurchasable: { 
      text: '再購入可能', 
      color: 'bg-gray-500' 
    }
  };

  const getStatusBadge = () => {
    const badge = badges[status];
    return (
      <span className={`absolute top-2 right-2 ${badge.color} text-xs px-2 py-1 rounded-full
        ${status === 'perfect' ? 'animate-pulse' : ''}`}>
        {badge.text}
      </span>
    );
  };

  const getGradientStyle = () => {
    if (status === 'perfect') {
      return 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient';
    }
    if (status === 'completed_archive' || status === 'repurchasable') {
      return `${gradient} grayscale-[50%]`;
    }
    return gradient;
  };
  const handleUnlock = async () => {
    switch (status) {
      case 'active':
      case 'perfect':
      case 'completed_archive':
        try {
          const currentChapterResponse = await courseApi.getCurrentChapter(id);
          if (currentChapterResponse.success && currentChapterResponse.data) {
            router.push(`/user/courses/${id}/chapters/${currentChapterResponse.data.id}`);
          }
        } catch (error) {
          console.error('Error accessing course:', error);
          toast.error('コースへのアクセスに失敗しました');
        }
        break;
      case 'repurchasable':
        try {
          const result = await courseApi.repurchaseCourse(id);
          if (result.success) {
            toast.success('コースを再購入しました！');
            onUnlock();
          }
        } catch (error) {
          console.error('Error repurchasing course:', error);
          toast.error('コースの再購入に失敗しました');
        }
        break;
      default:
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
      case 'perfect':
        return 'コースを見る';
      case 'completed_archive':
        return '復習する';
      case 'repurchasable':
        return '再購入する';
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
    if (status === 'perfect') {
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90';
    }
    if (status === 'completed_archive') {
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
    if (status === 'repurchasable') {
      return theme === 'dark'
        ? 'bg-gray-600 hover:bg-gray-500 text-white'
        : 'bg-gray-500 hover:bg-gray-600 text-white';
    }
    if (status === 'unlocked') {
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
    if (status === 'available') {
      return theme === 'dark'
        ? 'bg-gray-700 hover:bg-gray-600 text-white'
        : 'bg-[#DBEAFE] hover:bg-[#3B82F6] hover:text-white text-[#3B82F6]';
    }
    return theme === 'dark'
      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
      : 'bg-gray-100 text-gray-400 cursor-not-allowed';
  };
  const getCost = () => {
    if (status === 'repurchasable') {
      return Math.floor((gemCost || 0) / 10);
    }
    return gemCost;
  };


const handleArchiveExpire = async () => {
  try {
    const response = await courseApi.expireArchiveAccess(id);
    
    if (!response.success) {
      toast('アーカイブの期限切れ処理に失敗しました', {
        icon: '❌',
        duration: 3000,
      });
      return;
    }

    // 成功時の処理
    toast('アーカイブ期間が終了しました', {
      icon: 'ℹ️',
      duration: 3000,
    });
    
    // コールバック実行
    await onUnlock();

  } catch (error) {
    console.error('Error expiring archive access:', error);
    toast('エラーが発生しました', {
      icon: '❌',
      duration: 3000,
    });
  }
};



  return (
    <div className={`relative ${
      theme === 'dark' 
        ? 'bg-gray-800' 
        : 'bg-white border border-[#DBEAFE] shadow-sm'
    } rounded-lg overflow-hidden ${
      !['unlocked', 'available', 'completed_archive', 'perfect', 'repurchasable', 'active'].includes(status) ? 'opacity-75' : ''
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
        {status === 'completed_archive' && archiveUntil && (
          <div className="mb-4">
            <TimeRemaining
              startTime={new Date()}
              timeLimit={Math.floor((new Date(archiveUntil).getTime() - new Date().getTime()) / 1000)}
              type="archive"
              onTimeout={handleArchiveExpire}
            />
          </div>
        )}
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
          disabled={!['unlocked', 'available', 'completed_archive', 'perfect', 'repurchasable', 'active'].includes(status)}
        >
          {getButtonLabel()}
        </button>
      </div>
    </div>
  );
}
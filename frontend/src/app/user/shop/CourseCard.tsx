'use client';
import React from 'react';
import { useTheme } from '@/contexts/theme';
import { CourseStatus } from '@/types/course';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { courseApi } from '@/lib/api/courses';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  levelRequired?: number;
  rankRequired?: string;
  gradient: string;
  thumbnail?: string;
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
  levelRequired,
  rankRequired,
  thumbnail,
  gradient,
  onUnlock,
  lastAccessedChapterId,
  completion
}: CourseCardProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const badges: Record<CourseStatus, { text: string; color: string }> = {
    restricted: {
      text: '条件未達成',
      color: 'bg-gray-500'
    },
    available: {
      text: '受講可能',
      color: 'bg-blue-500'
    },
    active: {
      text: '受講中',
      color: 'bg-gradient-to-r from-green-700 via-green-600 to-green-700 animate-shimmer text-green-100 shadow-lg border border-green-500/50'
    },
    completed: {
      text: 'クリア',
      color: 'bg-green-500'
    },
    certified: {
      text: '認定',
      color: 'bg-yellow-500'
    },
    perfect: {
      text: 'Perfect',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse'
    },
    failed: {
      text: '失敗',
      color: 'bg-red-500'
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

  const renderThumbnailOrGradient = () => {
    if (thumbnail) {
      return (
        <div className="relative h-40 w-full">
          <img
            src={thumbnail}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-lg" />
        </div>
      );
    }
    return (
      <div className={`h-40 ${getGradientStyle()} relative`} />
    );
  };

  const getGradientStyle = () => {
    if (status === 'perfect') {
      return 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient';
    }
    if (['completed', 'certified'].includes(status)) {
      return `${gradient} opacity-90`;
    }
    return gradient;
  };

  const handleUnlock = async () => {
    try {
      switch (status) {
        case 'active':
        case 'perfect':
        case 'completed':
        case 'certified':
          const response = await courseApi.getCurrentChapter(id);
          if (response.success && response.data) {
            router.push(`/user/courses/${id}/chapters/${response.data.chapterId}`);
          }
          break;
        
        case 'failed':
        case 'available':
          onUnlock();
          break;

        default:
          // restricted の場合は何もしない
          break;
      }
    } catch (error) {
      console.error('Error in handleUnlock:', error);
      toast.error('コースへのアクセスに失敗しました');
    }
  };

  const getButtonLabel = () => {
    switch (status) {
      case 'active':
        return '学習を続ける';
      case 'available':
        return '受講開始';
      case 'completed':
        return 'もう一度見る';
      case 'certified':
        return '復習する';
      case 'perfect':
        return 'コースを見る';
      case 'failed':
        return '再受講';
      case 'restricted':
        return `${levelRequired ? `Lv${levelRequired}` : ''} ${rankRequired || ''}で解放`;
      default:
        return '受講不可';
    }
  };

  const getButtonStyle = () => {
    if (!['active', 'available', 'completed', 'certified', 'perfect', 'failed'].includes(status)) {
      return theme === 'dark'
        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
        : 'bg-gray-100 text-gray-400 cursor-not-allowed';
    }

    switch (status) {
      case 'active':
        return theme === 'dark'
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'perfect':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90';
      case 'certified':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'completed':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'failed':
        return theme === 'dark'
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return theme === 'dark'
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  return (
    <div className={`relative ${
      theme === 'dark' 
        ? 'bg-gray-800' 
        : 'bg-white border border-[#DBEAFE] shadow-sm'
    } rounded-lg overflow-hidden ${
      status === 'restricted' ? 'opacity-75' : ''
    }`}>
      <div className={`h-40 ${getGradientStyle()} relative`}>
        {renderThumbnailOrGradient()}
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
        {(levelRequired || rankRequired) && (
          <div className="flex items-center space-x-2 mb-4">
            {levelRequired && (
              <span className={theme === 'dark' ? 'text-blue-400' : 'text-[#3B82F6]'}>
                Lv.{levelRequired}
              </span>
            )}
            {levelRequired && rankRequired && (
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                かつ
              </span>
            )}
            {rankRequired && (
              <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>
                {rankRequired}階級
              </span>
            )}
          </div>
        )}
        <button
          onClick={handleUnlock}
          className={`w-full py-2 rounded-lg ${getButtonStyle()}`}
          disabled={status === 'restricted'}
        >
          {getButtonLabel()}
        </button>
      </div>
    </div>
  );
}
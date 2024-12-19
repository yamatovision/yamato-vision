'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface CourseCardProps {
  title: string;
  description: string;
  status: 'unlocked' | 'available' | 'level_locked' | 'rank_locked' | 'complex';
  gemCost?: number;
  levelRequired?: number;
  rankRequired?: string;
  gradient: string;
  onUnlock: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  title,
  description,
  status,
  gemCost,
  levelRequired,
  rankRequired,
  gradient,
  onUnlock,
}) => {
  const { theme } = useTheme();

  const getStatusBadge = () => {
    const badges = {
      unlocked: { text: '解放済み', color: 'bg-green-500' },
      available: { text: 'ジェム解放可能', color: 'bg-yellow-500' },
      level_locked: { text: 'レベル制限', color: 'bg-purple-500' },
      rank_locked: { text: `${rankRequired}限定`, color: 'bg-red-500' },
      complex: { text: '特別コース', color: 'bg-green-500' },
    };
    const badge = badges[status];
    return (
      <span className={`absolute top-2 right-2 ${badge.color} text-xs px-2 py-1 rounded-full`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className={`${
      theme === 'dark' 
        ? 'bg-gray-800' 
        : 'bg-white border border-[#DBEAFE] shadow-sm'
    } rounded-lg overflow-hidden ${
      status !== 'unlocked' && status !== 'available' ? 'opacity-75' : ''
    }`}>
      <div className={`h-40 ${gradient} relative`}>
        {getStatusBadge()}
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
        {(gemCost || levelRequired || rankRequired) && (
          <div className="flex justify-between items-center mb-4">
            {levelRequired && (
              <div className="flex items-center space-x-2">
                <span className={theme === 'dark' ? 'text-blue-400' : 'text-[#3B82F6]'}>
                  Lv.{levelRequired}
                </span>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  必要
                </span>
              </div>
            )}
            {gemCost && (
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">💎</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'}>
                  {gemCost}
                </span>
              </div>
            )}
            {rankRequired && (
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                または {rankRequired}階級
              </span>
            )}
          </div>
        )}
        <button
          onClick={onUnlock}
          className={`w-full py-2 rounded-lg ${
            status === 'unlocked'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : status === 'available'
              ? theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-[#DBEAFE] hover:bg-[#3B82F6] hover:text-white text-[#3B82F6]'
              : theme === 'dark'
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {status === 'unlocked' ? '受講開始'
            : status === 'available' ? 'ジェムで解放'
            : levelRequired ? `レベル${levelRequired}で解放`
            : `${rankRequired}にアップグレード`}
        </button>
      </div>
    </div>
  );
};

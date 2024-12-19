'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { CourseCard } from '@/components/shop/CourseCard';

const mockCourses = [
  {
    id: '1',
    title: 'AIプロンプト基礎マスター',
    description: '効果的なプロンプトエンジニアリングの基礎を学ぶ',
    status: 'unlocked' as const,
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600',
  },
  {
    id: '2',
    title: 'AI開発実践コース',
    description: '実践的なAI開発手法を習得する',
    status: 'available' as const,
    gemCost: 500,
    rankRequired: 'Gold',
    gradient: 'bg-gradient-to-r from-yellow-600 to-orange-600',
  },
  {
    id: '3',
    title: 'AI最適化マスター',
    description: '高度なAI最適化テクニックを学ぶ',
    status: 'level_locked' as const,
    gemCost: 1000,
    levelRequired: 30,
    gradient: 'bg-gradient-to-r from-purple-600 to-pink-600',
  },
  {
    id: '4',
    title: 'エンタープライズAI戦略',
    description: '企業向けAI戦略の策定と実装を学ぶ',
    status: 'rank_locked' as const,
    rankRequired: 'Platinum',
    gradient: 'bg-gradient-to-r from-red-600 to-orange-600',
  },
  {
    id: '5',
    title: 'AIイノベーター育成',
    description: '次世代のAI開発リーダーを目指す',
    status: 'complex' as const,
    gemCost: 2000,
    levelRequired: 40,
    rankRequired: 'Platinum',
    gradient: 'bg-gradient-to-r from-green-600 to-blue-600',
  },
];

export default function ShopPage() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<'all' | 'available' | 'new'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className={`max-w-6xl mx-auto p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#F8FAFC]'}`}>
      {/* ユーザーステータス */}
      <div className={theme === 'dark' ? 'bg-gray-800 rounded-lg p-4 mb-6' : 'bg-white rounded-lg p-4 mb-6 border border-[#DBEAFE] shadow-sm'}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>現在の階級：</span>
              <span className={theme === 'dark' ? 'text-purple-400 font-bold' : 'text-[#1E40AF] font-bold'}>Gold</span>
            </div>
            <div className="text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>レベル：</span>
              <span className={theme === 'dark' ? 'text-blue-400 font-bold' : 'text-[#3B82F6] font-bold'}>25</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400 text-xl">💎</span>
              <span className={theme === 'dark' ? 'font-bold text-white' : 'font-bold text-[#1E40AF]'}>1,250</span>
              <span className={theme === 'dark' ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>ジェム</span>
            </div>
          </div>
        </div>
      </div>

      {/* フィルターと検索 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' 
                ? theme === 'dark' ? 'bg-blue-600' : 'bg-[#3B82F6] text-white'
                : theme === 'dark' ? 'bg-gray-700' : 'bg-white border border-[#DBEAFE] text-[#3B82F6]'
            }`}
            onClick={() => setFilter('all')}
          >
            すべて
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${
              filter === 'available' 
                ? theme === 'dark' ? 'bg-blue-600' : 'bg-[#3B82F6] text-white'
                : theme === 'dark' ? 'bg-gray-700' : 'bg-white border border-[#DBEAFE] text-[#3B82F6]'
            }`}
            onClick={() => setFilter('available')}
          >
            解放可能
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${
              filter === 'new' 
                ? theme === 'dark' ? 'bg-blue-600' : 'bg-[#3B82F6] text-white'
                : theme === 'dark' ? 'bg-gray-700' : 'bg-white border border-[#DBEAFE] text-[#3B82F6]'
            }`}
            onClick={() => setFilter('new')}
          >
            新着
          </button>
        </div>
        <div className="relative">
          <input 
            type="search"
            placeholder="コースを検索..."
            className={`rounded-lg px-4 py-2 w-64 ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white' 
                : 'bg-white border border-[#DBEAFE] text-[#1E40AF]'
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* コースグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map((course) => (
          <CourseCard
            key={course.id}
            title={course.title}
            description={course.description}
            status={course.status}
            gemCost={course.gemCost}
            levelRequired={course.levelRequired}
            rankRequired={course.rankRequired}
            gradient={course.gradient}
            onUnlock={() => console.log('Unlocking course:', course.id)}
          />
        ))}
      </div>

      {/* ページネーション */}
      <div className="flex justify-center mt-8">
        <div className="flex space-x-2">
          <button className={`px-4 py-2 rounded-lg ${
            theme === 'dark' 
              ? 'bg-gray-700' 
              : 'bg-white border border-[#DBEAFE] text-[#3B82F6]'
          }`}>
            前へ
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
          <button className={`px-4 py-2 rounded-lg ${
            theme === 'dark' 
              ? 'bg-gray-700' 
              : 'bg-white border border-[#DBEAFE] text-[#3B82F6]'
          }`}>
            2
          </button>
          <button className={`px-4 py-2 rounded-lg ${
            theme === 'dark' 
              ? 'bg-gray-700' 
              : 'bg-white border border-[#DBEAFE] text-[#3B82F6]'
          }`}>
            3
          </button>
          <button className={`px-4 py-2 rounded-lg ${
            theme === 'dark' 
              ? 'bg-gray-700' 
              : 'bg-white border border-[#DBEAFE] text-[#3B82F6]'
          }`}>
            次へ
          </button>
        </div>
      </div>
    </div>
  );
}
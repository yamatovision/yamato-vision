'use client';

import { useState } from 'react';

type Badge = {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  conditions: {
    type: 'achievement' | 'level' | 'course' | 'likes';
    value: number;
    description: string;
  }[];
  createdAt: string;
  isActive: boolean;
};

export function BadgeList() {
  // ダミーデータ
  const badges: Badge[] = [
    {
      id: "1",
      name: "初心者バッジ",
      description: "最初のコースを完了した証",
      iconUrl: "/badges/beginner.svg",
      conditions: [
        {
          type: 'course',
          value: 1,
          description: '1つのコースを完了する'
        }
      ],
      createdAt: "2024-01-01",
      isActive: true
    },
    {
      id: "2",
      name: "継続の達人",
      description: "7日連続でログインした証",
      iconUrl: "/badges/continuous.svg",
      conditions: [
        {
          type: 'achievement',
          value: 7,
          description: '7日連続ログイン'
        }
      ],
      createdAt: "2024-01-01",
      isActive: true
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider">
              バッジ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider">
              説明
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider">
              獲得条件
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider">
              ステータス
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-[#707F8C] uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {badges.map((badge) => (
            <tr key={badge.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <img className="h-10 w-10 rounded-full" src={badge.iconUrl} alt={badge.name} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-[#2C3E50]">{badge.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-[#2C3E50]">{badge.description}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-[#2C3E50]">
                  {badge.conditions.map((condition, index) => (
                    <div key={index}>{condition.description}</div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  badge.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {badge.isActive ? '有効' : '無効'}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm space-x-2">
                <a 
                  href={`/admin/badges/${badge.id}`}
                  className="text-[#4A90E2] hover:text-[#357ABD]"
                >
                  編集
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ページネーション */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div className="text-sm text-[#707F8C]">
          全{badges.length}件を表示
        </div>
        <div className="space-x-2">
          <button className="px-3 py-1 border rounded text-sm disabled:opacity-50">
            前へ
          </button>
          <button className="px-3 py-1 border rounded text-sm disabled:opacity-50">
            次へ
          </button>
        </div>
      </div>
    </div>
  );
}

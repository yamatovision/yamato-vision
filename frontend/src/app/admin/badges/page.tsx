'use client';

import { BadgeList } from './BadgeList';

export default function BadgesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#2C3E50]">バッジ管理</h2>
        <a 
          href="/admin/badges/new"
          className="px-4 py-2 bg-[#4A90E2] text-white rounded-md hover:bg-[#357ABD]"
        >
          新規作成
        </a>
      </div>
      <BadgeList />
    </div>
  );
}

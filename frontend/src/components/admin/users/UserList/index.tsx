'use client';
import { useState } from 'react';
import { UserItem } from "./UserItem";
import { UserSearch } from "./UserSearch";

export function UserList() {
  const [searchParams, setSearchParams] = useState({
    query: '',
    searchBy: 'name' as 'name' | 'email'
  });

  const users = [
    {
      id: "1",
      name: "山田太郎",
      email: "yamada@example.com",
      rank: "初級",
      gems: 1000,
      badges: ["初心者", "継続王"],
      registeredAt: "2024-01-01",
      lastLoginAt: "2024-01-15"
    },
    // 他のダミーデータ
  ];

  return (
    <div className="space-y-4">
      <UserSearch
        value={searchParams}
        onChange={setSearchParams}
      />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider">
                ユーザー名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider">
                メールアドレス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider">
                階級
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider">
                ジェム
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider">
                バッジ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#707F8C] uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <UserItem key={user.id} user={user} />
            ))}
          </tbody>
        </table>

        {/* ページネーション */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-[#707F8C]">
            全50件中 1-50件を表示
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
    </div>
  );
}

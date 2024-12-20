'use client';

import { useState, useEffect } from 'react';
import { AdminUser } from '@/types/admin';
import { UserActions } from './UserActions';
import { UserSearch } from './UserSearch';

interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

export function UserList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    query: '',
    searchBy: 'name' as 'name' | 'email'
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'createdAt',
    order: 'desc'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, searchParams, sortConfig]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users?page=${page}&search=${searchParams.query}&searchBy=${searchParams.searchBy}&sortBy=${sortConfig.field}&order=${sortConfig.order}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSearch = (params: typeof searchParams) => {
    setSearchParams(params);
    setPage(1);
  };

  const handleUserUpdate = () => {
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A90E2]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UserSearch value={searchParams} onChange={handleSearch} />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th onClick={() => handleSort('name')} className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider cursor-pointer">
                ユーザー名
              </th>
              <th onClick={() => handleSort('email')} className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider cursor-pointer">
                メールアドレス
              </th>
              <th onClick={() => handleSort('rank')} className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider cursor-pointer">
                階級
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider">
                ジェム
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider">
                バッジ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#707F8C] uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'PENALTY' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.rank}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.gems} 💎
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex -space-x-2">
                    {user.badges.slice(0, 3).map((badge) => (
                      <img
                        key={badge.id}
                        src={badge.iconUrl}
                        alt={badge.title}
                        className="w-8 h-8 rounded-full border-2 border-white"
                      />
                    ))}
                    {user.badges.length > 3 && (
                      <span className="ml-2 text-sm text-gray-500">
                        +{user.badges.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <UserActions
                    userId={user.id}
                    currentStatus={user.status}
                    onUpdate={handleUserUpdate}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ページネーション */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              前へ
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              次へ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

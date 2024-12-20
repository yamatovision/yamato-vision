'use client';

import { useState, useEffect } from 'react';
import { AdminUser, PaginationData } from '@/types/admin.types';
import { UserItem } from "./UserItem";
import { UserSearch } from "./UserSearch";
import { Pagination } from "../../shared/Pagination";
import { useToast } from '@/hooks/useToast';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

export function UserList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [searchParams, setSearchParams] = useState({
    query: '',
    searchBy: 'name' as 'name' | 'email'
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'createdAt',
    order: 'desc'
  });

  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchParams.query,
        searchBy: searchParams.searchBy,
        sortBy: sortConfig.field,
        order: sortConfig.order
      });

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.USERS}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      showToast('ユーザー情報の取得に失敗しました', 'error');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, searchParams, sortConfig]);

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSearch = (params: typeof searchParams) => {
    setSearchParams(params);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleUserUpdate = () => {
    fetchUsers();
    showToast('ユーザー情報を更新しました', 'success');
  };

  return (
    <div className="space-y-4">
      {/* 検索セクション */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <UserSearch
          value={searchParams}
          onChange={handleSearch}
        />
      </div>

      {/* ユーザーリストセクション */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="group px-6 py-3 text-left cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-medium text-[#707F8C] uppercase tracking-wider">
                      ユーザー名
                    </span>
                    <SortIcon field="name" currentSort={sortConfig} />
                  </div>
                </th>
                <th 
                  className="group px-6 py-3 text-left cursor-pointer"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-medium text-[#707F8C] uppercase tracking-wider">
                      メールアドレス
                    </span>
                    <SortIcon field="email" currentSort={sortConfig} />
                  </div>
                </th>
                <th 
                  className="group px-6 py-3 text-left cursor-pointer"
                  onClick={() => handleSort('rank')}
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-medium text-[#707F8C] uppercase tracking-wider">
                      階級
                    </span>
                    <SortIcon field="rank" currentSort={sortConfig} />
                  </div>
                </th>
                <th 
                  className="group px-6 py-3 text-left cursor-pointer"
                  onClick={() => handleSort('gems')}
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-medium text-[#707F8C] uppercase tracking-wider">
                      ジェム
                    </span>
                    <SortIcon field="gems" currentSort={sortConfig} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left">
                  <span className="text-xs font-medium text-[#707F8C] uppercase tracking-wider">
                    バッジ
                  </span>
                </th>
                <th className="px-6 py-3 text-right">
                  <span className="text-xs font-medium text-[#707F8C] uppercase tracking-wider">
                    アクション
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    ユーザーが見つかりませんでした
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserItem 
                    key={user.id} 
                    user={user} 
                    onUpdate={handleUserUpdate}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        {!loading && users.length > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
          />
        )}
      </div>
    </div>
  );
}

function SortIcon({ field, currentSort }: { field: string, currentSort: SortConfig }) {
  if (field !== currentSort.field) {
    return (
      <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" viewBox="0 0 24 24">
        <path fill="currentColor" d="M7 10l5 5 5-5H7z"/>
      </svg>
    );
  }

  return currentSort.order === 'asc' ? (
    <svg className="w-4 h-4 text-[#4A90E2]" viewBox="0 0 24 24">
      <path fill="currentColor" d="M7 14l5-5 5 5H7z"/>
    </svg>
  ) : (
    <svg className="w-4 h-4 text-[#4A90E2]" viewBox="0 0 24 24">
      <path fill="currentColor" d="M7 10l5 5 5-5H7z"/>
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A90E2]"></div>
    </div>
  );
}

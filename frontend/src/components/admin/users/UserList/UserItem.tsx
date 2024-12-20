'use client';

import { useState } from 'react';
import { AdminUser } from '@/types/admin.types';
import { UserActions } from '../UserActions';
import { formatDate } from '@/utils/date';
import { useToast } from '@/hooks/useToast';

interface UserItemProps {
  user: AdminUser;
  onUpdate: () => void;
}

export function UserItem({ user, onUpdate }: UserItemProps) {
  const [showActions, setShowActions] = useState(false);
  const { showToast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'PENALTY':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case '極伝':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case '皆伝':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case '奥伝':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case '中伝':
        return 'bg-green-100 text-green-800 border border-green-200';
      case '初伝':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const handleActionError = (error: string) => {
    showToast(error, 'error');
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            {user.mongoInfo && (
              <div className="text-xs text-gray-500 mt-1">
                登録日: {formatDate(user.mongoInfo.registrationDate)}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.email}</div>
        {user.mongoInfo?.lastLoginDate && (
          <div className="text-xs text-gray-500 mt-1">
            最終ログイン: {formatDate(user.mongoInfo.lastLoginDate)}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-md ${getRankColor(user.rank)}`}>
            {user.rank}
          </span>
          {user.status === 'PENALTY' && (
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-md ${getStatusColor(user.status)}`}>
              ペナルティ中
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 flex items-center">
          <span className="font-medium">{user.gems.toLocaleString()}</span>
          <span className="ml-1 text-yellow-500">💎</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex -space-x-2 hover:space-x-1 transition-all duration-200">
          {user.badges.slice(0, 3).map((badge) => (
            <div
              key={badge.id}
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm transform hover:scale-110 transition-transform duration-200"
              style={{
                backgroundImage: `url(${badge.iconUrl})`,
                backgroundSize: 'cover'
              }}
              title={badge.title}
            />
          ))}
          {user.badges.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-xs font-medium text-gray-600 hover:bg-gray-300 transition-colors duration-200">
              +{user.badges.length - 3}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => setShowActions(true)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          操作
        </button>
        {showActions && (
          <UserActions
            userId={user.id}
            currentStatus={user.status}
            onClose={() => {
              setShowActions(false);
              onUpdate();
            }}
            onError={handleActionError}
          />
        )}
      </td>
    </tr>
  );
}

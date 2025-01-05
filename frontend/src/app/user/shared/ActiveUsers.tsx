// frontend/src/app/user/shared/ActiveUsers.tsx

'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { courseApi } from '@/lib/api/courses';

interface ActiveUsersProps {
  courseId: string;
  maxDisplay?: number;
}

interface ActiveUser {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

export function ActiveUsers({ courseId, maxDisplay = 5 }: ActiveUsersProps) {
  const { theme } = useTheme();
  const [users, setUsers] = useState<ActiveUser[]>([]);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const response = await courseApi.getActiveCourseUsers(courseId);
        if (response.success && response.data?.users) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error('Failed to fetch active users:', error);
      }
    };

    fetchActiveUsers();
  }, [courseId]);

  // アクティブユーザーがいない場合は何も表示しない
  if (users.length === 0) return null;

  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        {users.slice(0, maxDisplay).map((user) => (
          <div
            key={user.id}
            className="relative"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || '受講者'}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  theme === 'dark' ? 'border-gray-700' : 'border-white'
                }`}
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                  transition-transform hover:scale-110
                  ${theme === 'dark' 
                    ? 'border-gray-700 bg-gray-600 text-gray-300' 
                    : 'border-white bg-gray-200 text-gray-600'
                  }`}
              >
                {user.name?.[0] || '?'}
              </div>
            )}
          </div>
        ))}
        {users.length > maxDisplay && (
          <div
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs
              ${theme === 'dark' 
                ? 'border-gray-700 bg-gray-600 text-gray-300' 
                : 'border-white bg-gray-200 text-gray-600'
              }`}
          >
            +{users.length - maxDisplay}
          </div>
        )}
      </div>
      <span className={`text-sm ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        が学習中
      </span>
    </div>
  );
}
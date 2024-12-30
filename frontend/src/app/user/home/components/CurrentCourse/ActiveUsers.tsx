'use client';

import { useTheme } from '@/contexts/theme';

interface ActiveUsersProps {
  users: Array<{
    id: string;
    name?: string;
    avatarUrl?: string;
  }>;
  totalCount: number;
}

export function ActiveUsers({ users, totalCount }: ActiveUsersProps) {
  const { theme } = useTheme();
  const MAX_DISPLAY_AVATARS = 3;
  const MIN_USERS_TO_DISPLAY = 1;

  // 3人未満の場合は何も表示しない
  if (totalCount < MIN_USERS_TO_DISPLAY) {
    return null;
  }

  return (
    <div className={`border-t ${
      theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
    } pt-4`}>
      <div className="flex justify-between items-center">
        <div className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          コース受講者 {totalCount}人が学習中
        </div>
        <div className="flex -space-x-2">
          {users.slice(0, MAX_DISPLAY_AVATARS).map((user, index) => (
            <div
              key={user.id}
              className="relative"
              style={{ zIndex: MAX_DISPLAY_AVATARS - index }}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || '受講者'}
                  className={`w-8 h-8 rounded-full border-2 ${
                    theme === 'dark' ? 'border-gray-700' : 'border-white'
                  }`}
                />
              ) : (
                <div className={`w-8 h-8 rounded-full border-2 ${
                  theme === 'dark' 
                    ? 'border-gray-700 bg-gray-600' 
                    : 'border-white bg-gray-200'
                  } flex items-center justify-center text-xs ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                  {user.name ? user.name[0] : '?'}
                </div>
              )}
            </div>
          ))}
          
          {totalCount > MAX_DISPLAY_AVATARS && (
            <div className={`w-8 h-8 rounded-full border-2 ${
              theme === 'dark' 
                ? 'border-gray-700 bg-gray-600' 
                : 'border-white bg-gray-200'
              } flex items-center justify-center text-xs ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
              +{totalCount - MAX_DISPLAY_AVATARS}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { ProfileEditModal } from './ProfileEditModal';
import { useProfile } from '@/lib/hooks/useProfile';
import { getRankStyle } from '@/lib/utils/rankStyles';

export function HomeProfile() {
  const { theme } = useTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { userData, loading, error, updateProfile, updateAvatar } = useProfile();
  
  const rankStyle = getRankStyle(userData?.rank || 'お試し', theme);

  const handleProfileClick = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (data: any) => {
    try {
      await updateProfile(data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAvatarUpdate = async (avatarUrl: string) => {
    try {
      await updateAvatar(avatarUrl);
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const levelProgress = ((userData?.experience || 0) % 1000) / 10;
  const tokenProgress = Math.min(((userData?.unprocessedTokens || 0) / 10000) * 100, 100);
    
  return (
    <>
      <div 
        className={`${rankStyle.container} rounded-2xl p-6 cursor-pointer hover:opacity-95 transition-all duration-300`}
        onClick={handleProfileClick}
      >
        <div className="flex flex-col">
          {/* Top Row */}
          <div className="flex items-center">
            {/* Avatar and Rank */}
            <div className="relative flex-shrink-0">
              <div className={`w-24 h-24 rounded-full overflow-hidden ${rankStyle.avatarBorder} bg-white`}>
                <img 
                  src={userData?.avatarUrl || "/api/placeholder/96/96"} 
                  alt="アバター" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className={`absolute -bottom-2 -right-2 ${rankStyle.rankBadge} px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1 border border-white dark:border-gray-800`}>
                <span className="text-xs">階級</span>
                <span>{userData?.rank}</span>
              </div>
            </div>

            {/* User Info and Top Metrics */}
            <div className="flex flex-col min-w-0 flex-1 ml-6">
              <div className="flex items-center justify-between">
                {/* Username and Tokens */}
                <div className="flex items-center space-x-4 flex-1">
                  <h1 className={`text-2xl font-bold ${rankStyle.nameText} truncate max-w-[200px]`}>
                    {userData?.nickname || userData?.name || '名無しさん'}
                  </h1>
                  <div className="flex items-center">
                    <span className={`text-base ${rankStyle.levelText}`}>
                      {(userData?.unprocessedTokens || 0).toLocaleString()}
                    </span>
                    <div className="ml-2 w-16 h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                      <div 
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{width: `${tokenProgress}%`}}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Metrics Row */}
              <div className="flex items-center space-x-8 mt-4">
                {/* Level */}
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {userData?.level || 1}
                    </span>
                  </div>
                  <div className="w-16 h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                    <div 
                      className="h-full rounded-full bg-blue-500 transition-all duration-300"
                      style={{width: `${levelProgress}%`}}
                    />
                  </div>
                </div>

                {/* Gem */}
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 text-lg">💎</span>
                  <span className={`text-base ${rankStyle.gemText}`}>
                    {userData?.gems?.toLocaleString() || 0}
                  </span>
                </div>

                {/* Badge */}
                <span className={`text-sm ${rankStyle.linkText}`}>
                  バッジ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={{
          nickname: userData?.nickname || '',
          avatarUrl: userData?.avatarUrl || '',
          message: userData?.message || ''
        }}
        onSave={handleSaveProfile}
        onAvatarUpdate={handleAvatarUpdate}
      />
    </>
  );
}
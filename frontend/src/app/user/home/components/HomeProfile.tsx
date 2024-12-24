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

  const currentExp = userData?.experience || 0;
  const expToNextLevel = 1000;
  const currentLevelExp = currentExp % expToNextLevel;
  const remainingExp = expToNextLevel - currentLevelExp;
  const levelProgress = (currentLevelExp / expToNextLevel) * 100;
  const weeklyTokens = userData?.tokens?.weeklyTokens || 0;
  const weeklyLimit = userData?.tokens?.weeklyLimit || 0;
  const purchasedTokens = userData?.tokens?.purchasedTokens || 0;
  
  const consumedPercentage = weeklyLimit > 0 
    ? Math.min((weeklyTokens / weeklyLimit) * 100, 100)
    : 0;

  return (
    <>
      <div className={`${rankStyle.container} rounded-2xl p-6 cursor-pointer hover:opacity-95 transition-all duration-300`}
        onClick={handleProfileClick}
      >
        <div className="flex">
          {/* 左カラム: アバター、階級バッジ */}
          <div className="flex flex-col items-center w-24">
            <div className="relative mb-4">
              <div className={`w-24 h-24 rounded-full overflow-hidden ${rankStyle.avatarBorder} bg-white`}>
                {userData?.avatarUrl && (
                  <img 
                    src={userData.avatarUrl} 
                    alt="アバター" 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
            </div>
            {/* 階級バッジ */}
            <div className={`mb-3 ${rankStyle.rankBadge} px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1 border border-white dark:border-gray-800`}>
              <span className="text-xs">階級</span>
              <span>{userData?.rank}</span>
            </div>
          </div>

          {/* 右カラム: ユーザー情報 */}
          <div className="flex-grow pl-6">
            {/* 上段: 名前とレベル */}
            <div className="flex items-start mb-4">
              <div className="flex items-center w-full space-x-4">
                <div className="min-w-0 flex-shrink">
                  <h1 className={`text-2xl font-bold ${rankStyle.nameText} truncate`}>
                    {userData?.nickname || userData?.name || '名無しさん'}
                  </h1>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {userData?.level || 1}
                    </span>
                  </div>
                  <div className="w-32 h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                    <div 
                      className="h-full rounded-full bg-blue-500 transition-all duration-300"
                      style={{width: `${levelProgress}%`}}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 中段: トークンゲージ */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className={rankStyle.tokenText}>トークン残高</span>
                <span className={`${rankStyle.tokenText} font-medium`}>
                  {(weeklyLimit - weeklyTokens).toLocaleString()} / {weeklyLimit.toLocaleString()}
                </span>
              </div>
              <div className={`relative h-3 rounded-full overflow-hidden ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
              }`}>
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                  }`}
                  style={{ width: `${consumedPercentage}%` }}
                />
              </div>
            </div>

            {/* 下段: バッジとジェム */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400 text-lg">💎</span>
                <span className={`text-base ${rankStyle.gemText}`}>
                  {userData?.gems?.toLocaleString() || 0}
                </span>
              </div>
              <div className={`flex-grow ml-6 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
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
          message: userData?.message || '',
          snsLinks: userData?.snsLinks || {}
        }}
        onSave={handleSaveProfile}
        onAvatarUpdate={handleAvatarUpdate}
      />
    </>
  );
}
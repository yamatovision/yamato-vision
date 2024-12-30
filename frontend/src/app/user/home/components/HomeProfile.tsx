'use client';

import { useTheme } from '@/contexts/theme';
import { ProfileEditModal } from './ProfileEditModal';
import { useProfile } from '@/lib/hooks/useProfile';
import { getRankStyle } from '@/lib/utils/rankStyles';
import { useNotification } from '@/contexts/notification';
import { useState, useEffect } from 'react';

export function HomeProfile() {
  const { theme } = useTheme();
  const { showExperienceGain, showLevelUp } = useNotification();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { userData, loading, error, updateProfile, updateAvatar } = useProfile();
  const rankStyle = getRankStyle(userData?.rank || 'お試し', theme);

  // 経験値通知
  useEffect(() => {
    if (userData?.expGained && userData.expGained > 0) {
      showExperienceGain(userData.expGained);
    }
  }, [userData?.expGained, showExperienceGain]);

  // レベルアップ通知
  useEffect(() => {
    if (userData?.levelUpData) {
      showLevelUp({
        oldLevel: userData.levelUpData.oldLevel,
        newLevel: userData.levelUpData.currentLevel,
        message: userData.levelUpData.levelUpMessage || 'レベルアップしました！',
        experienceGained: userData.levelUpData.experienceGained
      });
    }
  }, [userData?.levelUpData, showLevelUp]);



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

  const handleAvatarUpdate = async (base64Image: string) => {
    try {
      await updateAvatar(base64Image);
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  };

  if (loading) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 animate-pulse`}>
        <div className="flex">
          {/* 左カラム: アバター、階級バッジのスケルトン */}
          <div className="flex flex-col items-center w-24">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="w-20 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* 右カラム: ユーザー情報のスケルトン */}
          <div className="flex-grow pl-6">
            {/* 名前とレベルのスケルトン */}

            
            <div className="flex items-start mb-4">
              <div className="flex items-center w-full space-x-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40" />
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="w-32 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            </div>

            {/* トークンゲージのスケルトン */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
              </div>
              <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* バッジとジェムのスケルトン */}
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              <div className="flex-grow ml-6 h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className={`${rankStyle.container} rounded-2xl p-6 relative cursor-pointer hover:opacity-95 transition-all duration-300`}
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
                  
                    <div className="relative w-32">
                      <div className={`h-5 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} overflow-hidden`}>
                        <div 
                          className={`h-full rounded-full ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'} transition-all duration-300`}
                          style={{width: `${levelProgress}%`}}
                        />
                        <span className={`
                          absolute inset-0 
                          flex items-center justify-end pr-2
                          text-xs font-medium
                          ${theme === 'dark' ? 'text-sky-300' : 'text-blue-700'}
                          drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]
                        `}>
                          {currentLevelExp.toLocaleString()} / {expToNextLevel.toLocaleString()} 
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* トークンゲージ */}
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
  
              {/* ジェムとバッジ */}
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
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
  const [previousState, setPreviousState] = useState<{
    experience: number;
    level: number;
  } | null>(null);

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


  /* 成績証明書表示用のハンドラー（将来実装用）
  const handleTranscriptClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: 成績証明書表示処理
    console.log('成績証明書を表示');
  };
  */

  useEffect(() => {
    if (!userData) return;

    const previousStateStr = localStorage.getItem('userStatus');
    const previousState = previousStateStr ? JSON.parse(previousStateStr) : null;

    console.log('Status check:', {
      previous: previousState,
      current: {
        experience: userData.experience,
        level: userData.level
      }
    });

    if (previousState) {
      const expDiff = userData.experience - previousState.experience;
      if (expDiff > 0) {
        console.log('経験値獲得:', {
          expDiff,
          previous: previousState.experience,
          current: userData.experience,
          timestamp: new Date().toISOString()
        });
        showExperienceGain(expDiff);
      }

      if (userData.level > previousState.level) {
        console.log('レベルアップ検知:', {
          from: previousState.level,
          to: userData.level,
          expGained: expDiff,
          timestamp: new Date().toISOString()
        });
        showLevelUp({
          oldLevel: previousState.level,
          newLevel: userData.level,
          message: null,
          experienceGained: expDiff
        });
      }
    }

    localStorage.setItem('userStatus', JSON.stringify({
      experience: userData.experience,
      level: userData.level,
      timestamp: new Date().toISOString()
    }));

  }, [userData, showExperienceGain, showLevelUp]);

  if (loading) {
    return (
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 animate-pulse`}>
        {/* 既存のローディングスケルトン */}
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
  
  const consumedPercentage = weeklyLimit > 0 
    ? Math.min((weeklyTokens / weeklyLimit) * 100, 100)
    : 0;

  return (
    <>
      <div 
        className={`${rankStyle.container} rounded-2xl p-6 relative cursor-pointer hover:opacity-95 transition-all duration-300`}
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
                  {userData?.careerIdentity && (
                    <div className={`
                      mt-1 text-sm 
                      ${rankStyle.tokenText}
                      flex items-center gap-1
                    `}>
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>目標: {userData.careerIdentity}</span>
                    </div>
                  )}
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

            {/* 学業情報（GPA、取得単位、成績証明書） 
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex flex-col">
                    <span className={`text-sm ${rankStyle.tokenText}`}>GPA</span>
                    <span className={`text-xl font-bold ${rankStyle.nameText}`}>
                      {userData?.gpa?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div><div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex flex-col">
                    <span className={`text-sm ${rankStyle.tokenText}`}>取得単位</span>
                    <span className={`text-xl font-bold ${rankStyle.nameText}`}>
                      {userData?.totalCredits || 2} <span className="text-sm">単位</span>
                    </span>
                  </div>
                </div>
              </div>

              <div 
                className={`
                  flex items-center space-x-2 
                  p-4 rounded-lg cursor-pointer
                  hover:opacity-80 transition-opacity
                  ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}
                `}
                onClick={handleTranscriptClick}
              >
                <span className={`text-sm ${rankStyle.linkText}`}>
                  成績証明書
                </span>
                <svg 
                  className={`w-4 h-4 ${rankStyle.linkText}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </div>
            </div>
            */}
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
          snsLinks: userData?.snsLinks || {},
          careerIdentity: userData?.careerIdentity || '',  // 追加
        }}
        onSave={handleSaveProfile}
        onAvatarUpdate={handleAvatarUpdate}
      />
    </>
  );
}
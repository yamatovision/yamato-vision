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
    
  return (
    <>
      <div 
        className={`${rankStyle.container} rounded-2xl p-6 mb-8 cursor-pointer hover:opacity-95 transition-all duration-300`}
        onClick={handleProfileClick}
      >
        <div className="flex justify-between">
          <div className="flex space-x-6">
            {/* アバターと階級 */}
            <div className="relative">
              <div className={`w-24 h-24 rounded-full overflow-hidden ${rankStyle.avatarBorder}`}>
                <img 
                  src={userData?.avatarUrl || "https://placehold.jp/150x150.png"} 
                  alt="アバター" 
                  className="w-full h-full object-cover" 
                />
              </div>
              {/* 階級表示 */}
              <div className={`absolute -bottom-2 -right-2 ${rankStyle.rankBadge} px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1`}>
                <span className="text-xs">階級</span>
                <span>{userData?.rank}</span>
              </div>
            </div>

            {/* ユーザー情報 */}
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${rankStyle.nameText}`}>
                {userData?.nickname || userData?.name || '名無しさん'}
              </h1>
              
              {/* レベルと経験値ゲージ */}
              <div className="mb-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={rankStyle.levelText}>Lv.{userData?.level || 0}</span>
                  <span className={rankStyle.expText}>
                    次のレベルまで: {1000 - (userData?.experience || 0) % 1000} EXP
                  </span>
                </div>
                <div className={`w-48 h-2 ${rankStyle.expBackground} rounded-full`}>
                  <div 
                    className={`h-full ${rankStyle.expBar} rounded-full transition-all duration-300`}
                    style={{width: `${((userData?.experience || 0) % 1000) / 10}%`}}
                  ></div>
                </div>
              </div>

              {/* ジェムとSNSリンク */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400">💎</span>
                  <span className={rankStyle.gemText}>{userData?.gems || 0}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {userData?.snsLinks && Object.entries(userData.snsLinks).map(([type, value]) => (
                    <a 
                      key={type}
                      href={value}
                      className={`text-sm ${rankStyle.linkText} hover:underline`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {type}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* バッジコレクション */}
          <div className="grid grid-cols-4 gap-2">
            {userData?.badges?.slice(0, 4).map((badge) => (
              <div 
                key={badge.id}
                className={`w-12 h-12 ${rankStyle.badgeBg} rounded-full flex items-center justify-center`}
              >
                <img src={badge.iconUrl} alt={badge.title} className="w-8 h-8" />
              </div>
            ))}
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

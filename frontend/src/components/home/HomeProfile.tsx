'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ProfileEditModal } from '../profile/ProfileEditModal';
import { useProfile } from '@/hooks/user/useProfile';

export function HomeProfile() {
  const { theme } = useTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { userData, loading, error, updateProfile } = useProfile();
  
  // グラデーションの条件付きスタイル
  const gradientStyle = theme === 'dark'
    ? 'from-blue-900 to-purple-900'
    : 'from-sky-100 to-blue-100';

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
    
  return (
    <>
      <div 
        className={`bg-gradient-to-r ${gradientStyle} rounded-2xl p-6 mb-8 cursor-pointer hover:opacity-95 transition-opacity`}
        onClick={handleProfileClick}
      >
        <div className="flex justify-between">
          {/* プロフィール基本情報 */}
          <div className="flex space-x-6">
            {/* アバターと階級 */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden border-4 border-yellow-400">
                <img 
                  src={userData?.avatarUrl || "https://placehold.jp/150x150.png"} 
                  alt="アバター" 
                  className="w-full h-full object-cover" 
                />
              </div>
              {/* 階級表示の改善 */}
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                <span className="text-xs">階級</span>
                <span>{userData?.rank || '極伝'}</span>
              </div>
            </div>

            {/* ユーザー情報 */}
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
              }`}>{userData?.nickname || userData?.name || '名無しさん'}</h1>
              
              {/* レベルと経験値ゲージ */}
              <div className="mb-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Lv.{userData?.level || 0}</span>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>次のレベルまで: {1000 - (userData?.experience || 0) % 1000} EXP</span>
                </div>
                <div className={`w-48 h-2 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                } rounded-full`}>
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{width: `${((userData?.experience || 0) % 1000) / 10}%`}}
                  ></div>
                </div>
              </div>

              {/* ジェムとSNSリンク */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400">💎</span>
                  <span className={`font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
                  }`}>{userData?.gems || 0}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {userData?.snsLinks?.map((link, index) => (
                    <a 
                      key={index}
                      href={link.value}
                      className={`text-sm ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      } hover:underline`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.type}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* バッジコレクション */}
          <div className="grid grid-cols-4 gap-2">
            {userData?.badges?.slice(0, 4).map((badge, index) => (
              <div 
                key={badge.id}
                className={`w-12 h-12 ${
                  ['bg-yellow-400', 'bg-blue-400', 'bg-purple-400', 'bg-gray-400'][index]
                } rounded-full flex items-center justify-center`}
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
          avatar: userData?.avatarUrl || '',
          message: userData?.message || '',
          snsLinks: userData?.snsLinks || []
        }}
        onSave={handleSaveProfile}
      />
    </>
  );
}

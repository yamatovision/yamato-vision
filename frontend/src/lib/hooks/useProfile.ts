import { useState, useEffect } from 'react';
import { profileAPI } from '@/lib/api';
import { User, UserResponse } from '@/types/user';
import { useNotification } from '@/contexts/notification';

export function useProfile() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { showExperienceGain, showLevelUp } = useNotification();

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.get();
      console.log('Frontend received:', response.data);
  
      // デバッグ用ログを追加
      console.log('Experience gain check:', {
        expGained: response.data.expGained,
        type: typeof response.data.expGained
      });
  
      // 既存の実装はそのまま
      if (response.data.expGained > 0) {
        showExperienceGain(response.data.expGained);
      }
  
      if (response.data.levelUpData) {
        showLevelUp({
          oldLevel: response.data.levelUpData.oldLevel,
          newLevel: response.data.levelUpData.newLevel,
          message: response.data.levelUpData.message,
          experienceGained: response.data.expGained || 0
        });
      }
  
      setUserData(response.data);
      setError(null);
    } catch (error) {
      setError('プロフィールの取得に失敗しました');
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await profileAPI.update(data);
      setUserData(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const updateAvatar = async (base64Image: string) => {
    try {
      const response = await profileAPI.updateAvatar(base64Image);
      setUserData(response.data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const refreshProfile = () => {
    fetchProfile();
  };

  return {
    userData,
    loading,
    error,
    updateProfile,
    updateAvatar,
    refreshProfile
  };
}
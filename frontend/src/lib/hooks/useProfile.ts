import { useState, useEffect } from 'react';
import { profileAPI } from '@/lib/api';
import { User, UserResponse } from '@/types/user';

export function useProfile() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.get();
      setUserData(response.data);
      setError(null);
    } catch (error) {
      setError('プロフィールの取得に失敗しました');
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

  // 追加: プロフィール更新用メソッド
  const refreshProfile = () => {
    fetchProfile();
  };

  return {
    userData,
    loading,
    error,
    updateProfile,
    updateAvatar,
    refreshProfile  // 追加: 更新用メソッドを返す
  };
}
import { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { profileAPI } from '@/lib/api/profile';

export function useProfile() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    try {
      const response = await profileAPI.get();
      setUserData(response.data);
      setLoading(false);
    } catch (err) {
      setError('プロフィールの取得に失敗しました');
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await profileAPI.update(data);
      setUserData(prev => ({ ...prev, ...response.data }));
    } catch (err) {
      throw new Error('プロフィールの更新に失敗しました');
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    try {
      const response = await profileAPI.updateAvatar(avatarUrl);
      setUserData(prev => ({ ...prev, ...response.data }));
    } catch (err) {
      throw new Error('アバターの更新に失敗しました');
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return { userData, loading, error, updateProfile, updateAvatar };
}

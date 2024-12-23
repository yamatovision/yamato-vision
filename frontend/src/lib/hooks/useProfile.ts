import { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { profileAPI } from '@/lib/api/profile';
import { useToast } from '@/contexts/toast';
import { levelMessageAPI } from '@/lib/api/levelMessages';

export function useProfile() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const checkLevelUp = async (oldData: User | null, newData: User) => {
    if (!oldData) return;
    
    if (newData.level > oldData.level) {
      try {
        // レベルに対応するメッセージを取得
        const response = await levelMessageAPI.getAll();
        const levelMessage = response.data.data.find(
          (msg: any) => msg.level === newData.level && msg.isActive
        );

        showToast(
          levelMessage?.message || 'レベルアップしました！',
          'levelUp',
          {
            newLevel: newData.level,
            specialUnlock: levelMessage?.message
          }
        );
      } catch (error) {
        console.error('Failed to fetch level message:', error);
        showToast(
          'レベルアップしました！',
          'levelUp',
          {
            newLevel: newData.level
          }
        );
      }
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await profileAPI.get();
      const newUserData = response.data;
      await checkLevelUp(userData, newUserData);
      setUserData(newUserData);
      setLoading(false);
    } catch (err) {
      setError('プロフィールの取得に失敗しました');
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await profileAPI.update(data);
      const newUserData = response.data;
      await checkLevelUp(userData, newUserData);
      setUserData(prev => ({ ...prev, ...newUserData }));
    } catch (err) {
      throw new Error('プロフィールの更新に失敗しました');
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    try {
      const response = await profileAPI.updateAvatar(avatarUrl);
      const newUserData = response.data;
      await checkLevelUp(userData, newUserData);
      setUserData(prev => ({ ...prev, ...newUserData }));
    } catch (err) {
      throw new Error('アバターの更新に失敗しました');
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return { userData, loading, error, updateProfile, updateAvatar };
}

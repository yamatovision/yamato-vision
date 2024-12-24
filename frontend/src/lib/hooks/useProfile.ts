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

  const fetchUserProfile = async (force = false) => {
    if (!force) {
      // キャッシュチェック
      const cachedData = localStorage.getItem('profileCache');
      const cacheTimestamp = localStorage.getItem('profileCacheTimestamp');
      const cacheAge = cacheTimestamp ? Date.now() - Number(cacheTimestamp) : Infinity;

      if (cachedData && cacheAge < 5 * 60 * 1000) {
        const parsedData = JSON.parse(cachedData);
        setUserData(parsedData);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await profileAPI.get();
      const newUserData = response.data;
      
      // キャッシュを更新
      localStorage.setItem('profileCache', JSON.stringify(newUserData));
      localStorage.setItem('profileCacheTimestamp', Date.now().toString());

      await checkLevelUp(userData, newUserData);
      setUserData(newUserData);
    } catch (err) {
      setError('プロフィールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await profileAPI.update(data);
      const newUserData = response.data;
      await checkLevelUp(userData, newUserData);
      setUserData(prev => ({ ...prev, ...newUserData }));
      
      // キャッシュを更新
      localStorage.setItem('profileCache', JSON.stringify(newUserData));
      localStorage.setItem('profileCacheTimestamp', Date.now().toString());
    } catch (err) {
      throw new Error('プロフィールの更新に失敗しました');
    }
  };

  const updateAvatar = async (formData: FormData) => {
    try {
      const response = await profileAPI.updateAvatar(formData);
      const newUserData = response.data;
      await checkLevelUp(userData, newUserData);
      setUserData(prev => ({ ...prev, ...newUserData }));
      
      // キャッシュを更新
      localStorage.setItem('profileCache', JSON.stringify(newUserData));
      localStorage.setItem('profileCacheTimestamp', Date.now().toString());
    } catch (err) {
      throw new Error('アバターの更新に失敗しました');
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []); // 依存配列を空にする

  return { 
    userData, 
    loading, 
    error, 
    updateProfile, 
    updateAvatar,
    refreshProfile: fetchUserProfile // キャッシュを無視して更新する場合に使用
  };
}
import { useState, useEffect } from 'react';
import { User } from '@/types/user';

export function useProfile() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // TODO: API実装後に実際のエンドポイントに接続
      // 現在はモックデータを使用
      const mockUser = {
        id: '1',
        name: 'テストユーザー',
        nickname: 'テスト太郎',
        rank: '極伝',
        level: 10,
        experience: 5000,
        gems: 1000,
        avatarUrl: 'https://placehold.jp/150x150.png',
        message: 'よろしくお願いします',
        snsLinks: [],
        badges: []
      };

      setUserData(mockUser);
      setLoading(false);
    } catch (err) {
      setError('プロフィールの取得に失敗しました');
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      // TODO: API実装後に実際のエンドポイントに接続
      setUserData(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      throw new Error('プロフィールの更新に失敗しました');
    }
  };

  return { userData, loading, error, updateProfile };
}

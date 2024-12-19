import { useState, useEffect } from 'react';
import { ProfileResponse, ProfileUpdateData } from '@/types/profile.types';

const API_BASE_URL = 'http://localhost:3001'; // 追加

export const useProfile = () => {
  const [userData, setUserData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'  // 追加
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      setUserData(data.data);  // dataプロパティにアクセス
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updateData: ProfileUpdateData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      if (updateData.avatarFile) {
        formData.append('avatar', updateData.avatarFile);
      }
      formData.append('data', JSON.stringify({
        nickname: updateData.nickname,
        message: updateData.message,
        snsLinks: updateData.snsLinks
      }));

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setUserData(data.data);  // dataプロパティにアクセス
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    userData,
    loading,
    error,
    updateProfile,
    refreshProfile: fetchProfile
  };
};

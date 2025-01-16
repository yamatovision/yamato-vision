// frontend/src/lib/api/profile.ts

import api from './auth';

interface ProfileResponse {
  success: boolean;
  data: any;
  message?: string;
}

export const profileAPI = {
  async get(): Promise<ProfileResponse> {
    try {
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Making request to profile endpoint');
      const response = await api.get('/users/profile');
      console.log('Profile response:', response);
      return response.data;
    } catch (error) {
      console.error('Profile error:', error);
      throw new Error('プロフィールの取得に失敗しました');
    }
  },

  async update(data: any): Promise<ProfileResponse> {
    try {
      const response = await api.patch('/users/profile', data);
      return response.data;
    } catch (error) {
      throw new Error('プロフィールの更新に失敗しました');
    }
  },

  async updateAvatar(base64Image: string): Promise<ProfileResponse> {
    try {
      const response = await api.patch('/users/profile/avatar', {
        base64Image
      });
      return response.data;
    } catch (error) {
      throw new Error('アバターの更新に失敗しました');
    }
  },

  async getTranscript(): Promise<ProfileResponse> {
    try {
      const response = await api.get('/users/profile/transcript');
      return response.data;
    } catch (error) {
      throw new Error('成績証明書の取得に失敗しました');
    }
  }
};
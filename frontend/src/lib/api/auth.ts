import axios from 'axios';
import { AuthResponse } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const authApi = {
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: '認証処理中にエラーが発生しました' };
    }
  },

  async getProfile(token: string): Promise<AuthResponse> {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'プロフィール取得中にエラーが発生しました' };
    }
  }
};
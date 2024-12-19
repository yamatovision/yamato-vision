import axios from 'axios';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/login`,
        credentials
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      return {
        success: false,
        error: '認証処理中にエラーが発生しました'
      };
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/register`,
        credentials
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      return {
        success: false,
        error: 'ユーザー登録中にエラーが発生しました'
      };
    }
  },

  async getProfile(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('認証トークンがありません');
      }

      const response = await axios.get<AuthResponse>(
        `${API_BASE_URL}/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthResponse;
      }
      return {
        success: false,
        error: 'プロフィール取得中にエラーが発生しました'
      };
    }
  }
};

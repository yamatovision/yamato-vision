import axios from 'axios';
import { LoginCredentials, AuthResponse } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// axios インスタンスの作成
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// リクエストインターセプター
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          return error.response.data as AuthResponse;
        }
        return {
          success: false,
          error: 'サーバーとの通信に失敗しました'
        };
      }
      return {
        success: false,
        error: '認証処理中にエラーが発生しました'
      };
    }
  },

  async getProfile(token: string): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          return {
            success: false,
            error: '認証が必要です'
          };
        }
        if (error.response) {
          return error.response.data as AuthResponse;
        }
        return {
          success: false,
          error: 'サーバーとの通信に失敗しました'
        };
      }
      return {
        success: false,
        error: 'プロフィール取得中にエラーが発生しました'
      };
    }
  }
};

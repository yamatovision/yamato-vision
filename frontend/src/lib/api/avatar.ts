import { APIResponse } from '@/types/api';
import api from '@/lib/api/auth';  // 既存のaxiosインスタンスを使用

interface GenerateAvatarResponse {
  generationId: string;
  imageUrl: string;
}

export const avatarApi = {
  generateAvatar: async (options: {
    mode: 'quick' | 'guided';
    prompt?: string;
    modelId?: string;
    styleUUID?: string;
  }): Promise<APIResponse<GenerateAvatarResponse>> => {
    try {
      // 既存のaxiosインスタンスを使用し、相対パスでリクエスト
      const response = await api.post('/avatar/generate', options);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Avatar generation failed:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
};
import api from './auth';
import { LevelMessage } from '@/types/levelMessage';

interface LevelMessageListResponse {
  success: boolean;
  data: LevelMessage[];
  message?: string;
}

interface SingleLevelMessageResponse {
  success: boolean;
  data: LevelMessage;
  message?: string;
}

export const levelMessageAPI = {
  getAll: () => api.get<LevelMessageListResponse>('/level-messages'),
  create: (data: { level: number; message: string }) => 
    api.post<SingleLevelMessageResponse>('/level-messages', data),
  update: (id: string, data: Partial<LevelMessage>) =>
    api.patch<SingleLevelMessageResponse>(`/level-messages/${id}`, data),
  delete: (id: string) => 
    api.delete<SingleLevelMessageResponse>(`/level-messages/${id}`)
};

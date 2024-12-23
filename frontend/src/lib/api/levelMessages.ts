// lib/api/levelMessages.ts
import api from './auth';
import { LevelMessageResponse } from '@/types/admin';

export const levelMessageAPI = {
  getAll: () => api.get<LevelMessageResponse>('/level-messages'),
  create: (data: { level: number; message: string }) => 
    api.post<LevelMessageResponse>('/level-messages', data),
  update: (id: string, data: { message?: string; isActive?: boolean }) =>
    api.patch<LevelMessageResponse>(`/level-messages/${id}`, data),
  delete: (id: string) => 
    api.delete<LevelMessageResponse>(`/level-messages/${id}`)
};
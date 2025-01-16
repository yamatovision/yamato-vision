// frontend/src/lib/api/notices.ts
import api from './auth';
import type { Notice, CreateNoticeDto, UpdateNoticeDto } from '@/types/notice';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const noticeApi = {
  // 管理者用API
  create: (data: CreateNoticeDto) => 
    api.post<ApiResponse<Notice>>('/notices', data),
  
  update: (id: string, data: UpdateNoticeDto) => 
    api.put<ApiResponse<Notice>>(`/notices/${id}`, data),
  
  delete: (id: string) => 
    api.delete<ApiResponse<void>>(`/notices/${id}`),
  
  getAll: () => 
    api.get<ApiResponse<Notice[]>>('/notices/all'),
  
  getOne: (id: string) => 
    api.get<ApiResponse<Notice>>(`/notices/${id}`),
  // ユーザー用API
  getActive: () => 
    api.get<ApiResponse<Notice[]>>('/notices'),
};


import api from './auth';
import { 
  Course, 
  Chapter, 
  CreateCourseDTO, 
  UpdateCourseDTO, 
  CreateChapterDTO 
} from '@/types/course';
import { APIResponse } from '@/types/api';

interface BaseResponse {
  success: boolean;
  message?: string;
}

interface CourseResponse extends BaseResponse {
  data: Course;
}

interface CourseListResponse extends BaseResponse {
  data: Course[];
}

interface ChapterResponse extends BaseResponse {
  data: Chapter;
}

const FRONTEND_API_BASE = '/api';





// API関数の型を厳密に定義
export const courseApi = {
  // コース関連のAPI
  getCourses: async () => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${FRONTEND_API_BASE}/admin/courses`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    const data = await response.json();
    return { data: data.data };
  },
  getCourse: async (courseId: string) => {
    const response = await fetch(`${FRONTEND_API_BASE}/admin/courses/${courseId}`);
    const data = await response.json();
    return { data }; // data.data ではなく、data そのものを返す
  },

  createCourse: async (data: CreateCourseDTO) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${FRONTEND_API_BASE}/admin/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return { data: result.data };
  },

  updateCourse: async (courseId: string, data: UpdateCourseDTO) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${FRONTEND_API_BASE}/admin/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return { data: result.data };
  },

  deleteCourse: async (courseId: string) => {
    const token = localStorage.getItem('auth_token');
    await fetch(`${FRONTEND_API_BASE}/admin/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    return { success: true };
  },




  // チャプター関連のAPI
  createChapter: async (courseId: string, data: CreateChapterDTO) => {
    // waitTimeを除外し、releaseTimeを使用
    const { waitTime, ...restData } = data;
    const createData = {
      ...restData,
      releaseTime: data.releaseTime || waitTime // waitTimeをフォールバックとして使用
    };
  
    const response = await api.post<ChapterResponse>(
      `/admin/courses/${courseId}/chapters`,
      createData
    );
    return { data: response.data.data };
  },

  updateChapter: async (
    courseId: string, 
    chapterId: string, 
    data: Omit<Partial<Chapter>, 'id' | 'courseId'>
  ) => {
    // waitTimeを除外し、releaseTimeを使用
    const { waitTime, ...restData } = data;
    const updatedData = {
      ...restData,
      releaseTime: data.releaseTime || waitTime // waitTimeをフォールバックとして使用
    };
  
    const response = await api.put<ChapterResponse>(
      `/admin/courses/${courseId}/chapters/${chapterId}`,
      updatedData
    );
    return { data: response.data.data };
  },

  deleteChapter: async (courseId: string, chapterId: string) => {
    await api.delete(`/admin/courses/${courseId}/chapters/${chapterId}`);
    return { success: true };
  },

  updateChaptersOrder: async (
    courseId: string, 
    chapters: Array<{ id: string; orderIndex: number }>
  ) => {
    const response = await api.put<CourseResponse>(
      `/admin/courses/${courseId}/chapters/reorder`,
      { chapters }
    );
    return { data: response.data.data };
  },

  // 公開状態管理
  publishCourse: async (courseId: string) => {
    const response = await api.put<CourseResponse>(
      `/admin/courses/${courseId}`,
      { isPublished: true }
    );
    return { data: response.data.data };
  },

  unpublishCourse: async (courseId: string) => {
    const response = await api.put<CourseResponse>(
      `/admin/courses/${courseId}`,
      { isPublished: false }
    );
    return { data: response.data.data };
  },

  archiveCourse: async (courseId: string) => {
    const response = await api.put<CourseResponse>(
      `/admin/courses/${courseId}`,
      { isArchived: true }
    );
    return { data: response.data.data };
  }
};

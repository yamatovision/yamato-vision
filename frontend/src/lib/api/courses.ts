import api from './auth';
import { 
  Course, 
  Chapter, 
  CreateCourseDTO, 
  UpdateCourseDTO, 
  CreateChapterDTO 
} from '@/types/course';
import { APIResponse } from '@/types/api';

// レスポンス型の定義を修正
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

// API関数の型を厳密に定義
export const courseApi = {
  // コース関連のAPI
  getCourses: async () => {
    const response = await api.get<CourseListResponse>('/admin/courses');
    return { data: response.data.data };
  },

  getCourse: async (courseId: string) => {
    const response = await api.get<CourseResponse>(`/admin/courses/${courseId}`);
    return { data: response.data.data };
  },

  createCourse: async (data: CreateCourseDTO) => {
    const response = await api.post<CourseResponse>('/admin/courses', data);
    return { data: response.data.data };
  },

  updateCourse: async (courseId: string, data: UpdateCourseDTO) => {
    const response = await api.put<CourseResponse>(`/admin/courses/${courseId}`, data);
    return { data: response.data.data };
  },

  deleteCourse: async (courseId: string) => {
    await api.delete(`/admin/courses/${courseId}`);
    return { success: true };
  },

  // チャプター関連のAPI
  createChapter: async (courseId: string, data: CreateChapterDTO) => {
    const response = await api.post<ChapterResponse>(
      `/admin/courses/${courseId}/chapters`,
      data
    );
    return { data: response.data.data };
  },

  updateChapter: async (
    courseId: string, 
    chapterId: string, 
    data: Omit<Partial<Chapter>, 'id' | 'courseId'>
  ) => {
    const response = await api.put<ChapterResponse>(
      `/admin/courses/${courseId}/chapters/${chapterId}`,
      data
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

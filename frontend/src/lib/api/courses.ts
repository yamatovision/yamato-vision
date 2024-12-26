import api from './auth';
import { APIResponse } from '@/types/api';
import { 
  Course, 
  Chapter,
  CreateCourseDTO, 
  UpdateCourseDTO, 
  CreateChapterDTO,
  CourseStatus,
} from '@/types/course';

interface BaseResponse {
  success: boolean;
  message?: string;
}

interface CourseResponse extends BaseResponse {
  data: Course;
}

interface CourseListResponse extends BaseResponse {
  data: (Course & {
    status: CourseStatus;
    chapters?: Chapter[];
  })[];
}

interface ChapterResponse extends BaseResponse {
  data: Chapter;
}

interface UserCourse {
  id: string;
  courseId: string;
  progress: number;
  startedAt: Date;
  completedAt?: Date;
}

interface PurchaseResponse extends BaseResponse {
  data: {
    userCourse: UserCourse;
  };
}

const FRONTEND_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';


const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// API関数の型を厳密に定義
export const courseApi = {
  // コース関連のAPI
  getCourses: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${FRONTEND_API_BASE}/admin/courses`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
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
  getAvailableCourses: async (): Promise<CourseListResponse> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${FRONTEND_API_BASE}/courses/user/available`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      return { 
        success: true,
        data: data // バックエンドのレスポンスをそのまま使用
      };
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      throw error;
    }
  },
  purchaseCourse: async (courseId: string): Promise<PurchaseResponse> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(
      `${FRONTEND_API_BASE}/courses/user/${courseId}/purchase`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      }
    );
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to purchase course');
    }
    return { 
      success: true, 
      data: result 
    };
  },
  

  startCourse: async (courseId: string): Promise<APIResponse<{ success: boolean; data: any }>> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(
      `${FRONTEND_API_BASE}/courses/user/${courseId}/start`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      }
    );
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to start course');
    }
    return { 
      success: true, 
      data: result 
    };
  },


  getUserCourses: async (): Promise<CourseListResponse> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${FRONTEND_API_BASE}/users/courses/enrolled`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    const data = await response.json();
    return { success: true, data: data };
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

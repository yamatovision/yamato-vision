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

// インターフェース定義
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

interface CurrentCourseResponse extends BaseResponse {
  data: {
    id: string;
    courseId: string;
    chapters: {
      id: string;
      orderIndex: number;
      title: string;
    }[];
    progress: number;
    startedAt: Date;
  };
}

// 定数とユーティリティ関数
const FRONTEND_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

const getCurrentChapter = async (courseId: string): Promise<APIResponse<Chapter>> => {
  try {
    // パスを修正
    const response = await fetch(
      `${FRONTEND_API_BASE}/courses/user/${courseId}/current-chapter`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch current chapter:', response.status);
      throw new Error('Failed to fetch current chapter');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch current chapter');
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Error fetching current chapter:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const courseApi = {
  // コース一覧取得
  getCourses: async () => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/admin/courses?published=all`, 
        {
          headers: getAuthHeaders(),
        }
      );
  
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

  // 個別のコース取得
  getCourse: async (courseId: string) => {
    const response = await fetch(
      `${FRONTEND_API_BASE}/admin/courses/${courseId}`
    );
    const data = await response.json();
    return { data };
  },

  // コース作成
  createCourse: async (data: CreateCourseDTO) => {
    const response = await fetch(
      `${FRONTEND_API_BASE}/admin/courses`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    return { data: result.data };
  },

  // コース更新
  updateCourse: async (courseId: string, data: UpdateCourseDTO) => {
    const response = await fetch(
      `${FRONTEND_API_BASE}/admin/courses/${courseId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    return { data: result.data };
  },

  // コース削除
  deleteCourse: async (courseId: string) => {
    await fetch(
      `${FRONTEND_API_BASE}/admin/courses/${courseId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );
    return { success: true };
  },

  // 利用可能なコース一覧取得
  getAvailableCourses: async (): Promise<CourseListResponse> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/courses/user/available`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      return { 
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      throw error;
    }
  },

  // コース購入
  purchaseCourse: async (courseId: string): Promise<PurchaseResponse> => {
    const response = await fetch(
      `${FRONTEND_API_BASE}/courses/user/${courseId}/purchase`, 
      {
        method: 'POST',
        headers: getAuthHeaders(),
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

  // コース開始
  startCourse: async (courseId: string): Promise<APIResponse<{ success: boolean; data: any }>> => {
    const response = await fetch(
      `${FRONTEND_API_BASE}/courses/user/${courseId}/start`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
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

  // ユーザーの受講コース一覧取得
  getUserCourses: async (): Promise<CourseListResponse> => {
    const response = await fetch(
      `${FRONTEND_API_BASE}/users/courses/enrolled`,
      {
        headers: getAuthHeaders(),
      }
    );
    const data = await response.json();
    return { success: true, data: data };
  },


  // チャプター関連のAPI
  getChapter: async (courseId: string, chapterId: string): Promise<{ success: boolean; data?: Chapter }> => {
    if (!courseId || !chapterId) {
      throw new Error('courseId and chapterId are required');
    }
  
    try {
      console.log('Fetching chapter:', { courseId, chapterId });
      const response = await fetch(
        `${FRONTEND_API_BASE}/courses/${courseId}/chapters/${chapterId}`,
        {
          headers: getAuthHeaders(),
        }
      );
  
      if (!response.ok) {
        console.error('Chapter fetch failed:', response.status);
        return { success: false };
      }
  
      const responseData = await response.json();
      return { 
        success: true, 
        data: responseData.data 
      };
    } catch (error) {
      console.error('Failed to fetch chapter:', error);
      return { success: false };
    }
  },

  // チャプター完了処理
  completeChapter: async (courseId: string, chapterId: string): Promise<APIResponse<{ nextChapter: Chapter | null }>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/courses/${courseId}/chapters/${chapterId}/complete`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to complete chapter');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to complete chapter:', error);
      throw error;
    }
  },

  // 現在のコースの取得
  getCurrentUserCourse: async (courseId: string): Promise<CurrentCourseResponse> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/courses/user/${courseId}/current`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch current course');
      }

      const data = await response.json();
      return { 
        success: true,
        data: data 
      };
    } catch (error) {
      console.error('Failed to fetch current course:', error);
      throw error;
    }
  },

  // チャプター作成
  createChapter: async (courseId: string, data: CreateChapterDTO) => {
    const { waitTime, ...restData } = data;
    const createData = {
      ...restData,
      releaseTime: data.releaseTime || waitTime
    };
  
    const response = await api.post<ChapterResponse>(
      `/admin/courses/${courseId}/chapters`,
      createData
    );
    return { data: response.data.data };
  },

  // チャプター更新
  updateChapter: async (
    courseId: string, 
    chapterId: string, 
    data: Omit<Partial<Chapter>, 'id' | 'courseId'>
  ) => {
    const { waitTime, ...restData } = data;
    const updatedData = {
      ...restData,
      releaseTime: data.releaseTime || waitTime
    };
  
    const response = await api.put<ChapterResponse>(
      `/admin/courses/${courseId}/chapters/${chapterId}`,
      updatedData
    );
    return { data: response.data.data };
  },

  // チャプター削除
  deleteChapter: async (courseId: string, chapterId: string) => {
    await api.delete(`/admin/courses/${courseId}/chapters/${chapterId}`);
    return { success: true };
  },

  // チャプター順序更新
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
  publishCourse: async (courseId: string): Promise<CourseResponse> => {
    try {
      const response = await api.put<CourseResponse>(
        `/admin/courses/${courseId}`,
        { isPublished: true }
      );
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Failed to publish course:', error);
      throw error;
    }
  },

  unpublishCourse: async (courseId: string): Promise<CourseResponse> => {
    try {
      const response = await api.put<CourseResponse>(
        `/admin/courses/${courseId}`,
        { isPublished: false }
      );
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Failed to unpublish course:', error);
      throw error;
    }
  },

  archiveCourse: async (courseId: string): Promise<CourseResponse> => {
    try {
      const response = await api.put<CourseResponse>(
        `/admin/courses/${courseId}`,
        { isArchived: true }
      );
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Failed to archive course:', error);
      throw error;
    }
  }
};
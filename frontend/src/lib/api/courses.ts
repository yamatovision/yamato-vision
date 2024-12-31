import api from './auth';
import { APIResponse } from '@/types/api';
import { handleApiError } from './errorHandler';

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


export const courseApi = {
  // コース一覧取得




  getCourses: async (): Promise<APIResponse<Course[]>> => {
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
  
      const result = await response.json();
      console.log('Courses API response:', result); // デバッグ用
  
      // レスポンス形式のチェック
      if (!result || !result.success || !Array.isArray(result.data)) {
        console.error('Unexpected response format:', result);
        throw new Error('Invalid courses data format');
      }
  
      return {
        success: true,
        data: result.data
      };
  
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { 
        success: false, 
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },






  getCourse: async (courseId: string): Promise<APIResponse<Course>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/admin/courses/${courseId}`,
        {
          headers: getAuthHeaders(),
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to fetch course: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data; // レスポンスをそのまま返せる
    } catch (error) {
      console.error('Error in getCourse:', error);
      return { 
        success: false, 
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  getCurrentChapter: async (courseId: string): Promise<APIResponse<{
  chapterId: string;
  courseId: string;
  nextUrl: string;
  chapter: Chapter;
}>> => {
  try {
    // APIのベースURLを修正
    const response = await fetch(
      `${FRONTEND_API_BASE}/courses/user/${courseId}/current-chapter`,
      {
        headers: getAuthHeaders(),
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch current chapter');
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Invalid response format');
    }

    const currentChapter = data.data;
    return {
      success: true,
      data: {
        chapterId: currentChapter.id,
        courseId: courseId,
        nextUrl: `/user/courses/${courseId}/chapters/${currentChapter.id}`,
        chapter: currentChapter
      }
    };
  } catch (error) {
    console.error('Error fetching current chapter:', error);
    return { 
      success: false, 
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
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
// lib/api/courses.ts
updateCourse: async (courseId: string, data: UpdateCourseDTO) => {
  const response = await fetch(
    `${FRONTEND_API_BASE}/admin/courses/${courseId}`,
    {
      method: 'PUT', // PATCHからPUTに変更
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update course');
  }

  const result = await response.json();
  return result;
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
    try {
      console.log('Sending start course request for:', courseId);
      const response = await fetch(
        `${FRONTEND_API_BASE}/courses/user/${courseId}/start`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include'
        }
      );
      
      const result = await response.json();
      console.log('Start course response:', result);
  
      if (!response.ok) {
        throw new Error(result.message || 'Failed to start course');
      }
      return { 
        success: true, 
        data: result 
      };
    } catch (error) {
      console.error('Error in startCourse:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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
  // src/lib/api/courses.ts の getChapter メソッドを修正
getChapter: async (courseId: string, chapterId: string): Promise<APIResponse<Chapter>> => {
  try {
    const response = await fetch(
      `${FRONTEND_API_BASE}/courses/${courseId}/chapters/${chapterId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      return { 
        success: false, 
        data: null,
        error: 'Failed to fetch chapter'
      };
    }

    const responseData = await response.json();
    return { 
      success: true, 
      data: responseData.data 
    };
  } catch (error) {
    return { 
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
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

 // courses.ts
getCurrentUserCourse: async (courseId?: string) => {
  try {
    const endpoint = courseId 
      ? `${FRONTEND_API_BASE}/courses/user/${courseId}/progress`
      : `${FRONTEND_API_BASE}/courses/user/current`;  // 現在のコースを取得するエンドポイント

    const response = await fetch(
      endpoint,
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
      data: data.data
    };
  } catch (error) {
    console.error('Failed to fetch current course:', error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
},

expireArchiveAccess: async (courseId: string) => {
  try {
    const response = await api.post(`/courses/user/${courseId}/expire-archive`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
},
// src/lib/api/courses.ts に追加
startChapter: async (courseId: string, chapterId: string): Promise<APIResponse<any>> => {
  try {
    const response = await fetch(
      `${FRONTEND_API_BASE}/courses/${courseId}/chapters/${chapterId}/start`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to start chapter');
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
},

// repurchaseCourse メソッドの追加
repurchaseCourse: async (courseId: string): Promise<PurchaseResponse> => {
  const response = await fetch(
    `${FRONTEND_API_BASE}/courses/user/${courseId}/repurchase`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );
  
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to repurchase course');
  }
  return { 
    success: true, 
    data: result 
  };
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
import api from './auth';
import { APIResponse } from '@/types/api';
import { handleApiError } from './errorHandler';
import { 
  ChapterPreviewData,
  CurrentChapterData,
  ChapterContent 
} from '@/types/chapter';
import { 
  Course, 
  Chapter,
  CreateCourseDTO, 
  UpdateCourseDTO,
  ExamSection, 
  ExamSettings,
  UpdateChapterDTO,  // 追加 
  CreateChapterDTO,
  CurrentCourseState,
  CourseStatus,
} from '@/types/course';

// インターフェース定義
interface BaseResponse {
  success: boolean;
  message?: string;
}

interface CreateExamChapterDTO {
  title: string;
  subtitle?: string;
  timeLimit: number;
  releaseTime: number;
  examSettings: ExamSettings;
  isVisible?: boolean;
  isFinalExam: boolean;  // 常にtrue
}

// 試験チャプター更新用DTO
interface UpdateExamChapterDTO {
  title?: string;
  subtitle?: string;
  timeLimit?: number;
  releaseTime?: number;
  examSettings: ExamSettings;
  isVisible?: boolean;
}

interface ExamProgress {
  currentSection: number;
  startedAt: string;
  timeLimit: number;
  isComplete: boolean;
  sections: {
    id: string;
    title: string;
    task: {
      materials: string;
      task: string;
      evaluationCriteria: string;
    };
    maxPoints: number;
  }[];
  sectionResults?: {
    sectionId: string;
    score: number;
    feedback: string;
    nextStep: string;
    submittedAt: string;
  }[];
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

interface ExamResult {
  totalScore: number;
  grade: '秀' | '優' | '良' | '可' | '不可';
  gradePoint: number;
  feedback: string;
  sectionResults: {
    sectionId: string;
    score: number;
    feedback: string;
    nextStep: string;
    submittedAt: Date;
  }[];
  evaluatedAt: Date;
}

interface CertificateData {
  studentName: string;
  studentId: string;
  courseName: string;
  grade: string;
  score: number;
  completedAt: string;
  certificateId: string;
}


interface PeerSubmissionResponse {
  submissions: Array<{
    id: string;
    content: string;
    points: number;
    feedback: string;
    nextStep: string;
    submittedAt: Date;
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
      rank: string;
    };
  }>;
  total: number;
  page: number;
  perPage: number;
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


  saveMediaProgress: async (data: {
    videoId: string;
    courseId: string;
    chapterId: string;
    position: number;
    watchRate: number;
  }): Promise<APIResponse<any>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/media/progress`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save media progress');
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('Error saving media progress:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },activateCourse: async (courseId: string): Promise<APIResponse<void>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/courses/user/${courseId}/activate`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include'
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to activate course');
      }
  
      return { success: true, data: null };  // data: null を追加
    } catch (error) {
      return {
        success: false,
        data: null,  // data: null を追加
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  selectCourse: async (courseId: string): Promise<APIResponse<void>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/courses/user/${courseId}/select`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include'
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to select course');
      }
  
      return { success: true, data: null };  // data: null を追加
    } catch (error) {
      return {
        success: false,
        data: null,  // data: null を追加
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  formatCourse: async (courseId: string): Promise<APIResponse<void>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/courses/user/${courseId}/format`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include'
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to format course');
      }
  
      return { success: true, data: null };  // data: null を追加
    } catch (error) {
      return {
        success: false,
        data: null,  // data: null を追加
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // メディア進捗の取得
  getMediaProgress: async (chapterId: string): Promise<APIResponse<{
    position: number;
    watchRate: number;
  }>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/media/progress/${chapterId}`,
        {
          headers: getAuthHeaders(),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get media progress');
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('Error getting media progress:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  startExam: async (courseId: string, chapterId: string): Promise<APIResponse<any>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/courses/user/${courseId}/chapters/${chapterId}/exam/start`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include'
        }
      );
      
      

      if (!response.ok) {
        throw new Error('Failed to start exam');
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

  // セクション提出
  submitExamSection: async (
    courseId: string,
    chapterId: string,
    sectionId: string,
    content: string
  ): Promise<APIResponse<ExamResult | null>> => {
    try {
      const response = await fetch(
`${FRONTEND_API_BASE}/courses/user/${courseId}/chapters/${chapterId}/exam/sections/${sectionId}/submit`,

        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ content })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit exam section');
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
        isComplete: data.isComplete
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },


// 最終試験チャプター作成
createExamChapter: async (courseId: string, data: CreateExamChapterDTO): Promise<APIResponse<Chapter>> => {
  try {
    console.log('createExamChapter - リクエスト情報:', {
      URL: `${FRONTEND_API_BASE}/admin/courses/${courseId}/exam-chapters`,
      メソッド: 'POST',
      ヘッダー: getAuthHeaders(),
      送信データ: data
    });

    const response = await fetch(
      `${FRONTEND_API_BASE}/admin/courses/${courseId}/exam-chapters`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }
    );

    console.log('createExamChapter - レスポンス情報:', {
      ステータス: response.status,
      ステータスText: response.statusText,
      OK: response.ok  // "?" を削除
    });

    if (!response.ok) {
      // エラーレスポンスの詳細を取得
      const errorData = await response.json().catch(() => null);
      console.error('サーバーエラーの詳細:', errorData);
      throw new Error(errorData?.message || 'Failed to create exam chapter');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('createExamChapter - エラー詳細:', {
      エラー: error,
      メッセージ: error instanceof Error ? error.message : 'Unknown error',
      スタック: error instanceof Error ? error.stack : null
    });

    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
},

// 最終試験チャプター更新
updateExamChapter: async (
  courseId: string, 
  chapterId: string, 
  data: UpdateExamChapterDTO
): Promise<APIResponse<Chapter>> => {
  try {
    const response = await fetch(
      `${FRONTEND_API_BASE}/admin/courses/${courseId}/exam-chapters/${chapterId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update exam chapter');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
},


  // 試験結果取得
  getExamResult: async (
    courseId: string,
    chapterId: string
  ): Promise<APIResponse<ExamResult>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/courses/user/${courseId}/chapters/${chapterId}/exam/result`,
        {
          headers: getAuthHeaders(),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get exam result');
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
// frontend/src/lib/api/courses.ts のgetExamCertificateを修正
getExamCertificate: async (courseId: string, chapterId: string): Promise<APIResponse<CertificateData>> => {
  try {
    const response = await fetch(
      `${FRONTEND_API_BASE}/courses/user/${courseId}/chapters/${chapterId}/exam/certificate`, // パスを修正
      {
        headers: getAuthHeaders(),
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get certificate data');
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
  getExamProgress: async (courseId: string, chapterId: string): Promise<APIResponse<ExamProgress>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/courses/user/${courseId}/chapters/${chapterId}/exam/progress`, // ✅
        {
          headers: getAuthHeaders(),
          credentials: 'include'
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to fetch exam progress');
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

  // チャプター進捗の更新（95%以上視聴時）
  updateChapterProgress: async (
    courseId: string,
    chapterId: string,
    data: {
      lessonWatchRate: number;
    }
  ): Promise<APIResponse<any>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/courses/${courseId}/chapters/${chapterId}/progress`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update chapter progress');
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('Error updating chapter progress:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },




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
  getChaptersProgress: async (courseId: string): Promise<APIResponse<ChapterPreviewData[]>> => {
    try {
      console.log('【API呼び出し開始】getChaptersProgress', { courseId });
      const response = await fetch(
        `${FRONTEND_API_BASE}/courses/user/${courseId}/chapters/progress`,
        {
          headers: getAuthHeaders(),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chapters progress');
      }

      const data = await response.json();
      console.log('【APIレスポンス】getChaptersProgress:', data);

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error fetching chapters progress:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  getCurrentChapter: async (courseId: string): Promise<APIResponse<CurrentChapterData>> => {
    try {
      // リクエスト前のデバッグ情報
      const url = `${FRONTEND_API_BASE}/courses/user/${courseId}/chapters/current`;
      console.log('【リクエスト準備】getCurrentChapter', {
        エンドポイント: url,
        コースID: courseId,
        認証ヘッダー: getAuthHeaders(),
        API基底URL: FRONTEND_API_BASE
      });
  
      // リクエスト実行
      console.log('【リクエスト開始】getCurrentChapter');
      const response = await fetch(url, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
  
      // レスポンスステータスのデバッグ
      console.log('【レスポンス受信】getCurrentChapter', {
        ステータスコード: response.status,
        成功判定: response.ok,
        レスポンスヘッダー: Object.fromEntries(response.headers.entries())
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch current chapter: ${response.status}`);
      }
  
      // レスポンスデータの解析
      const data = await response.json();
      console.log('【データ解析】getCurrentChapter', {
        成功: data.success,
        データ存在: !!data.data,
        データ内容: data.data,
        メッセージ: data.message || 'メッセージなし'
      });
  
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Invalid response format');
      }
  
      // 成功時のレスポンス
      console.log('【処理完了】getCurrentChapter - 成功');
      return {
        success: true,
        data: data.data
      };
  
    } catch (error) {
      // エラー詳細のログ
      console.error('【エラー発生】getCurrentChapter:', {

        タイムスタンプ: new Date().toISOString()
      });
  
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  handleFirstAccess: async (courseId: string, chapterId: string): Promise<APIResponse<any>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/courses/user/${courseId}/chapters/${chapterId}/first-access`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include'
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to handle first access');
      }
  
      const data = await response.json();
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error in handleFirstAccess:', error);
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
getChapterPeerSubmissions: async (
  courseId: string, 
  chapterId: string,
  isEvaluationPage: boolean = false  // 新しいパラメータを追加
) => {
  try {
    const response = await fetch(
      `${FRONTEND_API_BASE}/courses/user/${courseId}/chapters/${chapterId}/peer-submissions?isEvaluationPage=${isEvaluationPage}`,
      {
        method: 'GET',
        headers: {
          ...getAuthHeaders()
        },
        credentials: 'include'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch peer submissions');
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error fetching peer submissions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch peer submissions'
    };
  }
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


  // courses.ts に追加
getCurrentCourseState: async (): Promise<APIResponse<CurrentCourseState>> => {
  try {
    const response = await fetch(
      `${FRONTEND_API_BASE}/courses/user/current-state`,
      {
        headers: getAuthHeaders(),
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch current course state');
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
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
        data: data.data  // レスポンスの正しい構造に対応
      };
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      return {  // エラーをスローせずに適切なレスポンスを返す
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

// /lib/api/courses.ts に追加
getSubmission: async (courseId: string, chapterId: string): Promise<APIResponse<{
  points: number;
  feedback: string;
  nextStep: string;
  submittedAt: Date;
}>> => {
  try {
    const response = await fetch(
      `${FRONTEND_API_BASE}/courses/user/${courseId}/chapters/${chapterId}/submission`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('評価結果の取得に失敗しました');
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
      error: error instanceof Error ? error.message : '評価結果の取得に失敗しました'
    };
  }
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
// frontend/src/lib/api/courses.ts 内の getChapter メソッドを修正

getChapter: async (courseId: string, chapterId: string): Promise<APIResponse<Chapter>> => {
  try {
    const response = await fetch(
      `${FRONTEND_API_BASE}/admin/courses/${courseId}/chapters/${chapterId}`, // 修正: 正しいエンドポイントパス
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch chapter: ${response.statusText}`);
    }

    const data = await response.json();
    
    // レスポンスの形式をチェック
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch chapter data');
    }

    return {
      success: true,
      data: data.data // バックエンドから返されるチャプターデータ
    };
  } catch (error) {
    console.error('Error in getChapter:', error);
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

// チャプター更新
updateChapter: async (
  courseId: string, 
  chapterId: string, 
  data: UpdateChapterDTO
): Promise<APIResponse<Chapter>> => {
  try {
    console.log('チャプター更新リクエスト:', {
      courseId,
      chapterId,
      data
    });

    const response = await fetch(
      `${FRONTEND_API_BASE}/admin/courses/${courseId}/chapters/${chapterId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)  // データをそのまま送信
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update chapter');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('チャプター更新エラー:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
},

updateMaterialProgress: async (
  courseId: string,
  chapterId: string,
  materialId: string,
  data: {  // このデータ型を追加
    completed: boolean;
    lastAccessedAt: Date;
  }
) => {
  try {
    const response = await fetch(
      `${FRONTEND_API_BASE}/courses/${courseId}/chapters/${chapterId}/materials/${materialId}/progress`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update material progress');
    }

    const data = await response.json();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
},

  createChapter: async (courseId: string, data: CreateChapterDTO): Promise<APIResponse<Chapter>> => {
  try {
    const response = await fetch(
      `${FRONTEND_API_BASE}/admin/courses/${courseId}/chapters`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create chapter');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
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

  toggleChapterVisibility: async (
    courseId: string,
    chapterId: string,
    isVisible: boolean
  ): Promise<APIResponse<Chapter>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/admin/courses/${courseId}/chapters/${chapterId}/visibility`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ isVisible })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update chapter visibility');
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // パーフェクトモードの切り替え
  toggleChapterPerfectMode: async (
    courseId: string,
    chapterId: string,
    isPerfectOnly: boolean
  ): Promise<APIResponse<Chapter>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/admin/courses/${courseId}/chapters/${chapterId}/perfect-mode`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ isPerfectOnly })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update perfect mode setting');
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // チャプターのステータス情報を取得
  getChapterStatus: async (
    courseId: string,
    chapterId: string
  ): Promise<APIResponse<{
    isVisible: boolean;
    isPerfectOnly: boolean;
    accessInfo: {
      canAccess: boolean;
      mode: 'normal' | 'perfect';
      message?: string;
    };
  }>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/admin/courses/${courseId}/chapters/${chapterId}/status`,
        {
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chapter status');
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  getActiveCourseUsers: async (courseId: string): Promise<APIResponse<{
  users: Array<{
    id: string;
    name: string | null;
    avatarUrl: string | null;
  }>;
}>> => {
  try {
    const response = await fetch(
      // パスを正しいものに修正
      `${FRONTEND_API_BASE}/courses/user/${courseId}/active-users`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch active users');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
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
  },

    reorderChapters: async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/chapters/reorder`, {
        method: 'POST',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error reordering chapters:', error);
      throw error;
    }
  },
  resetChapterOrder: async (courseId: string): Promise<APIResponse<any>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/admin/courses/${courseId}/chapters/reset-order`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to reset chapter order');
      }
  
      const data = await response.json();
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error resetting chapter order:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // courses.ts の submitTask メソッドを修正
  submitTask: async (
    courseId: string,
    chapterId: string,
    data: {
      submission: string;  // 回答のみ
    }
  ): Promise<APIResponse<{
    submission: {
      id: string;
      content: string;
      points: number;
      feedback: string;
    };
    evaluation: {
      total_score: number;
      feedback: string;
      next_step: string;
    };
  }>> => {
    try {
      const response = await fetch(
        `${FRONTEND_API_BASE}/courses/${courseId}/chapters/${chapterId}/submission`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to submit task');
      }
  
      const result = await response.json();
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('Task submission error:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};
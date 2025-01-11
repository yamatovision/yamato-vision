import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// レスポンスの型定義
interface ExamStartResponse {
  success: boolean;
  data?: {
    startedAt: Date;
    timeLimit: number;
    currentSection: number;
  };
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    // 認証ヘッダーの取得
    const authHeader = request.headers.get('authorization');
    const headersList = headers();
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // バックエンドAPIのベースURL確認
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '');
    if (!baseUrl) {
      console.error('API base URL is not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // バックエンドAPIへのリクエスト
    const response = await fetch(
      `${baseUrl}/api/courses/${params.courseId}/chapters/${params.chapterId}/exam/start`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'Cookie': headersList.get('cookie') || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('Exam start failed:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        params: params
      });

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.message || 'Failed to start exam',
          details: errorData.details || null
        },
        { 
          status: response.status,
          headers: {
            'Cache-Control': 'no-store'
          }
        }
      );
    }

    const data = await response.json();
    
    // レスポンスを返却
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error('Error starting exam:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start exam',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}
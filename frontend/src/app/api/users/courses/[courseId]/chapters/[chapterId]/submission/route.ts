import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    // 認証ヘッダーの取得
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:3001';
    const response = await fetch(
      `${baseUrl}/api/courses/${params.courseId}/chapters/${params.chapterId}/submission`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'Cookie': request.headers.get('cookie') || '',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      console.error('Submission fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        url: `${baseUrl}/api/courses/${params.courseId}/chapters/${params.chapterId}/submission`
      });
      return NextResponse.json(
        { error: 'Failed to fetch submission' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching latest submission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission result' },
      { status: 500 }
    );
  }
}
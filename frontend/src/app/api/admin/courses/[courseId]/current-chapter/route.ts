// /frontend/src/app/api/courses/user/[courseId]/current-chapter/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/api/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseId } = params;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses/user/${courseId}/current-chapter`,
      {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, error: errorData.message || 'Failed to fetch current chapter' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // バックエンドからのレスポンスを変換
    return NextResponse.json({
      success: true,
      data: {
        chapterId: data.data.id,
        courseId: courseId,
        nextUrl: `/user/courses/${courseId}/chapters/${data.data.id}`,
        chapter: data.data
      }
    });

  } catch (error) {
    console.error('Error in current-chapter API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch current chapter'
      },
      { status: 500 }
    );
  }
}
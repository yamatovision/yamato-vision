import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const body = await request.json();
    const token = request.headers.get('Authorization');

    // バックエンドAPIにリクエスト
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}/chapters/${params.chapterId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || '',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in chapter update:', error);
    return NextResponse.json(
      { message: 'チャプターの更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const token = request.headers.get('Authorization');

    // バックエンドAPIにリクエスト
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}/chapters/${params.chapterId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': token || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete chapter');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in chapter deletion:', error);
    return NextResponse.json(
      { message: 'チャプターの削除に失敗しました' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const token = request.headers.get('Authorization');

    // バックエンドAPIにリクエスト
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}/chapters/${params.chapterId}`,
      {
        headers: {
          'Authorization': token || '',
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in fetching chapter:', error);
    return NextResponse.json(
      { message: 'チャプターの取得に失敗しました' },
      { status: 500 }
    );
  }
}
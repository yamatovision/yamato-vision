import { NextRequest, NextResponse } from 'next/server';
import { courseApi } from '@/lib/api';

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const body = await request.json();
    const token = request.headers.get('Authorization');

    // バックエンドAPIにリクエスト
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}/chapters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in chapter creation:', error);
    return NextResponse.json(
      { message: 'チャプターの作成に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const body = await request.json();
    const token = request.headers.get('Authorization');

    // チャプターの順序更新
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}/chapters`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in updating chapter order:', error);
    return NextResponse.json(
      { message: 'チャプターの順序更新に失敗しました' },
      { status: 500 }
    );
  }
}
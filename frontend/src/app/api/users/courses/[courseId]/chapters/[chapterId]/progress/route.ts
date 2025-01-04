import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string, chapterId: string } }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId, chapterId } = params;

  try {
    const response = await fetch(
      `${API_URL}/courses/${courseId}/chapters/${chapterId}/progress`,
      {
        headers: {
'Authorization': `Bearer ${session.user.accessToken}`,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string, chapterId: string } }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId, chapterId } = params;
  const body = await request.json();

  try {
    const response = await fetch(
      `${API_URL}/courses/${courseId}/chapters/${chapterId}/progress`,
      {
        method: 'POST',
        headers: {
'Authorization': `Bearer ${session.user.accessToken}`,

          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}

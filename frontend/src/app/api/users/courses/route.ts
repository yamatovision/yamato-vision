import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = headers();
    const token = headersList.get('Authorization');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses/user/available`,
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    const courses = await response.json();
    return NextResponse.json({ success: true, data: courses });
  } catch (error) {
    console.error('Error in users/courses API route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch available courses' },
      { status: 500 }
    );
  }
}
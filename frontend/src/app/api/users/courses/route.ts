import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/api/auth';
import api from '@/lib/api/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses/user/available`,
      {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    const courses = await response.json();
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error in users/courses API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available courses' },
      { status: 500 }
    );
  }
}
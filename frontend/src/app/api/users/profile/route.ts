import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
    headers: {
      'Authorization': request.headers.get('Authorization') || '',
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  return NextResponse.json(data);
}

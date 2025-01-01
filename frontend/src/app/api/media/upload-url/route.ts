// frontend/src/app/api/media/upload-url/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filename, contentType })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in upload-url API route:', error);
    return NextResponse.json(
      { error: 'Failed to get upload URL' },
      { status: 500 }
    );
  }
}
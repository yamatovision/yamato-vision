import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json({ data: data });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch courses', 
          details: error.message 
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch courses', 
        details: 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/courses`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        },
        body: JSON.stringify(body),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to create course',
          details: errorData
        }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json({ 
      success: true,
      data: data 
    }, { 
      status: 201 
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to create course', 
          details: error.message 
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create course', 
        details: 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

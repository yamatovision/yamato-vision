import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, prompt, modelId, styleUUID } = body;

    const response = await fetch('http://localhost:3001/api/avatar/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 必要に応じて認証トークンを追加
        // 'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        mode,
        prompt,
        modelId,
        styleUUID
      }),
    });

    if (!response.ok) {
      throw new Error('Backend API request failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Avatar generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate avatar' },
      { status: 500 }
    );
  }
}

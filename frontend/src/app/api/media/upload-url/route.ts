// src/app/api/media/upload-url/route.ts

export async function POST(req: Request) {
  try {
    // リクエストボディの解析
    const { filename, contentType, courseId, chapterId } = await req.json();

    if (!filename || !contentType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // バックエンドAPIにリクエスト
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename,
        contentType,
        courseId,
        chapterId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({ error: errorData.message || 'Failed to get upload URL' }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error in upload-url API route:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
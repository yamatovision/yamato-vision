// app/api/debug/route.ts を作成
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    env: {
      api_url: process.env.NEXT_PUBLIC_API_URL,
      node_env: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString()
  });
}
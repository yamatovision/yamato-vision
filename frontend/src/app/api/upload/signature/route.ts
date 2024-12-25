import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { folder, fileType } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);

    // 署名の生成
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        resource_type: fileType.startsWith('video') ? 'video' : 'auto',
      },
      process.env.CLOUDINARY_API_SECRET || ''
    );

    return NextResponse.json({
      timestamp,
      signature,
      folder,
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
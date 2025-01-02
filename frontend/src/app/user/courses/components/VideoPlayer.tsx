'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme';

interface VideoPlayerProps {
  videoId: string;  // URLではなくvideoIdを直接受け取る
  courseId: string;
  chapterId: string;
  transcription?: string;
  onCompletion?: () => void;
  completed?: boolean;
}

export function VideoPlayer({ 
  videoId,  // videoIdを直接受け取る
  courseId, 
  chapterId, 
  transcription,
  onCompletion,
  completed 
}: VideoPlayerProps) {
  const { theme } = useTheme();

  return (
    <div className="space-y-2">
      <div 
        className={`relative rounded-lg overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        }`}
      >
        <iframe
          src={`https://iframe.mediadelivery.net/embed/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${videoId}`}
          loading="lazy"
          style={{ border: 'none' }}
          allowFullScreen
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          className="w-full aspect-video"
          referrerPolicy="no-referrer"
        />
      </div>

      {completed && (
        <div className="text-sm text-green-500 font-medium mt-2">
          ✓ 視聴完了
        </div>
      )}
    </div>
  );
}
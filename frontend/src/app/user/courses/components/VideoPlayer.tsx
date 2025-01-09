'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/theme';
import Script from 'next/script';

interface VideoPlayerProps {
  videoId: string;
  courseId: string;
  chapterId: string;
  transcription?: string;
  onCompletion?: () => void;
  completed?: boolean;
}

export function VideoPlayer({ 
  videoId,
  courseId, 
  chapterId, 
  transcription,
  onCompletion,
  completed 
}: VideoPlayerProps) {
  const { theme } = useTheme();

  // 開発用ログ
  useEffect(() => {
    console.log('【VideoPlayer】コンポーネントがマウントされました', {
      videoId,
      courseId,
      chapterId,
      字幕データ: transcription ? 'あり' : 'なし'
    });
  }, [videoId, courseId, chapterId, transcription]);

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/@mux/mux-player" 
        strategy="afterInteractive"
        onLoad={() => console.log('【VideoPlayer】Muxスクリプトの読み込みが完了しました')}
        onError={() => console.log('【VideoPlayer】Muxスクリプトの読み込みに失敗しました')}
      />

      <div className="space-y-2">
        <div 
          className={`relative rounded-lg overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          <mux-player
            stream-type="on-demand"
            playback-id={videoId}
            metadata-video-title={`Chapter ${courseId}`}
            accent-color="#3B82F6"
            className="w-full aspect-video"
            poster={`https://image.mux.com/${videoId}/animated.gif?fps=15&width=640`}
            placeholder={`https://image.mux.com/${videoId}/thumbnail.jpg?time=0`}
          />
        </div>

        {completed && (
          <div className="text-sm text-green-500 font-medium mt-2">
            ✓ 視聴完了
          </div>
        )}
      </div>
    </>
  );
}
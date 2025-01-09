'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/theme';
import Script from 'next/script';
import { useMediaProgress } from '@/lib/hooks/useMediaProgress';

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
  completed: initialCompleted 
}: VideoPlayerProps) {
  const { theme } = useTheme();
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  
  const {
    position,
    watchRate,
    isCompleted,
    saveProgress
  } = useMediaProgress({
    videoId,
    courseId,
    chapterId
  });

  // プレーヤーの初期化後の処理
  useEffect(() => {
    if (!isReady || !playerRef.current) return;

    const player = playerRef.current;
    
    // 保存された位置から再生を開始
    if (position > 0) {
      player.currentTime = position;
    }

    // 進捗の更新
    const handleTimeUpdate = () => {
      const currentTime = player.currentTime;
      const duration = player.duration;
      if (duration) {
        saveProgress(currentTime, duration);
      }
    };

    // イベントリスナーの設定
    player.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      player.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isReady, position, saveProgress]);

  // 完了時のコールバック
  useEffect(() => {
    if (isCompleted && onCompletion) {
      onCompletion();
    }
  }, [isCompleted, onCompletion]);

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/@mux/mux-player" 
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <div className="space-y-2">
        <div 
          className={`relative rounded-lg overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          <mux-player
            ref={playerRef}
            stream-type="on-demand"
            playback-id={videoId}
            metadata-video-title={`Chapter ${courseId}`}
            accent-color="#3B82F6"
            className="w-full aspect-video"
            poster={`https://image.mux.com/${videoId}/animated.gif?fps=15&width=640`}
            placeholder={`https://image.mux.com/${videoId}/thumbnail.jpg?time=0`}
          />
        </div>

        {(isCompleted || initialCompleted) && (
          <div className="text-sm text-green-500 font-medium mt-2">
            ✓ 視聴完了 ({Math.floor(watchRate)}%)
          </div>
        )}
      </div>
    </>
  );
}
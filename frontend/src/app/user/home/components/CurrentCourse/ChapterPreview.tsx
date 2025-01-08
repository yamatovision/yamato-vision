'use client';

import { useTheme } from '@/contexts/theme';
import { useEffect, useState } from 'react';
import { ActiveUsers } from '@/app/user/shared/ActiveUsers';

interface ChapterProgress {
  status: string;
  startedAt: string | null;
  completedAt?: string | null;
  timeOutAt?: string | null;
}

interface VideoMetadata {
  thumbnailUrl?: string;
  duration?: number;
}

interface ChapterContent {
  type: 'video' | 'audio';
  videoId: string;
  transcription?: string;
}

interface ChapterPreviewProps {
  chapter: {
    id: string;
    courseId: string;
    title: string;
    subtitle?: string;
    orderIndex: number;
    timeLimit?: number;
    content: ChapterContent;
  };
  progress?: ChapterProgress;
}

export function ChapterPreview({ chapter, progress }: ChapterPreviewProps) {
  const { theme } = useTheme();
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  // 動画メタデータを取得
  useEffect(() => {
    const fetchVideoMetadata = async () => {
      try {
        if (!chapter.content?.videoId) return;

        const LIBRARY_ID = '362884';
        const response = await fetch(
          `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${chapter.content.videoId}`,
          {
            headers: {
              'AccessKey': '55f77d60-a593-4210-be4ec78e69bc-5ea3-4168',
              'accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Video metadata:', data);

        setVideoMetadata({
          thumbnailUrl: `${process.env.NEXT_PUBLIC_BUNNY_CDN_URL}/${chapter.content.videoId}/thumbnail.jpg`,
          duration: data.length || 0
        });
      } catch (error) {
        console.error('Error fetching video metadata:', error);
      }
    };

    if (chapter.content?.videoId) {
      fetchVideoMetadata();
    }
  }, [chapter.content]);

  const calculateRemainingTime = () => {
    if (!progress?.startedAt || !chapter.timeLimit) return null;
    
    const startTime = new Date(progress.startedAt).getTime();
    const endTime = startTime + (chapter.timeLimit * 24 * 60 * 60 * 1000);
    const currentTime = new Date().getTime();
    const remaining = Math.max(0, endTime - currentTime);

    return Math.floor(remaining / 1000);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 動画時間のフォーマット
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!progress?.startedAt) return;

    const updateTimer = () => {
      const remaining = calculateRemainingTime();
      if (remaining !== null) {
        setRemainingTime(remaining);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [progress?.startedAt, chapter.timeLimit]);
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
      <div className="flex space-x-4 mb-4">
        {/* サムネイル部分 */}
        <div className="w-48 h-32 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0 relative">
          {chapter.content?.videoId ? (
            <>
              {!imageError ? (
  <div className="relative w-full h-full">
    {imageLoading && (
      <div className="absolute inset-0 bg-gray-700 animate-pulse" />
    )}
    <img
      src={`${process.env.NEXT_PUBLIC_BUNNY_CDN_URL}/${chapter.content.videoId}/thumbnail.jpg`}
      alt={chapter.title}
      className={`w-full h-full object-cover transition-opacity duration-300 ${
        imageLoading ? 'opacity-0' : 'opacity-100'
      }`}
      loading="lazy"
      referrerPolicy="no-referrer"
      onLoad={() => setImageLoading(false)}
      onError={() => {
        setImageError(true);
        setImageLoading(false);
      }}
    />
  </div>
) : (
  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  </div>
)}
              {/* 動画時間の表示 */}
              {videoMetadata?.duration && (
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(videoMetadata.duration)}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
  
        {/* チャプター詳細 */}
        <div className="flex-1">
          <h3 className={`font-bold text-lg mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Chapter {(chapter.orderIndex ?? 0) + 1}: {chapter.title}
          </h3>
          {chapter.subtitle && (
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {chapter.subtitle}
            </p>
          )}
          {progress?.startedAt && (
            <p className={`text-sm ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            } mt-2`}>
              {remainingTime && remainingTime > 0 ? (
                `残り時間：${formatTime(remainingTime)}`
              ) : (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  制限時間を超過しました（点数が減少します）
                </span>
              )}
            </p>
          )}
        </div>
      </div>
  
      {/* コース受講者情報 */}
      <div className={`border-t ${
        theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
      } pt-4`}>
        <div className="flex flex-col space-y-2">
          <div className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
          </div>
          {/* ActiveUsersコンポーネントを追加 */}
          <ActiveUsers courseId={chapter.courseId} maxDisplay={3} />
        </div>
      </div>
    </div>
  );
}
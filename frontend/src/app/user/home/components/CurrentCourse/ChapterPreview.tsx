'use client';

import { useTheme } from '@/contexts/theme';
import { useEffect, useState } from 'react';
import { ActiveUsers } from '@/app/user/shared/ActiveUsers';
import { ChapterProgressStatus } from '@/types/status'; 
import { getMuxVideoMetadata } from '@/lib/api/mux';  // この行を追加


// 既存のインターフェースはそのまま維持
interface ChapterProgress {
  status: ChapterProgressStatus;
  startedAt: string | null;
  completedAt?: string | null;
  timeOutAt?: string | null;
  lessonWatchRate?: number;
}
interface VideoMetadata {
  thumbnailUrl?: string;
  duration?: number;
}

interface ChapterContent {
  type: 'video' | 'audio';
  videoId: string;
  transcription?: string;
  id?: string;
}

interface ChapterPreviewProps {
  chapter: {
    id: string;
    courseId: string;
    title: string;
    subtitle?: string;
    orderIndex: number;
    timeLimit: number;  // 制限時間（時間単位）
    content: ChapterContent;
    lessonWatchRate: number;
    submission?: {
      score?: number;
      status?: string;
    };
    isVisible?: boolean;
    isPerfectOnly?: boolean;
    isFinalExam?: boolean;
  };
  progress?: ChapterProgress | null;  // nullableに
}

const getMuxThumbnail = (videoId: string | undefined): string | undefined => {
  if (!videoId) return undefined;
  return `https://image.mux.com/${videoId}/animated.gif`;
};


export function ChapterPreview({ chapter, progress }: ChapterPreviewProps) {
  const { theme } = useTheme();
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // フォーマット関数を追加
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchMuxMetadata = async () => {
      if (!chapter.content?.videoId) return;
  
      console.log('Fetching metadata for video:', chapter.content.videoId);
      const metadata = await getMuxVideoMetadata(chapter.content.videoId);
      if (metadata) {
        console.log('Received metadata:', metadata);
        setVideoMetadata(metadata);
      }
    };
  
    fetchMuxMetadata();
  }, [chapter.content?.videoId]);

  // 残り時間の計算ロジックを修正

  const calculateRemainingTime = () => {
    if (!progress?.startedAt || !chapter?.timeLimit) {
      console.log('Missing data:', { 
        startedAt: progress?.startedAt, 
        timeLimit: chapter?.timeLimit 
      });
      return null;
    }
  
    const startTime = new Date(progress.startedAt).getTime();
    // timeLimit を時間単位に変更（24 * 60 * 60 * 1000 を 60 * 60 * 1000 に変更）
    const timeLimit = chapter.timeLimit * 60 * 60 * 1000; // 時間をミリ秒に変換
    const endTime = startTime + timeLimit;
    const currentTime = new Date().getTime();
    
    return Math.max(0, endTime - currentTime) / 1000;
  };
  

  // タイマー更新のuseEffectを修正
  useEffect(() => {
    if (!progress?.startedAt) {  // startedAtの存在確認のみ
      setRemainingTime(null);
      return;
    }
  
    const updateTimer = () => {
      const remaining = calculateRemainingTime();
      if (remaining !== null) {
        setRemainingTime(remaining);
        
        // タイムアウト検知時にページ更新をトリガー
        if (remaining <= 0) {
          window.location.reload();
        }
      }
    };
  
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
  
    return () => clearInterval(timer);
  }, [progress?.startedAt, chapter.timeLimit]);
  // 残りの時間表示の条件を修正
  const renderTimeStatus = () => {
    if (!progress) return null;  // progress が null/undefined の場合は早期リターン

    // タイムアウト状態の判定を修正
    const isTimedOut = progress.status === 'FAILED' || (remainingTime !== null && remainingTime <= 0);

    return (
      <p className={`text-sm ${
        theme === 'dark' ? 'text-red-400' : 'text-red-600'
      } mt-2`}>
        {isTimedOut ? (
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            制限時間を超過しました（点数が減少します）
          </span>
        ) : remainingTime && remainingTime > 0 ? (
          `残り時間：${formatTime(remainingTime)}`
        ) : null}
      </p>
    );
  };


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
          src={getMuxThumbnail(chapter.content.videoId)}
          alt={chapter.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
        {/* ここに追加 */}
        {videoMetadata?.duration && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {formatDuration(videoMetadata.duration)}
          </div>
        )}
      </div>
    ) : (
      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
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
          {renderTimeStatus()}
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
          <ActiveUsers courseId={chapter.courseId} maxDisplay={3} />
        </div>
      </div>
    </div>
  );
}
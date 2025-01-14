'use client';

import { useTheme } from '@/contexts/theme';
import { useEffect, useState, useCallback } from 'react';  // useCallbackを追加
import { ActiveUsers } from '@/app/user/shared/ActiveUsers';
import { ChapterProgressStatus } from '@/types/status'; 
import { getMuxVideoMetadata } from '@/lib/api/mux';

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
    timeLimit: number;
    content: ChapterContent;
    lessonWatchRate: number;
    submission?: {
      score?: number;
      status?: string;
    };
    isVisible?: boolean;
    isPerfectOnly?: boolean;
    isFinalExam?: boolean;
    examSettings?: {  // 追加
      sections: any[];
      thumbnailUrl?: string;
    };
    thumbnailUrl?: string;  // 追加
  };
  progress?: ChapterProgress | null;
}
interface ThumbnailImageProps {
  url?: string;
  title: string;
  isLocked: boolean;
  chapter: ChapterPreviewProps['chapter'];  // 既存のpropsの型を使用
}

const ThumbnailImage = ({ title, isLocked, chapter }: {
  title: string;
  isLocked: boolean;
  chapter: ChapterPreviewProps['chapter'];
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getThumbnailUrl = useCallback(() => {
    console.log('【サムネイル取得処理】', {
      チャプターID: chapter.id,
      最終試験フラグ: chapter.isFinalExam,
      コンテンツ: chapter.content,
      既存サムネイル: chapter.thumbnailUrl
    });

    // isFinalExamフラグによる判定
    if (chapter.isFinalExam) {
      // examSettingsのthumbnailUrlを最優先
      if (chapter.examSettings?.thumbnailUrl) {
        return chapter.examSettings.thumbnailUrl;
      }
      // 以下は既存の実装
      if (chapter.content?.thumbnailUrl) {
        return chapter.content.thumbnailUrl;
      }
      if (chapter.thumbnailUrl && !chapter.thumbnailUrl.startsWith('undefined/')) {
        return chapter.thumbnailUrl;
      }
    }

    // 通常のビデオコンテンツ
    if (chapter.content?.type === 'video' && chapter.content.videoId) {
      return `https://image.mux.com/${chapter.content.videoId}/thumbnail.jpg`;
    }

    // 音声コンテンツ
    if (chapter.content?.type === 'audio' && chapter.content.thumbnailUrl) {
      return chapter.content.thumbnailUrl;
    }

    return null;
  }, [chapter]);

  const thumbnailUrl = getThumbnailUrl();

  return (
    <div className="relative w-full h-full">
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse rounded" />
      )}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={title}
          className={`w-full h-full object-cover rounded transition-opacity duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      ) : (
        <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center">
          <span className="text-2xl">
            {chapter.isFinalExam ? '📝' : chapter.content?.type === 'audio' ? '🎵' : '🎥'}
          </span>
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
          <span className="text-xl text-white">🔒</span>
        </div>
      )}
      {chapter.isFinalExam && (
        <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs">
          最終試験
        </div>
      )}
    </div>
  );
};

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

  // フォーマット関数
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

  // ビデオメタデータの取得
  useEffect(() => {
    const fetchMuxMetadata = async () => {
      if (!chapter.content?.videoId) return;
      const metadata = await getMuxVideoMetadata(chapter.content.videoId);
      if (metadata) {
        setVideoMetadata(metadata);
      }
    };
    fetchMuxMetadata();
  }, [chapter.content?.videoId]);

  // 残り時間の計算ロジック
  const calculateRemainingTime = () => {
    // 完了済みまたは制限時間がない場合は計算しない
    if (!progress?.startedAt || !chapter?.timeLimit || progress.status === 'COMPLETED') {
      return null;
    }

    const startTime = new Date(progress.startedAt).getTime();
    const timeLimit = chapter.timeLimit * 60 * 60 * 1000; // 時間をミリ秒に変換
    const endTime = startTime + timeLimit;
    const currentTime = new Date().getTime();
    
    return Math.max(0, endTime - currentTime) / 1000;
  };

  // タイマー更新のuseEffect
  useEffect(() => {
    // 完了済みの場合はタイマーを動作させない
    if (progress?.status === 'COMPLETED' || progress?.completedAt) {
      setRemainingTime(null);
      return;
    }

    // 開始していない場合もタイマーを動作させない
    if (!progress?.startedAt || progress.status === 'NOT_STARTED') {
      setRemainingTime(null);
      return;
    }

    const updateTimer = () => {
      const remaining = calculateRemainingTime();
      if (remaining !== null) {
        setRemainingTime(remaining);
        
        // タイムアウト検知時にページ更新をトリガー
        // 完了済みでない場合のみリロード
        if (remaining <= 0 && progress.status !== 'COMPLETED') {
          window.location.reload();
        }
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [progress?.startedAt, progress?.status, progress?.completedAt, chapter.timeLimit]);

  // 残りの時間表示の条件を修正
  const renderTimeStatus = () => {
    if (!progress) return null;  // progress が null/undefined の場合は早期リターン

    // タイムアウト状態の判定を修正
    const isTimedOut = progress.status === 'FAILED' || (remainingTime !== null && remainingTime <= 0);

    // 完了済みの場合は時間表示しない
    if (progress.status === 'COMPLETED' || progress.completedAt) {
      return null;
    }

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
        <ThumbnailImage
          title={chapter.title}
          isLocked={false}
          chapter={chapter}
        />
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

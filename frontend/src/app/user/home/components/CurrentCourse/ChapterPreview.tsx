'use client';

import { useTheme } from '@/contexts/theme';
import { useEffect, useState, useCallback, useMemo } from 'react';  // useMemo を追加
import { ActiveUsers } from '@/app/user/shared/ActiveUsers';
import { ChapterProgressStatus } from '@/types/status'; 
import { getMuxVideoMetadata } from '@/lib/api/mux';
import { useCurrentCourse } from '../hooks/useCurrentCourse';  // 追加


// 既存のインターフェースはそのまま維持
interface ChapterProgress {
  status: ChapterProgressStatus;
  startedAt: string | null;
  completedAt?: string | null;
  timeOutAt?: string | null;
  lessonWatchRate?: number;
}

interface ChapterDisplayState {
  canShowPreview: boolean;
  message: string | null;
  showTimer: boolean;
}

interface VideoMetadata {
  thumbnailUrl?: string;
  duration?: number;
}

interface ChapterContent {
  type: 'video' | 'audio' | 'exam';  // 'exam' を追加
  videoId?: string;
  transcription?: string;
  thumbnailUrl?: string;  // この行を追加
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
      return `https://image.mux.com/${chapter.content.videoId}/animated.gif?width=480&fit_mode=preserve`;
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
  const { courseData, getChapterDisplayState } = useCurrentCourse();  // 修正Z
  const displayState = useMemo((): ChapterDisplayState => {
    if (!courseData) return {
      canShowPreview: true,
      message: null,
      showTimer: false
    };
  
    const chapterWithStatus = {
      ...chapter,
      status: progress?.status || 'NOT_STARTED',
      isLocked: false,
      canAccess: true,
      isFinalExam: chapter.isFinalExam || false,
      examSettings: chapter.examSettings ? {
        ...chapter.examSettings,
        maxPoints: 100,  // デフォルト値
        timeLimit: chapter.timeLimit,  // 既存のtimeLimitを使用
        type: 'exam' as const  // 明示的な型指定
      } : undefined
    };
  
    return getChapterDisplayState(
      chapterWithStatus,
      courseData.status,
      null
    );
  }, [chapter, courseData, getChapterDisplayState, progress]);

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


  useEffect(() => {
    // コース完了状態またはプレビュー非表示の場合はタイマー不要
    if (!displayState.showTimer) {
      setRemainingTime(null);
      return;
    }

    const updateTimer = () => {
      const remaining = calculateRemainingTime();
      if (remaining !== null) {
        setRemainingTime(remaining);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [displayState.showTimer]);

  // 時間表示コンポーネント
  const TimeDisplay = () => {
    if (!displayState.canShowPreview) return null;

    return (
      <p className={`text-sm ${
        theme === 'dark' ? 'text-red-400' : 'text-red-600'
      } mt-2`}>
        {displayState.message}
      </p>
    );
  };
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
      {displayState.canShowPreview && (
        <>
          <div className="flex space-x-4 mb-4">
            {/* サムネイル部分 */}
            <div className="w-48 h-32 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0 relative">
              <ThumbnailImage
                title={chapter.title}
                isLocked={!displayState.canShowPreview}
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
              <TimeDisplay />
            </div>
          </div>

          {/* コース受講者情報 */}
          <div className={`border-t ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
          } pt-4`}>
            <div className="flex flex-col space-y-2">
              <ActiveUsers courseId={chapter.courseId} maxDisplay={3} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
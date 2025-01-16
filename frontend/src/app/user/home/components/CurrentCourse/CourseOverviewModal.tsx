'use client';

import { useTheme } from '@/contexts/theme';
import { Fragment, useEffect, useState, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { CourseData } from '@/types/course';
import { ChapterPreviewData } from '@/types/chapter';  // 追加
import { courseApi } from '@/lib/api/courses';
import { toast } from 'react-hot-toast';

interface CourseOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseData: CourseData;
  switchToChapter: (chapter: ChapterPreviewData) => Promise<void>;  // 追加
}

// ThumbnailImageコンポーネントの型定義
interface ThumbnailImageProps {
  url?: string;
  title: string;
  isLocked: boolean;
  chapter: ChapterPreviewData;  // 既存の型を使用
}

const getThumbnailUrl = (videoId: string) => {
  if (!videoId) return null;
  // Muxの場合は静止画サムネイルを使用
  return `https://image.mux.com/${videoId}/thumbnail.png`;
};

export function CourseOverviewModal({ isOpen, onClose, courseData }: CourseOverviewModalProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const [chapters, setChapters] = useState<ChapterPreviewData[]>([]);
  const [loading, setLoading] = useState(true);
 
  
    const ThumbnailImage = ({ title, isLocked, chapter }: ThumbnailImageProps) => {
      const [imageError, setImageError] = useState(false);
      const [imageLoading, setImageLoading] = useState(true);
    
      const getThumbnailUrl = useCallback(() => {
        console.log('【サムネイル取得処理 詳細】', {
          チャプターID: chapter.id,
          最終試験フラグ: chapter.isFinalExam,
          コンテンツ: chapter.content,
          既存サムネイル: chapter.thumbnailUrl,
          試験設定: chapter.examSettings,
          試験設定のサムネイル: chapter.examSettings?.thumbnailUrl
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

  useEffect(() => {
    const fetchChaptersProgress = async () => {
      try {
        setLoading(true);
        const response = await courseApi.getChaptersProgress(courseData.courseId);
  
        if (response.success && response.data) {
          // 単純に response.data をそのまま使用
          console.log('【デバッグ】最終試験チャプター:', 
            response.data.find(ch => ch.isFinalExam)?.examSettings
          );
  
          setChapters(response.data);
        }
      } catch (error) {
        console.error('チャプター情報の取得に失敗:', error);
        toast.error('チャプター情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
  
    if (isOpen && courseData?.courseId) {
      fetchChaptersProgress();
    }
  }, [isOpen, courseData?.courseId]);













// チャプターへの遷移処理
 const handleChapterClick = async (chapter: ChapterPreviewData) => {
    if (!chapter.canAccess) {
      toast.error('このチャプターにはまだアクセスできません');
      return;
    }

    // 前のチャプターが完了しているかチェック
    const prevChapters = chapters
      .filter(ch => ch.orderIndex < chapter.orderIndex)
      .sort((a, b) => b.orderIndex - a.orderIndex);

    const previousChapter = prevChapters[0];
    if (previousChapter && previousChapter.status !== 'COMPLETED') {
      toast.error('前のチャプターを完了させてください');
      return;
    }

    await switchToChapter(chapter);
    onClose();
  };
// 残り時間のフォーマット
const formatRemainingTime = (chapter: ChapterPreviewData): string => {
  if (chapter.nextUnlockTime) {
    const now = new Date();
    const unlockTime = new Date(chapter.nextUnlockTime);
    const diffMs = unlockTime.getTime() - now.getTime();
    
    // 既に解放時間を過ぎている場合
    if (diffMs <= 0) {
      return 'アクセス可能';
    }

    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;
      return `あと${days}日${remainingHours > 0 ? ` ${remainingHours}時間` : ''}でアクセス可能`;
    }
    return `あと${diffHours}時間でアクセス可能`;
  }
  return '';
};

// ステータスバッジのスタイルとラベル
const getStatusInfo = (chapter: ChapterPreviewData) => {
  if (chapter.isLocked) {
    return {
      style: 'bg-gray-600 text-white',
      label: 'ロック中'
    };
  }

  switch (chapter.status) {
    case 'COMPLETED':
      if (chapter.evaluationStatus === 'PERFECT') {
        return {
          style: 'bg-yellow-500 text-white',
          label: 'Perfect'
        };
      } else if (chapter.evaluationStatus === 'GREAT') {
        return {
          style: 'bg-blue-500 text-white',
          label: 'Great'
        };
      }
      return {
        style: 'bg-green-600 text-white',
        label: '完了'
      };
    case 'LESSON_IN_PROGRESS':
      return {
        style: 'bg-blue-600 text-white',
        label: 'レッスン中'
      };
    case 'TASK_IN_PROGRESS':
      return {
        style: 'bg-orange-500 text-white',
        label: '課題作成中'
      };
    case 'LESSON_COMPLETED':
      return {
        style: 'bg-indigo-500 text-white',
        label: '課題提出待ち'
      };
    case 'FAILED':
      return {
        style: 'bg-red-500 text-white',
        label: '失敗'
      };
    default:
      return {
        style: 'bg-gray-500 text-white',
        label: '未開始'
      };
  }
};
// ... 前回のコードに続いて

return (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog
      as="div"
      className="relative z-50"
      onClose={onClose}
    >
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/70" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className={`w-full max-w-2xl transform rounded-2xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } p-6 shadow-xl transition-all`}>
              {/* ヘッダー */}
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {courseData.course.title}
                </Dialog.Title>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* ローディング表示 */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i}
                      className={`animate-pulse h-24 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
              ) : (
                // チャプターリスト
                <div className="space-y-4">
                  {chapters.map((chapter) => {
                    const statusInfo = getStatusInfo(chapter);
                    return (
                      <div
                        key={chapter.id}
                        onClick={() => handleChapterClick(chapter)}
                        className={`
                          rounded-lg p-4 transition-all
                          ${!chapter.canAccess ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
                          ${chapter.status === 'LESSON_IN_PROGRESS' || chapter.status === 'TASK_IN_PROGRESS' 
                            ? 'border-2 border-blue-500' 
                            : ''
                          }
                          ${theme === 'dark' 
                            ? `bg-gray-700 ${chapter.canAccess && 'hover:bg-gray-600'}` 
                            : `bg-gray-50 ${chapter.canAccess && 'hover:bg-gray-100'}`
                          }
                        `}
                      >
                        <div className="flex items-start space-x-4">
                          {/* サムネイル */}
                          <div className="w-24 h-16 bg-gray-600 rounded flex items-center justify-center flex-shrink-0">

                            

                            
                          <ThumbnailImage 
  url={chapter.content?.videoId || ''}
  title={chapter.title}
  isLocked={chapter.isLocked}
  chapter={chapter}
/>
      </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className={`font-bold ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                  Chapter {chapter.orderIndex + 1}: {chapter.title}
                                </h3>
                                {chapter.subtitle && (
                                  <p className={`text-sm ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    {chapter.subtitle}
                                  </p>
                                )}
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.style}`}>
                                {statusInfo.label}
                              </span>
                            </div>

                            {/* 進捗情報 */}
                            <div className="mt-2">
                              {chapter.status === 'LESSON_IN_PROGRESS' && (
                                <div className="text-sm text-blue-400">
                                  レッスン進捗: {Math.round(chapter.lessonWatchRate)}%
                                </div>
                              )}
                              
                              {chapter.status === 'COMPLETED' && chapter.score !== undefined && (
                                <div className="flex items-center space-x-4 text-sm">
                                  <span className="text-green-400">
                                    スコア: {chapter.score}点
                                  </span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleChapterClick(chapter);
                                    }}
                                    className="text-blue-400 hover:underline"
                                  >
                                    復習する
                                  </button>
                                </div>
                              )}

                              {/* 待機時間表示 */}
                              {!chapter.canAccess && formatRemainingTime(chapter) && (
                                <div className="text-sm text-gray-400">
                                  {formatRemainingTime(chapter)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 注意事項 */}
              <div className="mt-6 bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-500">⚠️</span>
                  <div className="text-sm text-yellow-500">
                    <p>チャプターの移動に関する注意:</p>
                    <ul className="list-disc ml-4 mt-1 space-y-1">
                      <li>完了済みチャプターは何度でも復習できます</li>
                      <li>進行中のチャプターは期限内に完了させてください</li>
                      <li>次のチャプターは前のチャプターを完了し、待機時間後にアンロックされます</li>
                      <li>タイムアウトすると減点対象となります</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);
}
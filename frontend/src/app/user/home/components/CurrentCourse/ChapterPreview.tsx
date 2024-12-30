'use client';

import { useTheme } from '@/contexts/theme';

interface ChapterPreviewProps {
  chapter: {
    id: string;
    courseId: string;
    title: string;
    subtitle?: string;
    orderIndex: number;
    timeLimit?: number;
  };
  currentContent?: {
    type: 'video' | 'audio';
    url: string;
    duration: string;
  };
}

export function ChapterPreview({ chapter, currentContent }: ChapterPreviewProps) {
  const { theme } = useTheme();

  if (!chapter) {
    return null;
  }

  return (
    <div className={`bg-${theme === 'dark' ? 'gray-700' : 'gray-50'} rounded-lg p-4 mb-6`}>
      <div className="flex space-x-4 mb-4">
        {/* サムネイル部分 */}
        <div className="w-48 h-32 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0 relative">
          {currentContent && (
            <>
              {currentContent.type === 'video' ? (
                <video
                  src={currentContent.url}
                  className="w-full h-full object-cover"
                  poster="/placeholder-thumbnail.jpg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black/60 text-xs px-2 py-1 rounded">
                {currentContent.duration}
              </div>
            </>
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
          {chapter.timeLimit && (
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            } mt-2`}>
              制限時間：{chapter.timeLimit}分
            </p>
          )}
        </div>
      </div>

      {/* コース受講者情報 - ActiveUsersコンポーネントを次に実装予定 */}
      <div className={`border-t ${
        theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
      } pt-4`}>
        <div className="flex justify-between items-center">
          <div className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            コース受講者情報は次のコンポーネントで実装予定
          </div>
        </div>
      </div>
    </div>
  );
}
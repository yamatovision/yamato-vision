'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { toast } from 'react-hot-toast';

interface MediaUploadProps {
  type: 'video' | 'audio';
  currentVideoId?: string;
  onUpload: (data: { videoId: string }) => void;
  courseId: string;
  chapterId: string;
}

export function MediaUpload({
  type,
  currentVideoId,
  onUpload,
  courseId,
  chapterId
}: MediaUploadProps) {
  const { theme } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [videoId, setVideoId] = useState(currentVideoId || '');
  const [showPreview, setShowPreview] = useState(!!currentVideoId);

  const validateVideoId = (id: string): boolean => {
    return /^[a-zA-Z0-9-]+$/.test(id);
  };

  const handleSubmit = async () => {
    if (!videoId.trim()) {
      toast.error('Video IDを入力してください');
      return;
    }

    if (!validateVideoId(videoId)) {
      toast.error('有効なVideo IDを入力してください');
      return;
    }

    setIsUploading(true);

    try {
      await onUpload({ videoId });
      toast.success('メディア情報を設定しました');
      setShowPreview(true);
    } catch (error) {
      console.error('Error setting media:', error);
      toast.error('メディア情報の設定に失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const getPreviewUrl = (videoId: string) => 
    `https://iframe.mediadelivery.net/play/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${videoId}`;

  return (
    <div className="space-y-6">
      {/* プレビュー表示 */}
      {showPreview && videoId && type === 'video' && (
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              設定済みメディア
            </span>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative w-full pt-[56.25%] bg-black">
              <iframe
                src={getPreviewUrl(videoId)}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">Video ID:</p>
            <code className={`text-xs px-2 py-1 rounded block mt-1 overflow-x-auto ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              {videoId}
            </code>
          </div>
        </div>
      )}

      {/* Video ID入力フォーム */}
      <div className="space-y-4">
        <input
          type="text"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          placeholder="4c517f36-cd53-4c3f-8519-08fbdb047c50"
          className={`w-full rounded-lg p-3 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white border-gray-600'
              : 'bg-white text-gray-900 border-gray-200'
          } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
        />
        <button
          onClick={handleSubmit}
          disabled={!videoId.trim() || isUploading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? '設定中...' : 'Video IDを設定'}
        </button>
      </div>

      {/* ローディング表示 */}
      {isUploading && (
        <div className="mt-4">
          <div className="animate-pulse flex justify-center items-center py-2">
            <span className="text-blue-500">設定中...</span>
          </div>
        </div>
      )}

      {/* デバッグ情報 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs space-y-1">
          <p>isUploading: {isUploading.toString()}</p>
          <p>videoId: {videoId}</p>
          <p>showPreview: {showPreview.toString()}</p>
        </div>
      )}
    </div>
  );
}
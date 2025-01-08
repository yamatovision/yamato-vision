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

  return (
    <div className="space-y-6">
     {showPreview && videoId && type === 'video' && (
  <div className="rounded-lg overflow-hidden bg-gray-800 shadow-lg">
    <div className="relative">
      <iframe
        src={`https://iframe.mediadelivery.net/play/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${videoId}`}
        className="w-full"
        style={{ height: '600px' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  </div>
)}

      <div className="space-y-4">
        <input
          type="text"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          placeholder="4c517f36-cd53-4c3f-8519-08fbdb047c50"
          className="w-full rounded-lg p-3 bg-gray-700 text-white border-gray-600 border focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!videoId.trim() || isUploading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? '設定中...' : 'Video IDを設定'}
        </button>
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="animate-pulse flex justify-center items-center py-2">
            <span className="text-blue-500">設定中...</span>
          </div>
        </div>
      )}
    </div>
  );
}
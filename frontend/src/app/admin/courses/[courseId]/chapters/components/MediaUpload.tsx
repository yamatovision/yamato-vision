'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface MediaUploadProps {
  type: 'video' | 'audio';
  currentUrl?: string;
  onUpload: (data: { url: string; thumbnailUrl?: string }) => void;
  courseId: string;
  chapterId: string;
}

export function MediaUpload({
  onUpload,
  currentUrl,
  type
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [directUrl, setDirectUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleDirectUrlSubmit = async () => {
    console.log('handleDirectUrlSubmit 開始');
    console.log('入力されたURL:', directUrl);

    if (!directUrl.trim()) {
      console.log('エラー: URLが空');
      toast.error('URLを入力してください');
      return;
    }

    if (!directUrl.includes('iframe.mediadelivery.net/play/')) {
      console.log('エラー: 無効なURL形式');
      toast.error('有効なBunny CDN URLを入力してください');
      return;
    }

    console.log('バリデーション通過、アップロード開始');
    setIsUploading(true);

    try {
      console.log('onUpload呼び出し前');
      await onUpload({ 
        url: directUrl
      });
      console.log('onUpload成功');
      
      // 成功通知を表示
      toast.success('メディア情報を設定しました', {
        duration: 3000,
      });

      // プレビューを表示
      setShowPreview(true);
      
    } catch (error) {
      console.error('Error setting media:', error);
      toast.error('メディア情報の設定に失敗しました');
    } finally {
      console.log('処理完了、ローディング解除');
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 現在設定されているURLとプレビュー */}
      {(currentUrl || showPreview) && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <p className="text-sm text-gray-600">現在のURL:</p>
            <code className="text-xs bg-white p-2 rounded block mt-1 overflow-x-auto">
              {currentUrl || directUrl}
            </code>
          </div>
          
          {type === 'video' && (
            <div className="relative w-full pt-[56.25%]">
              <iframe
                src={currentUrl || directUrl}
                className="absolute top-0 left-0 w-full h-full rounded"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}

      <input
        type="text"
        value={directUrl}
        onChange={(e) => setDirectUrl(e.target.value)}
        placeholder="https://iframe.mediadelivery.net/play/..."
        className="w-full rounded-lg p-3 border focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      <button
        onClick={(e) => {
          e.preventDefault();
          handleDirectUrlSubmit();
        }}
        disabled={isUploading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {isUploading ? '設定中...' : 'URLを設定'}
      </button>

      {/* デバッグ情報 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs space-y-1">
          <p>isUploading: {isUploading.toString()}</p>
          <p>directUrl: {directUrl}</p>
          <p>currentUrl: {currentUrl}</p>
          <p>showPreview: {showPreview.toString()}</p>
        </div>
      )}
    </div>
  );
}
// frontend/src/app/admin/courses/[courseId]/chapters/components/MediaUpload.tsx

'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/theme';
import { toast } from 'react-hot-toast';

interface MediaUploadProps {
  type: 'video' | 'audio';
  currentVideoId?: string;
  onUpload: (data: { videoId: string }) => void;
  courseId: string;
  chapterId: string;
}

interface MuxAsset {
  id: string;           // Asset ID
  playback_id: string;  // 配列ではなく単一の文字列に変更
  created_at: string;
  status: string;
  duration: number;
  max_stored_resolution: string;
  aspect_ratio: string;
  resolution_tier: string;
  max_stored_frame_rate: number;
  title: string;
  is_audio: boolean;  // 追加

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
  const [muxAssets, setMuxAssets] = useState<MuxAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const validateVideoId = (id: string): boolean => {
    return /^[a-zA-Z0-9-]+$/.test(id);
  };

  const handleUpdateTitle = async (assetId: string, newTitle: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/admin/assets/${assetId}/title`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to update title');
      }

      setMuxAssets(muxAssets.map(asset => 
        asset.id === assetId ? { ...asset, title: newTitle } : asset
      ));
      setEditingAssetId(null);
      toast.success('タイトルを更新しました');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('タイトルの更新に失敗しました');
    }
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

// fetchMuxAssets関数の修正部分
 useEffect(() => {
  const fetchMuxAssets = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/admin/assets`);
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      const data = await response.json();
      
      // オーディオとビデオを適切にフィルタリング
      const filteredAssets = data.data.filter((asset: MuxAsset) => {
        // オーディオの場合は、オーディオトラックのみを持つアセットをフィルタリング
        if (type === 'audio') {
          return asset.max_stored_resolution === null && asset.aspect_ratio === null;
        }
        // ビデオの場合は、ビデオトラックを持つアセットをフィルタリング
        return asset.max_stored_resolution !== null && asset.aspect_ratio !== null;
      });

      setMuxAssets(filteredAssets);
      console.log('Filtered assets:', filteredAssets);
    } catch (error) {
      console.error('Error fetching Mux assets:', error);
      toast.error(`${type === 'audio' ? '音声' : '動画'}リストの取得に失敗しました`);
    } finally {
      setIsLoading(false);
    }
  };

  fetchMuxAssets();
}, [type]);
return (
  <div className="space-y-6">
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
        {isUploading ? '設定中...' : `${type === 'audio' ? '音声' : '動画'}として設定`}
      </button>
    </div>

    {isUploading && (
      <div className="mt-4">
        <div className="animate-pulse flex justify-center items-center py-2">
          <span className="text-blue-500">設定中...</span>
        </div>
      </div>
    )}

    <div className="mt-8">
      <h3 className={`text-lg font-semibold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        アップロード済みアセット一覧
      </h3>
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-700 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {muxAssets.map((asset) => (
            <div
              key={asset.id}
              className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              } hover:bg-opacity-90 transition-colors`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-32 h-20 bg-gray-800 rounded overflow-hidden">
                  <img
                    src={`https://image.mux.com/${asset.playback_id}/thumbnail.jpg?time=30`}
                    alt="thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  {editingAssetId === asset.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="w-full rounded p-1 text-black"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateTitle(asset.id, editingTitle)}
                        className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingAssetId(null)}
                        className="px-2 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {asset.title || 'Untitled'}
                      </p>
                      <button
                        onClick={() => {
                          setEditingAssetId(asset.id);
                          setEditingTitle(asset.title || '');
                        }}
                        className="p-1 text-sm text-gray-400 hover:text-gray-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-400">Asset ID: {asset.id}</p>
                  <p className="text-sm text-gray-400">Playback ID: {asset.playback_id}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(Number(asset.created_at) * 1000).toLocaleDateString('ja-JP')}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setVideoId(asset.playback_id);
                    setShowPreview(true);
                  }}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    type === 'audio'
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {type === 'audio' ? '音声として選択' : '動画として選択'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
}
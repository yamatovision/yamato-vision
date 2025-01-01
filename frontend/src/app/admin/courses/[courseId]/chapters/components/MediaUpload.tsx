'use client';

import { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/theme';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';

interface MediaUploadProps {
  type: 'video' | 'audio';
  currentUrl?: string;
  onUpload: (url: string) => void;
  courseId: string;
  chapterId: string;
}

export function MediaUpload({
  type,
  currentUrl,
  onUpload,
  courseId,
  chapterId
}: MediaUploadProps) {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    const validTypes = type === 'video' 
      ? ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']
      : ['audio/mpeg', 'audio/wav', 'audio/mp3'];

    const validExtensions = type === 'video'
      ? ['.mp4', '.mov', '.webm', '.m4v']
      : ['.mp3', '.wav'];

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast.error(`無効なファイル形式です。${type === 'video' ? '動画' : '音声'}ファイルを選択してください。`);
      return;
    }

    setIsUploading(true);
    setProgress(0);
    try {
      console.log('Starting upload process for file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
    
      // Step 1: アップロードURLの取得
      console.log('Requesting upload URL...');
      const response = await fetch('/api/media/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type
        })
      });
    
      console.log('Upload URL response status:', response.status);
      const responseData = await response.json();
      console.log('Upload URL response data:', responseData);
    
      if (!response.ok) {
        throw new Error(`Failed to get upload URL: ${JSON.stringify(responseData)}`);
      }
    
      const { id, uploadUrl, cdnUrl } = responseData;
      console.log('Received upload details:', { id, uploadUrl, cdnUrl });
    
      // Step 2: 実際のファイルアップロード
      console.log('Starting file upload to Bunny.net...');
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'AccessKey': '55f77d60-a593-4210-be4ec78e69bc-5ea3-4168',
          'Content-Type': 'application/octet-stream'
        },
        body: file
      });
    
      console.log('Upload response status:', uploadResponse.status);
      const uploadResponseText = await uploadResponse.text();
      console.log('Upload response body:', uploadResponseText);
    
      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file: ${uploadResponseText}`);
      }
    
      // Step 3: CDN URLを使用
      console.log('Upload successful, using CDN URL:', cdnUrl);
      onUpload(cdnUrl);
      toast.success('ファイルのアップロードが完了しました');
    
    } catch (error) {
      console.error('Upload error:', {
        message: error.message,
        stack: error.stack,
        error
      });
      toast.error('ファイルのアップロードに失敗しました');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          theme === 'dark'
            ? 'border-gray-600 hover:border-gray-500'
            : 'border-gray-300 hover:border-gray-400'
        } transition-colors cursor-pointer`}
      >
        {currentUrl ? (
          <div className="space-y-2">
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              現在のファイル:
            </p>
            {type === 'video' ? (
              <video
                src={currentUrl}
                className="max-w-full h-auto"
                controls
              />
            ) : (
              <audio
                src={currentUrl}
                className="w-full"
                controls
              />
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="file"
              accept={type === 'video' 
                ? 'video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm' 
                : 'audio/mpeg,audio/wav,audio/mp3,.mp3,.wav'}
              onChange={handleFileSelect}
              className="hidden"
              id="media-upload"
            />
            <label
              htmlFor="media-upload"
              className="cursor-pointer block">
              <div className={`text-lg mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {isUploading ? (
                  `アップロード中... ${progress}%`
                ) : (
                  <>
                    クリックまたはドラッグ&ドロップで
                    {type === 'video' ? '動画' : '音声'}
                    をアップロード
                  </>
                )}
              </div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {type === 'video' 
                  ? 'MP4, MOV, WebM形式'
                  : 'MP3, WAV形式'
                }
              </p>
            </label>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                theme === 'dark' ? 'text-blue-400 bg-blue-900' : 'text-blue-600 bg-blue-200'
              }`}>
                アップロード中
              </span>
            </div>
            <div className={`text-right ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span className="text-xs font-semibold">
                {progress}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
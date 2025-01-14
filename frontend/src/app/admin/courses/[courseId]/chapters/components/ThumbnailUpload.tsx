'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { FileUpload } from '../../../components/FileUpload';
import { uploadToCloudinary } from '@/lib/api/cloudinaryUpload';
import { toast } from 'react-hot-toast';

interface ThumbnailUploadProps {
  currentUrl?: string;
  onUpload: (url: string) => void;
  folder?: string;
}

export function ThumbnailUpload({ 
  currentUrl, 
  onUpload,
  folder = 'chapter-thumbnails'
}: ThumbnailUploadProps) {
  const { theme } = useTheme();
  const [isUploading, setIsUploading] = useState(false);

  // ThumbnailUpload.tsx
const handleUpload = async (file: File | null) => {
  if (!file) {
    console.log('No file selected');
    onUpload('');
    return;
  }

  try {
    setIsUploading(true);
    console.log('Uploading file:', file.name);
    const url = await uploadToCloudinary(file, folder);
    console.log('Received URL from Cloudinary:', url);
    onUpload(url);
    toast.success('サムネイルを更新しました');
  } catch (error) {
    console.error('Thumbnail upload error:', error);
    toast.error('サムネイルのアップロードに失敗しました');
  } finally {
    setIsUploading(false);
  }
};

  return (
    <div className="space-y-4">
      <FileUpload
        accept="image/*"
        onUpload={handleUpload}
        currentUrl={currentUrl}
        label="サムネイル画像"
      />
      {isUploading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
        </div>
      )}
    </div>
  );
}
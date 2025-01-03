'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/theme';

interface FileUploadProps {
  accept?: string;
  onUpload: (file: File | null) => void;
  currentUrl?: string;
  label: string;
}

export function FileUpload({ accept, onUpload, currentUrl, label }: FileUploadProps) {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string>(currentUrl || '');

  // プレビューを更新する関数
  const updatePreview = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (!file && currentUrl) {
      setPreview(currentUrl);
    } else {
      setPreview('');
    }
  };

  // currentUrl が変更された時にプレビューを更新
  useEffect(() => {
    setPreview(currentUrl || '');
  }, [currentUrl]);

  const handleFile = (file: File | null) => {
    updatePreview(file);
    onUpload(file);
  };

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${
        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
      }`}>
        {label}
      </label>
      
      <div
        className={`border-2 border-dashed rounded-lg p-4 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : theme === 'dark'
            ? 'border-gray-600 hover:border-gray-500'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        {preview ? (
          <div className="space-y-4">
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleFile(null)}
                className="text-sm text-red-500 hover:text-red-600"
              >
                削除
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              画像をドラッグ&ドロップ、または
            </div>
            <label className="cursor-pointer inline-block">
              <span className="text-blue-500 hover:text-blue-600">
                ファイルを選択
              </span>
              <input
                type="file"
                className="hidden"
                accept={accept}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  handleFile(file || null);
                }}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
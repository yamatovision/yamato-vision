'use client';

import { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/theme';

interface FileUploadProps {
  accept?: string;
  onUpload: (file: File) => void;
  currentUrl?: string;
  label: string;
}

export function FileUpload({ accept, onUpload, currentUrl, label }: FileUploadProps) {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string>(currentUrl || '');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      onUpload(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${
        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
      }`}>
        {label}
      </label>
      
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : theme === 'dark'
            ? 'border-gray-600 hover:border-gray-500'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {preview ? (
          <div className="relative">
            {preview.startsWith('data:image/') && (
              <img
                src={preview}
                alt="Preview"
                className="max-h-40 mx-auto rounded"
              />
            )}
            <div className="mt-2">
              <button
                onClick={() => {
                  setPreview('');
                  onUpload(null as any);
                }}
                className="text-sm text-red-500 hover:text-red-600"
              >
                削除
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              ドラッグ&ドロップ、または
            </div>
            <label className="cursor-pointer inline-block">
              <span className="text-blue-500 hover:text-blue-600">ファイルを選択</span>
              <input
                type="file"
                className="hidden"
                accept={accept}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

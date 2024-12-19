'use client';

import { useTheme } from '@/context/ThemeContext';

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: 'pdf' | 'image' | 'other';
  url: string;
}

interface AttachmentFilesProps {
  files: AttachmentFile[];
}

export function AttachmentFiles({ files }: AttachmentFilesProps) {
  const { theme } = useTheme();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'image':
        return '🖼️';
      default:
        return '📎';
    }
  };

  return (
    <div className={`${
      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
    } rounded-lg p-4`}>
      <h3 className={`text-sm font-medium mb-3 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
      }`}>
        添付ファイル
      </h3>
      
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className={`flex items-center justify-between p-2 rounded ${
              theme === 'dark' ? 'bg-gray-600' : 'bg-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{getFileIcon(file.type)}</span>
              <div>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {file.name}
                </p>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            
            <a
              href={file.url}
              download
              className={`px-3 py-1 rounded text-sm ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-800 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              } transition-colors`}
            >
              ⬇️ Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

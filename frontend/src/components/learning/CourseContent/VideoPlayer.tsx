'use client';

import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

export function VideoPlayer() {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <div className={`${
      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
    } aspect-video rounded-lg flex items-center justify-center relative group cursor-pointer`}
    onClick={() => setIsPlaying(!isPlaying)}>
      {!isPlaying ? (
        <div className="text-center">
          <div className={`text-5xl mb-2 ${
            theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
          } group-hover:scale-110 transition-transform`}>
            ▶️
          </div>
          <div className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            タップして再生
          </div>
        </div>
      ) : (
        <video 
          className="w-full h-full rounded-lg"
          controls
          autoPlay
        >
          <source src="/sample-video.mp4" type="video/mp4" />
          お使いのブラウザは動画再生に対応していません。
        </video>
      )}

      {/* コントロールバー（仮実装） */}
      <div className={`absolute bottom-0 left-0 right-0 ${
        isPlaying ? 'hidden' : 'block'
      } p-4 bg-gradient-to-t ${
        theme === 'dark' 
          ? 'from-gray-900/80 to-transparent' 
          : 'from-gray-800/50 to-transparent'
      }`}>
        <div className="flex items-center space-x-4">
          <span className={`text-sm ${
            theme === 'dark' ? 'text-white' : 'text-white'
          }`}>00:00 / 45:30</span>
          <div className="flex-1 h-1 bg-gray-300/30 rounded-full">
            <div className="w-0 h-1 bg-blue-500 rounded-full"/>
          </div>
        </div>
      </div>
    </div>
  );
}

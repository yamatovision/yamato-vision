'use client';

import { useTheme } from '@/contexts/theme';
import { useState, useRef, useEffect } from 'react';
import { useMediaProgress } from '@/lib/hooks/useMediaProgress';

interface AudioPlayerProps {
  url: string;
  courseId: string;
  chapterId: string;
  transcription?: string;
  onCompletion?: () => Promise<void>; // 追加
  completed?: boolean; // 追加
}

export function AudioPlayer({ url, courseId, chapterId, transcription }: AudioPlayerProps) {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 進捗管理フックの追加
  const { position, setPosition, isLoading } = useMediaProgress(courseId, chapterId);

  // 初期位置の設定
  useEffect(() => {
    if (!isLoading && audioRef.current && position > 0) {
      audioRef.current.currentTime = position;
      setCurrentTime(position);
    }
  }, [isLoading, position]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 再生時間更新時
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime;
      setCurrentTime(newTime);
      setPosition(newTime);  // 進捗を保存
    }
  };
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const handleVolumeChange = () => {
    if (audioRef.current) {
      const newVolume = volume === 0 ? 1 : 0;
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handlePlaybackRateChange = () => {
    const rates = [1, 1.25, 1.5, 2, 0.5, 0.75];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
      setPlaybackRate(nextRate);
    }
  };
return (
    <div className={`${
      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
    } rounded-lg px-4 py-2`}>
      {isLoading ? (
        <div className="h-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            src={url}
          >
            {transcription && (
              <track
                kind="captions"
                src={transcription}
                label="日本語"
                default
              />
            )}
          </audio>
          
          <div className="flex items-center space-x-4">
            {/* 再生/一時停止ボタン */}
            <button
              onClick={handlePlayPause}
              className={`text-lg ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* 音量ボタン */}
            <button
              onClick={handleVolumeChange}
              className={`text-lg ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {volume === 0 ? '🔇' : '🔊'}
            </button>

            {/* 時間表示 */}
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* シークバー */}
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />

            {/* 再生速度 */}
            <button
              onClick={handlePlaybackRateChange}
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {playbackRate}x
            </button>
          </div>
        </>
      )}
    </div>
  );
}
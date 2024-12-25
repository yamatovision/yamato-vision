'use client';

import { useTheme } from '@/contexts/theme';
import { useEffect, useRef, useState } from 'react';

interface MediaPlayerProps {
  type: 'video' | 'audio';
  url: string;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
  initialTime?: number;
}

export function MediaPlayer({
  type,
  url,
  onTimeUpdate,
  onEnded,
  autoPlay = false,
  initialTime = 0
}: MediaPlayerProps) {
  const { theme } = useTheme();
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = initialTime;
    }
  }, [initialTime]);

  const handlePlay = () => {
    if (mediaRef.current) {
      mediaRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (mediaRef.current) {
      mediaRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      const time = mediaRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration);
      setIsLoading(false);
      if (autoPlay) {
        handlePlay();
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      const newMutedState = !isMuted;
      mediaRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (newMutedState) {
        mediaRef.current.volume = 0;
        setVolume(0);
      } else {
        mediaRef.current.volume = 1;
        setVolume(1);
      }
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const MediaElement = type === 'video' ? 'video' : 'audio';

  return (
    <div className={`rounded-lg overflow-hidden ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    } shadow-lg`}>
      <MediaElement
        ref={mediaRef as any}
        src={url}
        className="w-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onEnded}
      />

      <div className="p-4 space-y-4">
        {/* 再生コントロール */}
        <div className="flex items-center space-x-4">
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className={`p-2 rounded-full ${
              theme === 'dark'
                ? 'hover:bg-gray-700'
                : 'hover:bg-gray-100'
            }`}
            disabled={isLoading}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>

          {/* 時間表示 */}
          <div className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* 音量コントロール */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-full ${
                theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              {isMuted ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>

        {/* シークバー */}
        <div className="flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
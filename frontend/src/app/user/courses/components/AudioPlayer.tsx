'use client';

import { useTheme } from '@/contexts/theme';
import { useState, useRef } from 'react';

export function AudioPlayer() {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
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
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        src="/sample-audio.mp3"
      />
      
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
    </div>
  );
}

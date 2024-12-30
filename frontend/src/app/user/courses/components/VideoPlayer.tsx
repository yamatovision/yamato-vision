'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/theme';
import { useMediaProgress } from '@/lib/hooks/useMediaProgress';

interface VideoPlayerProps {
  url: string;
  courseId: string;  // 追加
  chapterId: string; // 追加
  transcription?: string;
}

export function VideoPlayer({ url, courseId, chapterId, transcription }: VideoPlayerProps) {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 進捗管理フックの追加
  const { position, setPosition, isLoading } = useMediaProgress(courseId, chapterId);

  // 初期位置の設定
  useEffect(() => {
    if (!isLoading && videoRef.current && position > 0) {
      videoRef.current.currentTime = position;
      setCurrentTime(position);
    }
  }, [isLoading, position]);

  // 動画メタデータ読み込み完了時
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // 再生時間更新時
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime;
      setCurrentTime(newTime);
      setPosition(newTime);  // 進捗を保存
    }
  };

  // 再生/一時停止の切り替え
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // シークバーの操作
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // 音量の切り替え
  const handleVolumeToggle = () => {
    if (videoRef.current) {
      const newVolume = volume === 0 ? 1 : 0;
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  // 再生速度の切り替え
  const handlePlaybackRateChange = () => {
    const rates = [0.5, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
      setPlaybackRate(nextRate);
    }
  };

  // フルスクリーンの切り替え
  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // 時間のフォーマット
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // フルスクリーン状態の監視
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  return (
    <div 
      ref={containerRef}
      className={`relative rounded-lg overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
      }`}
    >
      {isLoading ? (
        <div className="w-full aspect-video flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          {/* メインビデオ要素 */}
          <video
            ref={videoRef}
            className="w-full aspect-video"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={url} type="video/mp4" />
            {transcription && (
              <track
                kind="captions"
                src={transcription}
                label="日本語"
                default
              />
            )}
          </video>

          {/* コントロールオーバーレイ */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t ${
            theme === 'dark' 
              ? 'from-black/80 to-transparent' 
              : 'from-black/60 to-transparent'
          }`}>
            {/* シークバー */}
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 mb-4 rounded-lg appearance-none cursor-pointer
                bg-gray-300 accent-blue-500"
            />

            {/* コントロールボタン群 */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                {/* 再生/一時停止ボタン */}
                <button
                  onClick={handlePlayPause}
                  className="hover:text-blue-400 transition-colors"
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>

                {/* 音量ボタン */}
                <button
                  onClick={handleVolumeToggle}
                  className="hover:text-blue-400 transition-colors"
                >
                  {volume === 0 ? '🔇' : '🔊'}
                </button>

                {/* 時間表示 */}
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* 再生速度 */}
                <button
                  onClick={handlePlaybackRateChange}
                  className="text-sm hover:text-blue-400 transition-colors"
                >
                  {playbackRate}x
                </button>

                {/* フルスクリーン切り替え */}
                <button
                  onClick={handleFullscreenToggle}
                  className="hover:text-blue-400 transition-colors"
                >
                  {isFullscreen ? '⊹' : '⊿'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 
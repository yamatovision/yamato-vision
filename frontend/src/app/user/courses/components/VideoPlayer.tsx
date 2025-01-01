'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/theme';
import { useMediaProgress } from '@/lib/hooks/useMediaProgress';
import { toast } from 'react-hot-toast';

interface VideoPlayerProps {
  url: string;
  courseId: string;
  chapterId: string;
  transcription?: string;
  onCompletion?: () => void;  // 完了時のコールバック追加
}

export function VideoPlayer({ 
  url, 
  courseId, 
  chapterId, 
  transcription,
  onCompletion 
}: VideoPlayerProps) {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // UI状態
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 進捗管理
  const {
    position,
    duration,
    isCompleted,
    isLoading,
    setProgress,
  } = useMediaProgress(courseId, chapterId);

  // 完了通知の表示（一度だけ）
  useEffect(() => {
    if (isCompleted && onCompletion) {
      toast.success('レッスンを完了しました！');
      onCompletion();
    }
  }, [isCompleted, onCompletion]);

  // 初期位置の設定
  useEffect(() => {
    if (!isLoading && videoRef.current && position > 0) {
      videoRef.current.currentTime = position;
    }
  }, [isLoading, position]);

  // メディア更新ハンドラー
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const videoDuration = videoRef.current.duration;
      setProgress(currentTime, videoDuration);
    }
  };

  // 再生コントロール
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
    }
  };

  // 音量コントロール
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

  // フルスクリーン切り替え
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

  // 進捗表示
  const getProgressPercentage = () => {
    if (duration === 0) return 0;
    return (position / duration) * 100;
  };

  return (
    <div className="space-y-2">
      {/* プログレスバー */}
      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* ビデオプレイヤー */}
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
            <video
              ref={videoRef}
              className="w-full aspect-video"
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

            {/* コントロール */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t ${
              theme === 'dark' 
                ? 'from-black/80 to-transparent' 
                : 'from-black/60 to-transparent'
            }`}>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePlayPause}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                  <button
                    onClick={handleVolumeToggle}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {volume === 0 ? '🔇' : '🔊'}
                  </button>
                  <span className="text-sm">
                    {formatTime(position)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePlaybackRateChange}
                    className="text-sm hover:text-blue-400 transition-colors"
                  >
                    {playbackRate}x
                  </button>
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

      {/* 完了状態表示 */}
      {isCompleted && (
        <div className="text-sm text-green-500 font-medium mt-2">
          ✓ 視聴完了
        </div>
      )}
    </div>
  );
}
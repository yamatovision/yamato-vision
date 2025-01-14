'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/theme';
import { useMediaProgress } from '@/lib/hooks/useMediaProgress';

interface AudioPlayerProps {
  videoId: string;
  courseId: string;
  chapterId: string;
  transcription?: string;
  onCompletion?: () => void;
  completed?: boolean;
}

export function AudioPlayer({ 
  videoId,
  courseId, 
  chapterId, 
  transcription,
  onCompletion,
  completed: initialCompleted 
}: AudioPlayerProps) {
  const { theme } = useTheme();
  const playerRef = useRef<any>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showPlaybackRates, setShowPlaybackRates] = useState(false);
  
  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const {
    position,
    watchRate,
    isCompleted,
    saveProgress
  } = useMediaProgress({
    videoId,
    courseId,
    chapterId
  });

  useEffect(() => {
    if (!customElements.get('mux-player')) {
      import('@mux/mux-player')
        .then(() => console.log('Mux Player imported successfully'))
        .catch(error => console.error('Error importing Mux Player:', error));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (volumeControlRef.current && !volumeControlRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!playerRef.current) return;

    const player = playerRef.current;

    if (position > 0) {
      player.currentTime = position;
    }

    player.playbackRate = playbackRate;
    player.volume = volume;
    player.muted = isMuted;

    const handleTimeUpdate = () => {
      const time = player.currentTime;
      setCurrentTime(time);
      if (player.duration) {
        saveProgress(time, player.duration);
      }
    };

    const handleDurationChange = () => setDuration(player.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    player.addEventListener('timeupdate', handleTimeUpdate);
    player.addEventListener('durationchange', handleDurationChange);
    player.addEventListener('play', handlePlay);
    player.addEventListener('pause', handlePause);

    return () => {
      player.removeEventListener('timeupdate', handleTimeUpdate);
      player.removeEventListener('durationchange', handleDurationChange);
      player.removeEventListener('play', handlePlay);
      player.removeEventListener('pause', handlePause);
    };
  }, [position, saveProgress, playbackRate, volume, isMuted]);

  const handlePlaybackRateChange = (rate: number) => {
    if (playerRef.current) {
      playerRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowPlaybackRates(false);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (playerRef.current) {
      playerRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      const newMutedState = !isMuted;
      playerRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const VolumeIcon = () => {
    if (isMuted || volume === 0) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      );
    }
    if (volume < 0.5) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657a8 8 0 100-11.314" />
      </svg>
    );
  };

  return (
    <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50 backdrop-blur-sm'} p-4 shadow-lg`}>
      <mux-player
        ref={playerRef}
        playback-id={videoId}
        stream-type="on-demand"
        prefer-playback="audio"
        metadata-video-title={`Chapter ${courseId} Audio`}
        primary-color="#3B82F6"
        style={{ display: 'none' }}
      />

      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              if (playerRef.current) {
                if (isPlaying) {
                  playerRef.current.pause();
                } else {
                  playerRef.current.play().catch(error => {
                    console.error('Playback error:', error);
                  });
                }
              }
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
              theme === 'dark' 
                ? 'bg-blue-500 hover:bg-blue-400' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white shadow-md hover:scale-105`}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="flex-1 space-y-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const time = parseFloat(e.target.value);
                if (playerRef.current) {
                  playerRef.current.currentTime = time;
                }
              }}
              className="w-full h-1.5 appearance-none rounded-full bg-gray-300 dark:bg-gray-600 accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* 音量コントロール */}
          <div ref={volumeControlRef} className="relative">
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700/50' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <VolumeIcon />
            </button>
            
            {showVolumeSlider && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 rounded-lg shadow-lg bg-white dark:bg-gray-700 backdrop-blur-lg">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="h-24"
                  style={{ 
                    writingMode: 'bt-lr', 
                    WebkitAppearance: 'slider-vertical',
                    cursor: 'pointer'
                  }}
                />
              </div>
            )}
          </div>

          {/* 倍速コントロール */}
          <div className="relative">
            <button
              onClick={() => setShowPlaybackRates(!showPlaybackRates)}
              className={`px-2 py-1 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {playbackRate}x
            </button>

            {showPlaybackRates && (
              <div className="absolute bottom-full right-0 mb-2 py-1 rounded-lg shadow-lg bg-white dark:bg-gray-700 backdrop-blur-lg">
                {playbackRates.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`block w-full px-4 py-1 text-sm text-left transition-colors
                      ${rate === playbackRate 
                        ? 'bg-blue-500 text-white' 
                        : theme === 'dark'
                          ? 'text-gray-200 hover:bg-gray-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {(isCompleted || initialCompleted) && (
          <div className="text-sm text-green-500 font-medium flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>視聴完了 ({Math.floor(watchRate)}%)</span>
          </div>
        )}
      </div>
    </div>
  );
}
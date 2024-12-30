'use client';

import { useState, useEffect } from 'react';
import { ToastType, LevelUpData, ExperienceGainData } from '@/types/toast';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  levelUpData?: LevelUpData;
  experienceData?: ExperienceGainData;
}

export function Toast({ message, type, onClose, levelUpData, experienceData }: ToastProps) {
  // 自動で消える経験値通知用
  useEffect(() => {
    if (type === 'experienceGain') {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  // 経験値獲得通知
  if (type === 'experienceGain' && experienceData) {
    return (
      <div className="animate-slide-up fixed bottom-4 right-4 bg-gradient-to-r from-green-600 to-green-400 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">✨</span>
          <div>
            <div className="text-sm font-medium">経験値獲得！</div>
            <div className="text-xl font-bold">+{experienceData.amount} EXP</div>
          </div>
        </div>
      </div>
    );
  }

  // レベルアップモーダル（既存の実装を活用）
  if (type === 'levelUp' && levelUpData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="max-w-md mx-auto w-full px-4">
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-lg p-6 text-center text-white">
            <div className="text-2xl mb-2">🎊 Level Up! 🎊</div>
            
            <div className="text-3xl font-bold mb-4">
              Lv.{levelUpData.oldLevel} → Lv.{levelUpData.newLevel}
            </div>

            {levelUpData.experienceGained && (
              <div className="bg-yellow-500/30 rounded-lg p-3 mb-4">
                <div className="text-lg font-bold">獲得経験値</div>
                <div className="text-2xl text-yellow-100">
                  +{levelUpData.experienceGained} EXP
                </div>
              </div>
            )}
            
            <div className="text-lg bg-yellow-500/30 rounded-lg p-3 mb-6">
              {levelUpData.message || 'おめでとうございます！'}
            </div>
            
            <button
              onClick={onClose}
              className="w-full bg-white text-yellow-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              次へ進む
            </button>
          </div>
        </div>
      </div>
    );
  }

  // その他の通常のトースト通知
  const baseStyle = "p-4 rounded-md shadow-lg flex items-center justify-between";
  const typeStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-yellow-500 text-white"
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type as keyof typeof typeStyles]}`}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
}
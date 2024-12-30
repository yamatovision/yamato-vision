'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../app/user/shared/Toast';

// LevelUpData型の定義を追加
interface LevelUpData {
  newLevel: number;
  rewards?: {
    gems?: number;
    items?: string[];
  };
}

interface NotificationContextType {
  showExperienceGain: (amount: number) => void;
  showLevelUp: (levelUpData: LevelUpData) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  showExperienceGain: () => {},
  showLevelUp: () => {}
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [experienceNotification, setExperienceNotification] = useState<{
    amount: number;
    visible: boolean;
  } | null>(null);
  const [levelUpQueue, setLevelUpQueue] = useState<LevelUpData[]>([]);

  const showExperienceGain = useCallback((amount: number) => {
    setExperienceNotification({ amount, visible: true });
    setTimeout(() => {
      setExperienceNotification(null);
    }, 3000);
  }, []);

  const showLevelUp = useCallback((levelUpData: LevelUpData) => {
    setLevelUpQueue(prev => [...prev, levelUpData]);
  }, []);

  const handleLevelUpClose = useCallback(() => {
    setLevelUpQueue(prev => prev.slice(1));
  }, []);

  return (
    <NotificationContext.Provider value={{ showExperienceGain, showLevelUp }}>
      <>
        {children}
        
        {/* 経験値獲得通知 */}
        {experienceNotification && (
          <div className="fixed top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold animate-fade-in">
            +{experienceNotification.amount} EXP
          </div>
        )}

        {/* レベルアップ通知 */}
        {levelUpQueue.length > 0 && (
          <Toast
            type="levelUp"
            message=""
            levelUpData={levelUpQueue[0]}
            onClose={handleLevelUpClose}
          />
        )}
      </>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
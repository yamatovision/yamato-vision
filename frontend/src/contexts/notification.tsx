'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../app/user/shared/Toast';

interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  message: string | null;
  experienceGained: number;
}

interface NotificationContextType {
  showExperienceGain: (amount: number) => void;
  showLevelUp: (levelUpData: LevelUpData) => void;
  previousExp: number | null;
  previousLevel: number | null;
  setPreviousExp: (exp: number) => void;
  setPreviousLevel: (level: number) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  showExperienceGain: () => {},
  showLevelUp: () => {},
  previousExp: null,
  previousLevel: null,
  setPreviousExp: () => {},
  setPreviousLevel: () => {}
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [experienceNotification, setExperienceNotification] = useState<{
    amount: number;
    visible: boolean;
    isLeaving: boolean;
  } | null>(null);
  const [levelUpQueue, setLevelUpQueue] = useState<LevelUpData[]>([]);
  const [previousExp, setPreviousExp] = useState<number | null>(null);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);

  // 既存の通知表示ロジックはそのまま
  const showExperienceGain = useCallback((amount: number) => {
    setExperienceNotification({ amount, visible: true, isLeaving: false });
    
    setTimeout(() => {
      setExperienceNotification(prev => 
        prev ? { ...prev, isLeaving: true } : null
      );
    }, 2700);

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
    <NotificationContext.Provider value={{ 
      showExperienceGain, 
      showLevelUp,
      previousExp,
      previousLevel,
      setPreviousExp,
      setPreviousLevel
    }}>
      <div className="relative">
        {children}
        
        <div className="notification-container fixed top-0 right-0 z-50 pointer-events-none">
          {experienceNotification && (
            <div className={`
              fixed top-4 right-4 
              bg-yellow-400 text-black px-4 py-2 
              rounded-full font-bold 
              pointer-events-none
              ${experienceNotification.isLeaving ? 'animate-fade-out-down' : 'animate-fade-in-up'}
            `}>
              +{experienceNotification.amount} EXP
            </div>
          )}

          {levelUpQueue.length > 0 && (
            <div className="pointer-events-auto">
              <Toast
                type="levelUp"
                message=""
                levelUpData={levelUpQueue[0]}
                onClose={handleLevelUpClose}
              />
            </div>
          )}
        </div>
      </div>
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
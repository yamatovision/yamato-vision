'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Toast } from '@/app/user/shared/Toast';
import { ToastType, LevelUpData, ExperienceGainData } from '@/types/toast';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  levelUpData?: LevelUpData;
  experienceData?: ExperienceGainData;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, data?: LevelUpData | ExperienceGainData) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType, data?: LevelUpData | ExperienceGainData) => {
    const id = Date.now();
    const newToast: ToastMessage = { id, message, type };
  
    if (type === 'levelUp' && data) {
      newToast.levelUpData = data as LevelUpData;
    } else if (type === 'experienceGain' && data) {
      newToast.experienceData = data as ExperienceGainData;
    }
  
    setToasts(prev => [...prev, newToast]);
    
    if (type !== 'levelUp') {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 3000);
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            levelUpData={toast.levelUpData}
            experienceData={toast.experienceData}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
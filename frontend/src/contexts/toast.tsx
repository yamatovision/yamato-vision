// frontend/src/contexts/toast.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Toast } from '@/app/user/shared/Toast';

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'levelUp';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  levelUpData?: LevelUpData;
}

interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  message: string | null;
  experienceGained?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, levelUpData?: LevelUpData) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType, levelUpData?: LevelUpData) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, levelUpData }]);

    // レベルアップ通知の場合は自動で消えないようにする
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
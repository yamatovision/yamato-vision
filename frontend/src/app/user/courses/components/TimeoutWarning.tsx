'use client';

import { useTheme } from '@/contexts/theme';
import { TimeoutSeverity } from '@/types/timeout';

interface TimeoutWarningProps {
  severity: TimeoutSeverity;
  type: 'chapter' | 'course';
  onClose?: () => void;
}

export function TimeoutWarning({ severity, type, onClose }: TimeoutWarningProps) {
  const { theme } = useTheme();

  const getSeverityStyles = () => {
    const styles = {
      warning: {
        bg: theme === 'dark' ? 'bg-yellow-900/50' : 'bg-yellow-50',
        border: 'border-yellow-500',
        text: theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'
      },
      danger: {
        bg: theme === 'dark' ? 'bg-red-900/50' : 'bg-red-50',
        border: 'border-red-500',
        text: theme === 'dark' ? 'text-red-200' : 'text-red-800'
      }
    };
    return styles[severity === 'normal' ? 'warning' : severity];
  };

  const getMessage = () => {
    if (type === 'chapter') {
      return severity === 'danger' 
        ? '⚠️ チャプターの制限時間まで残りわずかです。課題の提出をお急ぎください。'
        : '制限時間が近づいています。計画的に進めましょう。';
    } else {
      return severity === 'danger'
        ? '⚠️ コースの期限が迫っています。完了まで時間が限られています。'
        : 'コースの期限にご注意ください。';
    }
  };

  if (severity === 'normal') return null;

  const styles = getSeverityStyles();

  return (
    <div className={`
      ${styles.bg} ${styles.text} 
      border ${styles.border}
      rounded-lg p-4 mb-4
      flex justify-between items-center
    `}>
      <div className="flex items-center">
        <span className="text-sm font-medium">
          {getMessage()}
        </span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-sm font-medium hover:opacity-80"
        >
          ✕
        </button>
      )}
    </div>
  );
}

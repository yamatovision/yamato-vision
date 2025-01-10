// ProgressStages.tsx
'use client';

import { useTheme } from '@/contexts/theme';

interface ProgressStagesProps {
  lessonWatchRate: number;
  status: string;
  score?: number;
}

export function ProgressStages({ lessonWatchRate, status, score }: ProgressStagesProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const baseStageStyle = `
    w-1/3 rounded-lg p-3 text-center transition-all duration-200
    ${isDark ? 'bg-opacity-20' : 'shadow-md'}
  `;

  const getLessonStage = () => {
    if (status === 'COMPLETED') {
      return {
        icon: '✓',
        bgColor: isDark 
          ? 'bg-green-500/20' 
          : 'bg-green-50 border-green-200',
        textColor: isDark 
          ? 'text-green-400' 
          : 'text-green-600',
        animation: false,
        label: 'レッスン完了'
      };
    }
    
    if (lessonWatchRate < 95) {
      return {
        icon: '▶️',
        bgColor: isDark 
          ? 'bg-blue-500/20' 
          : 'bg-blue-50 border-blue-200',
        textColor: isDark 
          ? 'text-blue-400' 
          : 'text-blue-600',
        animation: true,
        label: 'レッスンを視聴しよう'
      };
    }

    return {
      icon: '✓',
      bgColor: isDark 
        ? 'bg-green-500/20' 
        : 'bg-green-50 border-green-200',
      textColor: isDark 
        ? 'text-green-400' 
        : 'text-green-600',
      animation: false,
      label: 'レッスン完了'
    };
  };

  const getTaskStage = () => {
    if (status === 'COMPLETED') {
      return {
        icon: '✓',
        bgColor: isDark 
          ? 'bg-green-500/20' 
          : 'bg-green-50 border-green-200',
        textColor: isDark 
          ? 'text-green-400' 
          : 'text-green-600',
        animation: false,
        label: '課題提出済'
      };
    }

    if (lessonWatchRate < 95) {
      return {
        icon: '📝',
        bgColor: isDark 
          ? 'bg-gray-700' 
          : 'bg-gray-50 border-gray-200',
        textColor: isDark 
          ? 'text-gray-400' 
          : 'text-gray-600',
        animation: false,
        label: '課題'
      };
    }

    return {
      icon: '✎',
      bgColor: isDark 
        ? 'bg-blue-500/20' 
        : 'bg-blue-50 border-blue-200',
      textColor: isDark 
        ? 'text-blue-400' 
        : 'text-blue-600',
      animation: true,
      label: '課題に挑戦'
    };
  };

  const getEvaluationStage = () => {
    if (status !== 'COMPLETED' || typeof score === 'undefined') {
      return {
        icon: '🔒',
        bgColor: isDark 
          ? 'bg-gray-700' 
          : 'bg-gray-50 border-gray-200',
        textColor: isDark 
          ? 'text-gray-400' 
          : 'text-gray-600',
        animation: false,
        label: '次のステージ'
      };
    }

    if (score >= 95) {
      return {
        icon: '👑',
        bgColor: isDark 
          ? 'bg-yellow-500/20' 
          : 'bg-yellow-50 border-yellow-200',
        textColor: isDark 
          ? 'text-yellow-400' 
          : 'text-yellow-600',
        animation: false,
        label: 'PERFECT'
      };
    }

    if (score >= 85) {
      return {
        icon: '⭐',
        bgColor: isDark 
          ? 'bg-blue-500/20' 
          : 'bg-blue-50 border-blue-200',
        textColor: isDark 
          ? 'text-blue-400' 
          : 'text-blue-600',
        animation: false,
        label: 'GREAT'
      };
    }

    if (score >= 70) {
      return {
        icon: '✓',
        bgColor: isDark 
          ? 'bg-green-500/20' 
          : 'bg-green-50 border-green-200',
        textColor: isDark 
          ? 'text-green-400' 
          : 'text-green-600',
        animation: false,
        label: 'GOOD'
      };
    }

    return {
      icon: '✓',
      bgColor: isDark 
        ? 'bg-red-500/20' 
        : 'bg-red-50 border-red-200',
      textColor: isDark 
        ? 'text-red-400' 
        : 'text-red-600',
      animation: false,
      label: 'PASS'
    };
  };

  const lessonStage = getLessonStage();
  const taskStage = getTaskStage();
  const evaluationStage = getEvaluationStage();

  return (
    <div className="flex items-center justify-between space-x-4 mb-6">
      <div className={`${baseStageStyle} ${lessonStage.bgColor}
        ${lessonStage.animation ? 'animate-pulse' : ''}`}>
        <div className={`text-2xl mb-1 ${lessonStage.textColor}`}>
          {lessonStage.icon}
        </div>
        <div className={`text-sm font-bold ${lessonStage.textColor}`}>
          {lessonStage.label}
        </div>
      </div>

      <div className={`${baseStageStyle} ${taskStage.bgColor}
        ${taskStage.animation ? 'animate-pulse' : ''}`}>
        <div className={`text-2xl mb-1 ${taskStage.textColor}`}>
          {taskStage.icon}
        </div>
        <div className={`text-sm font-bold ${taskStage.textColor}`}>
          {taskStage.label}
        </div>
      </div>

      <div className={`${baseStageStyle} ${evaluationStage.bgColor}`}>
        <div className={`text-2xl mb-1 ${evaluationStage.textColor}`}>
          {evaluationStage.icon}
        </div>
        <div className={`text-sm font-bold ${evaluationStage.textColor}`}>
          {evaluationStage.label}
        </div>
      </div>
    </div>
  );
}
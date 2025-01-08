// ProgressStages.tsx
'use client';

import { useTheme } from '@/contexts/theme';

interface ProgressStagesProps {
  lessonWatchRate: number;
  submission?: {
    score?: number;
    status?: string;
  };
  status: string;
  stages?: Array<{
    status: string;
    title: string;
  }>;
}


export function ProgressStages({ lessonWatchRate, submission, status }: ProgressStagesProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const baseStageStyle = `
  w-1/3 rounded-lg p-3 text-center transition-all duration-200
  ${isDark ? 'bg-opacity-20' : 'shadow-md'}  // shadow-sm から shadow-md に変更
`;


  const getLessonStage = () => {
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
        label: 'レッスン視聴中'
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
    if (!submission) {
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
      label: '課題提出済'
    };
  };

  const getEvaluationStage = () => {
    if (!submission?.score) {
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

    const score = submission.score;
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
      {/* レッスンステージ */}
      <div className={`${baseStageStyle} ${lessonStage.bgColor}
        ${lessonStage.animation ? 'animate-pulse' : ''}`}>
        <div className={`text-2xl mb-1 ${lessonStage.textColor}`}>
          {lessonStage.icon}
        </div>
        <div className={`text-sm font-bold ${lessonStage.textColor}`}>
          {lessonStage.label}
        </div>
      </div>

      {/* タスクステージ */}
      <div className={`${baseStageStyle} ${taskStage.bgColor}
        ${taskStage.animation ? 'animate-pulse' : ''}`}>
        <div className={`text-2xl mb-1 ${taskStage.textColor}`}>
          {taskStage.icon}
        </div>
        <div className={`text-sm font-bold ${taskStage.textColor}`}>
          {taskStage.label}
        </div>
      </div>

      {/* 評価ステージ */}
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
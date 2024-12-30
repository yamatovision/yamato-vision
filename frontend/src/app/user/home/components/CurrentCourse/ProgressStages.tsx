'use client';

import { useTheme } from '@/contexts/theme';
import { ChapterProgressInfo } from '../hooks/useCurrentCourse';

interface ProgressStagesProps {
  stages: {
    status: ChapterProgressInfo;
    title: string;
  }[];
}

export function ProgressStages({ stages }: ProgressStagesProps) {
  const { theme } = useTheme();

  const getStatusStyles = (type: ChapterProgressInfo['type']) => {
    const baseClasses = 'w-1/3 bg-opacity-20 rounded-lg p-3 text-center';
    
    switch (type) {
      case 'LESSON_IN_PROGRESS':
        return `${baseClasses} ${
          theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
        } animate-pulse`;
      case 'EXCELLENT':
        return `${baseClasses} ${
          theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'
        }`;
      case 'GOOD':
        return `${baseClasses} ${
          theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
        }`;
      case 'OK':
        return `${baseClasses} ${
          theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
        }`;
      case 'FAILED':
        return `${baseClasses} ${
          theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
        }`;
      case 'TASK_AWAITING':
        return `${baseClasses} ${
          theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'
        }`;
      default:
        return `${baseClasses} ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
        }`;
    }
  };

  const getIconColor = (type: ChapterProgressInfo['type']) => {
    switch (type) {
      case 'LESSON_IN_PROGRESS':
        return 'text-blue-400';
      case 'EXCELLENT':
        return 'text-yellow-400';
      case 'GOOD':
        return 'text-blue-400';
      case 'OK':
        return 'text-green-400';
      case 'FAILED':
        return 'text-red-400';
      case 'TASK_AWAITING':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="flex items-center justify-between space-x-4 mb-6">
      {stages.map((stage, index) => (
        <div
          key={index}
          className={getStatusStyles(stage.status.type)}
        >
          <div className={`text-2xl mb-1 ${getIconColor(stage.status.type)}`}>
            {stage.status.icon}
          </div>
          <div className={`text-sm font-bold ${getIconColor(stage.status.type)}`}>
            {stage.status.label}
          </div>
          <div className={`text-xs ${getIconColor(stage.status.type)}`}>
            {stage.title}
          </div>
        </div>
      ))}
    </div>
  );
}

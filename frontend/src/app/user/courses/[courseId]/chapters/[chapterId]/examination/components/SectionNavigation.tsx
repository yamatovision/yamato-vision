// frontend/src/app/user/courses/[courseId]/chapters/[chapterId]/examination/components/SectionNavigation.tsx

'use client';

import { ExamSectionResult } from '@/types/chapter';
import { useTheme } from '@/contexts/theme';

interface SectionNavigationProps {
  currentSection: number;
  sectionResults: ExamSectionResult[];
}

const SECTIONS = [
  { id: 1, title: 'ブルーランプの基本' },
  { id: 2, title: 'トークン管理' },
  { id: 3, title: 'AIファクトリー設計' }
];

export function SectionNavigation({ currentSection, sectionResults }: SectionNavigationProps) {
  const { theme } = useTheme();

  const getSectionStatus = (index: number) => {
    if (sectionResults[index]) return 'completed';
    if (index === currentSection) return 'current';
    if (index < currentSection) return 'available';
    return 'locked';
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-800 rounded-lg">
        <h2 className="text-lg font-medium text-white mb-4">試験の進捗</h2>

        {/* プログレスバー */}
        <div className="relative h-2 bg-gray-700 rounded-full mb-6">
          <div 
            className="absolute h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(100, (currentSection / SECTIONS.length) * 100)}%` 
            }}
          />
        </div>

        {/* セクションリスト */}
        <div className="space-y-3">
          {SECTIONS.map((section, index) => {
            const status = getSectionStatus(index);
            const result = sectionResults[index];

            return (
              <div
                key={section.id}
                className={`p-4 rounded-lg border ${
                  status === 'current'
                    ? 'bg-blue-900/30 border-blue-500'
                    : status === 'completed'
                    ? 'bg-gray-800/30 border-green-500'
                    : 'bg-gray-800/30 border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {/* ステータスアイコン */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      status === 'completed'
                        ? 'bg-green-500'
                        : status === 'current'
                        ? 'bg-blue-500'
                        : 'bg-gray-600'
                    }`}>
                      {status === 'completed' ? (
                        <CheckIcon className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-white text-sm">{index + 1}</span>
                      )}
                    </div>
                    
                    <h3 className="text-sm font-medium text-white">
                      {section.title}
                    </h3>
                  </div>

                  {/* 得点表示 */}
                  {result && (
                    <span className="text-sm font-medium text-green-400">
                      {result.score}点
                    </span>
                  )}
                </div>

                {/* フィードバック表示 */}
                {result && (
                  <div className="mt-2 text-sm text-gray-400 pl-9">
                    {result.feedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 注意事項 */}
      <div className="p-4 bg-yellow-900/30 border border-yellow-800 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-500 mb-2">
          注意事項
        </h3>
        <ul className="text-xs text-yellow-400 space-y-1">
          <li>• 前のセクションに戻ることができます</li>
          <li>• 回答は30秒ごとに自動保存されます</li>
          <li>• 制限時間が終了すると自動的に提出されます</li>
        </ul>
      </div>
    </div>
  );
}

// アイコンコンポーネント
function CheckIcon({ className = "w-6 h-6" }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M5 13l4 4L19 7" 
      />
    </svg>
  );
}
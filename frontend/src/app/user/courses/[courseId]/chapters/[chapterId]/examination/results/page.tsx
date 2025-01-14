// frontend/src/app/user/courses/[courseId]/chapters/[chapterId]/examination/results/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseApi } from '@/lib/api';
import { useTheme } from '@/contexts/theme';
import { useToast } from '@/contexts/toast';
import { ExamResult } from '@/types/api';  // 型をインポート



const GRADE_COLORS = {
  '秀': 'text-red-400',
  '優': 'text-blue-400',
  '良': 'text-green-400',
  '可': 'text-yellow-400',
  '不可': 'text-gray-400'
};

export default function ExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExamResult();
  }, []);

  const loadExamResult = async () => {
    try {
      const response = await courseApi.getExamResult(
        params.courseId as string,
        params.chapterId as string
      );
      
      if (response.success) {
        setResult(response.data as ExamResult);  // 型アサーションを追加
      } else {
        showToast('結果の取得に失敗しました', 'error');
      }
    } catch (error) {
      console.error('Failed to load exam result:', error);
      showToast('結果の取得に失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl text-white mb-4">結果が見つかりません</h1>
          <button
            onClick={() => router.push(`/user/courses/${params.courseId}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            コースに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">最終試験 結果</h1>
          <p className="text-gray-400 mt-2">
            評価日時: {new Date(result.evaluatedAt).toLocaleString()}
          </p>
        </div>

     {/* 総合評価 */}
<div className="bg-gray-800 rounded-lg p-8 mb-8 shadow-lg">
  <div className="text-center">
    <div className={`text-6xl font-bold mb-4 ${GRADE_COLORS[result.grade]}`}>
      {result.grade}
    </div>
    <div className="text-2xl text-white mb-2">
      最終評価点: {result.finalScore}点
    </div>
    <div className="text-xl text-gray-300 mb-2">
      試験得点: {result.totalScore}点
    </div>
    <div className="text-gray-400">
      GPA: {result.gradePoint.toFixed(1)}
    </div>
  </div>
</div>

        {/* セクション別評価 */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white mb-4">セクション別評価</h2>
          {result.sectionResults.map((section, index) => (
            <div key={section.sectionId} className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-white">
                  セクション {index + 1}
                </h3>
                <div className="text-xl font-bold text-blue-400">
                  {section.score}点
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">フィードバック</h4>
                  <p className="text-white">{section.feedback}</p>
                </div>
                {section.nextStep && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">今後の学習ポイント</h4>
                    <p className="text-white">{section.nextStep}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>


        {/* アクションボタン */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => {
              // 証明書のダウンロード処理
              router.push(`/user/courses/${params.courseId}/chapters/${params.chapterId}/examination/certificate`);
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            成績証明書をダウンロード
          </button>
          <button
            onClick={() => router.push(`/user/courses/${params.courseId}`)}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            コースに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
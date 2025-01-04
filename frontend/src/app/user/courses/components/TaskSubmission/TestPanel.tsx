// frontend/src/app/user/courses/[courseId]/chapters/[chapterId]/components/TaskSubmission/TestPanel.tsx
import { useState } from 'react';

export const TestPanel = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/debug/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission: "テスト提出内容"
        })
      });

      const data = await response.json();
      console.log('テスト結果:', data);
      setResult(data);
    } catch (error) {
      console.error('テストエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <button
        onClick={runTest}
        className="bg-red-500 text-white px-4 py-2 rounded mb-4"
        disabled={loading}
      >
        {loading ? 'テスト実行中...' : 'APIテスト実行'}
      </button>

      {result && (
        <pre className="bg-gray-900 p-4 rounded text-white">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};
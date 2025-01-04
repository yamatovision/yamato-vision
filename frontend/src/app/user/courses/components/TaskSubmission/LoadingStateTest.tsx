// frontend/src/app/user/courses/[courseId]/chapters/[chapterId]/components/TaskSubmission/LoadingStateTest.tsx

import { useState } from 'react';
import { LoadingState } from './LoadingState';

export const LoadingStateTest: React.FC = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);

  const handleStartLoading = () => {
    setShowLoading(true);
    setTimeoutOccurred(false);
  };

  const handleTimeout = () => {
    setTimeoutOccurred(true);
    setShowLoading(false);
  };

  return (
    <div className="p-4">
      <div className="mb-4 space-y-4">
        <button
          onClick={handleStartLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          ローディング開始
        </button>
        
        {timeoutOccurred && (
          <div className="text-red-500">
            タイムアウトが発生しました
          </div>
        )}
      </div>

      {showLoading && (
        <LoadingState
          onTimeout={handleTimeout}
          timeoutDuration={5000} // テスト用に5秒に設定
        />
      )}
    </div>
  );
};
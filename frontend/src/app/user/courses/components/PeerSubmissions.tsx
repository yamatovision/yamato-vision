// frontend/src/app/user/courses/[courseId]/chapters/[chapterId]/components/PeerSubmissions.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { courseApi } from '@/lib/api/courses';
import { PeerSubmissionCard } from './PeerSubmissionCard';
import { toast } from 'react-hot-toast';

interface PeerSubmissionsProps {
  courseId: string;
  chapterId: string;
}

interface Submission {
  id: string;
  content: string;
  points: number;
  feedback: string;
  nextStep: string;
  submittedAt: Date;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    rank: string;
  };
}

export function PeerSubmissions({ courseId, chapterId }: PeerSubmissionsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const perPage = 10;

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await courseApi.getChapterPeerSubmissions(
          courseId,
          chapterId,
          page,
          perPage
        );

        if (response.success && response.data) {
          setSubmissions(response.data.submissions);
          setTotalSubmissions(response.data.total);
          setTotalPages(Math.ceil(response.data.total / perPage));
        } else {
          throw new Error(response.error || '提出一覧の取得に失敗しました');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '提出一覧の取得中にエラーが発生しました';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [courseId, chapterId, page]);

  if (error) {
    return (
      <div className={`p-4 rounded-lg ${
        isDark ? 'bg-red-900/20 text-red-200' : 'bg-red-50 text-red-600'
      }`}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-lg font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          他の受講生の提出 ({totalSubmissions}件)
        </h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className={`animate-pulse h-32 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>
      ) : submissions.length > 0 ? (
        <>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <PeerSubmissionCard
                key={submission.id}
                submission={submission}
              />
            ))}
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className={`px-3 py-1 rounded ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  前へ
                </button>
              )}
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPage(index + 1)}
                  className={`px-3 py-1 rounded ${
                    page === index + 1
                      ? isDark 
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className={`px-3 py-1 rounded ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  次へ
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className={`p-8 text-center rounded-lg ${
          isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'
        }`}>
          まだ他の受講生の提出はありません
        </div>
      )}
    </div>
  );
}
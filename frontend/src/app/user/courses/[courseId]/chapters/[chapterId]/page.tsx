'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { Chapter } from '@/types/course';
import { courseApi } from '@/lib/api/courses';
import { toast } from 'react-hot-toast';

// APIクライアントに追加が必要な関数
// courses.tsに追加
const getChapter = async (courseId: string, chapterId: string) => {
  const response = await fetch(
    `${FRONTEND_API_BASE}/courses/${courseId}/chapters/${chapterId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  const data = await response.json();
  return { success: true, data };
};

// ページコンポーネント
export default function ChapterPage({ params }: { params: { courseId: string, chapterId: string } }) {
  const { theme } = useTheme();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChapter = async () => {
      try {
        setLoading(true);
        const response = await courseApi.getChapter(params.courseId, params.chapterId);
        if (response.success && response.data) {
          // contentをパースする
          const parsedChapter = {
            ...response.data,
            content: response.data.content ? JSON.parse(response.data.content) : null
          };
          setChapter(parsedChapter);
        }
      } catch (error) {
        console.error('Failed to load chapter:', error);
        toast.error('チャプターの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
  
    loadChapter();
  }, [params.courseId, params.chapterId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="max-w-[800px] mx-auto p-4">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 text-center`}>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            チャプターが見つかりません
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-[800px] mx-auto pb-20">
      {/* ヘッダー部分 */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg mb-4`}>
        <div className="p-4 text-center">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {chapter.title}
          </p>
          {chapter.subtitle && (
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              {chapter.subtitle}
            </p>
          )}
        </div>
      </div>
  
      {/* コンテンツ部分 */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-6 mb-6`}>
        <h1 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'}`}>
          {chapter.title}
        </h1>
  
        {/* チャプターコンテンツ部分を追加 */}
        {chapter.content && (
          <div className="mb-8">
            <div 
              className={`prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none
                prose-headings:font-bold
                prose-h1:text-xl
                prose-h2:text-lg
                prose-p:text-base
                prose-a:text-blue-500
                prose-code:text-pink-500
                ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
              `}
            >
              <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
            </div>
          </div>
        )}
  
        {/* タスク部分 */}
        {chapter.task && (
          <div className="space-y-4">
            {/* 既存のタスク部分のコード */}
          </div>
        )}
      </div>
    </div>
  );
}
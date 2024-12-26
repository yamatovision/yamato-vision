'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { Chapter } from '@/types/course';
import { courseApi } from '@/lib/api/courses';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { VideoPlayer } from '@/app/user/courses/components/VideoPlayer';
import { AudioPlayer } from '@/app/user/courses/components/AudioPlayer';
import { TaskDescription } from '@/app/user/courses/components/TaskDescription';
import { AttachmentFiles } from '@/app/user/courses/components/AttachmentFiles';
import { TimeRemaining } from '@/app/user/courses/components/TimeRemaining';
import { ParticipantList } from '@/app/user/courses/components/ParticipantList';
import { ProgressBar } from '@/app/user/courses/components/ProgressBar';
export default function ChapterPage({ 
  params 
}: { 
  params: { courseId: string; chapterId: string } 
}) {
  const { theme } = useTheme();
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadChapter = async () => {
      try {
        setLoading(true);
        const response = await courseApi.getChapter(params.courseId, params.chapterId);
        
        if (response.success && response.data) {
          const parsedChapter = {
            ...response.data,
            content: response.data.content ? 
              (typeof response.data.content === 'string' ? 
                JSON.parse(response.data.content) : 
                response.data.content
              ) : null
          };
          setChapter(parsedChapter);
          
          // プログレスの取得
          const progressResponse = await courseApi.getCurrentUserCourse(params.courseId);
          if (progressResponse.success && progressResponse.data) {
            setProgress(progressResponse.data.progress);
          }
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

  const handleChapterComplete = async () => {
    try {
      setSubmitting(true);
      const result = await courseApi.completeChapter(params.courseId, params.chapterId);
      
      if (result.success) {
        toast.success('チャプターを完了しました！');
        
        if (result.data.nextChapter) {
          // 次のチャプターがある場合は自動的に遷移
          router.push(`/user/courses/${params.courseId}/chapters/${result.data.nextChapter.id}`);
        } else {
          // 全チャプターが完了した場合はコース一覧に戻る
          toast.success('おめでとうございます！コースを完了しました！');
          router.push('/user/courses');
        }
      }
    } catch (error) {
      console.error('Failed to complete chapter:', error);
      toast.error('チャプターの完了処理に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="max-w-[800px] mx-auto pb-20 px-4">
      {/* ヘッダー部分 */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg mb-6`}>
        <div className="p-4 text-center">
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'}`}>
            {chapter.title}
          </h1>
          {chapter.subtitle && (
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {chapter.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* コンテンツ部分 */}
      <div className="space-y-6">
        {/* メディアプレイヤー */}
        {chapter.content?.type === 'video' && (
          <div className="mb-6">
            <VideoPlayer 
              url={chapter.content.url} 
              transcription={chapter.content.transcription}
            />
          </div>
        )}

        {chapter.content?.type === 'audio' && (
          <div className="mb-6">
            <AudioPlayer 
              url={chapter.content.url}
              transcription={chapter.content.transcription}
            />
          </div>
        )}

        {/* タスク部分 */}
        {chapter.task && (
          <div className="mb-6">
            <TaskDescription
              description={chapter.task.description}
              systemMessage={chapter.task.systemMessage}
              referenceText={chapter.task.referenceText}
              maxPoints={chapter.task.maxPoints}
              type={chapter.task.type}
            />
          </div>
        )}

        {/* 添付ファイル */}
        {/* AttachmentFilesコンポーネントの実装に応じて追加 */}

        {/* 進捗と時間 */}
        <div className="mt-8 space-y-4">
          <ProgressBar progress={progress} />
          {chapter.timeLimit && (
            <div className="flex justify-between items-center">
              <TimeRemaining initialTime={chapter.timeLimit} />
              <ParticipantList />
            </div>
          )}
        </div>

        {/* チャプター完了ボタン */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleChapterComplete}
            disabled={submitting}
            className={`
              ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}
              text-white font-bold py-3 px-6 rounded-lg
              transition-all duration-200
              ${submitting ? 'opacity-50 cursor-not-allowed' : ''}
              shadow-lg hover:shadow-xl
            `}
          >
            {submitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                処理中...
              </span>
            ) : (
              'チャプターを完了する'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
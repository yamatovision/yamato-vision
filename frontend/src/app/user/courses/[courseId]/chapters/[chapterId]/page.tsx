'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { Chapter } from '@/types/course';
import { courseApi } from '@/lib/api/courses';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { VideoPlayer } from '../../../components/VideoPlayer';
import { AudioPlayer } from '../../../components/AudioPlayer';
import { TaskDescription } from '../../../components/TaskDescription';
import { AttachmentFiles } from '../../../components/AttachmentFiles';
import { TimeRemaining } from '../../../components/TimeRemaining';
import { ParticipantList } from '../../../components/ParticipantList';
import { ProgressBar } from '../../../components/ProgressBar';
import { TimeoutModal } from '@/components/timeouts/TimeoutModal';
import { TimeoutWarning } from '@/components/timeouts/TimeoutWarning';

export default function ChapterPage({ 
  params 
}: { 
  params: { courseId: string; chapterId: string } 
}) {
  const router = useRouter();
  const { theme } = useTheme();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [timeoutType, setTimeoutType] = useState<'chapter' | 'course' | null>(null);

  useEffect(() => {
    const initializeChapter = async () => {
      try {
        setLoading(true);
        
        // チャプター開始時間の記録と取得
        const startResponse = await courseApi.startChapter(params.courseId, params.chapterId);
        if (startResponse.success && startResponse.data.startedAt) {
          setStartTime(new Date(startResponse.data.startedAt));
        }

        // チャプター情報の取得
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
  
    initializeChapter();
  }, [params.courseId, params.chapterId]);

  const handleTimeout = (type: 'chapter' | 'course') => {
    setTimeoutType(type);
    setShowTimeoutModal(true);
  };

  const handleTimeoutModalClose = () => {
    setShowTimeoutModal(false);
    if (timeoutType === 'course') {
      router.push('/user/courses'); // コースタイムアウト時はコース一覧へ
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
      {/* タイムアウトモーダル */}
      <TimeoutModal
        isOpen={showTimeoutModal}
        type={timeoutType || 'chapter'}
        onClose={handleTimeoutModalClose}
        onAction={timeoutType === 'course' ? () => router.push('/shop') : undefined}
      />

      {/* ヘッダー部分 */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg mb-6`}>
        {/* 時間警告表示 */}
        {startTime && chapter.timeLimit && (
          <TimeRemaining
            startTime={startTime}
            timeLimit={chapter.timeLimit}
            type="chapter"
            onTimeout={() => handleTimeout('chapter')}
          />
        )}
        
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

        {/* 進捗と時間 */}
        <div className="mt-8 space-y-4">
          <ProgressBar progress={progress} />
          {startTime && chapter.timeLimit && (
            <div className="flex justify-between items-center">
              <TimeRemaining
                startTime={startTime}
                timeLimit={chapter.timeLimit}
                type="chapter"
                onTimeout={() => handleTimeout('chapter')}
              />
              <ParticipantList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
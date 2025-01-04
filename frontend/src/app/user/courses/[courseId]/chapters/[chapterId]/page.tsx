'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { Chapter } from '@/types/course';
import { ChapterProgress } from '@/types/progress';
import { courseApi } from '@/lib/api/courses';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { VideoPlayer } from '../../../components/VideoPlayer';
import { AudioPlayer } from '../../../components/AudioPlayer';
import { TaskDescription } from '../../../components/TaskDescription';
import { AttachmentFiles } from '../../../components/AttachmentFiles';
import { TimeRemaining } from '../../../components/TimeRemaining';
import { ParticipantList } from '../../../components/ParticipantList';
import { TimeoutModal } from '@/app/user/courses/components/TimeoutModal';
import { TimeoutWarning } from '@/app/user/courses/components/TimeoutWarning';
import { SubmissionForm } from '@/app/user/courses/components/SubmissionForm';



interface ChapterState {
  chapter: Chapter | null;
  progress: ChapterProgress | null;
  materials: MaterialProgress[];
  loading: boolean;
}

interface MaterialProgress {
  materialId: string;
  completed: boolean;
}

export default function ChapterPage({ 
  params 
}: { 
  params: { courseId: string; chapterId: string } 
}) {
  const router = useRouter();
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);  // これを追加

  // 既存の状態
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [timeoutType, setTimeoutType] = useState<'chapter' | 'course' | null>(null);

  // 新しい状態
  const [mediaCompleted, setMediaCompleted] = useState(false);
  const [chapterProgress, setChapterProgress] = useState<ChapterProgress | null>(null);
  const [materials, setMaterials] = useState<MaterialProgress[]>([]);

  useEffect(() => {
    const initializeChapter = async () => {
      try {
        setLoading(true);
        
        // チャプター開始時間の記録と取得
        const startResponse = await courseApi.startChapter(params.courseId, params.chapterId);
        if (startResponse.success && startResponse.data.startedAt) {
          setStartTime(new Date(startResponse.data.startedAt));
          setChapterProgress(startResponse.data.progress);
        }

        // チャプター情報と進捗を並行して取得
        const [chapterResponse, progressResponse] = await Promise.all([
          courseApi.getChapter(params.courseId, params.chapterId),
          courseApi.getCurrentUserCourse(params.courseId)
        ]);

        if (chapterResponse.success && chapterResponse.data) {
          console.log('チャプtー情報:', chapterResponse.data.content);
          const parsedChapter = {
            ...chapterResponse.data,
            content: chapterResponse.data.content ? 
              (typeof chapterResponse.data.content === 'string' ? 
                JSON.parse(chapterResponse.data.content) : 
                chapterResponse.data.content
              ) : null
          };
          setChapter(parsedChapter);
        }

        if (progressResponse.success && progressResponse.data) {
          setMaterials(progressResponse.data.materials || []);
          
          // メディアの完了状態を確認
          const currentMaterial = progressResponse.data.materials?.find(
            (m: MaterialProgress) => m.materialId === chapterResponse.data?.content?.id
          );
          setMediaCompleted(!!currentMaterial?.completed);
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

  // メディア完了時のハンドラー
  const handleMediaCompletion = async () => {
    try {
      if (!chapter?.content?.id) return;

      const response = await courseApi.updateMaterialProgress(
        params.courseId,
        params.chapterId,
        chapter.content.id,
        {
          completed: true,
          lastAccessedAt: new Date(),
        }
      );

      if (response.success) {
        setMediaCompleted(true);
        toast.success('メディアコンテンツを完了しました！');

        // タスクがない場合はチャプター完了
        if (!chapter.task) {
          await handleChapterCompletion();
        }
      }
    } catch (error) {
      console.error('Failed to update media progress:', error);
      toast.error('進捗の更新に失敗しました');
    }
  };

  // チャプター完了のハンドラー
  const handleChapterCompletion = async () => {
    try {
      const response = await courseApi.completeChapter(
        params.courseId,
        params.chapterId
      );
  
      if (response.success) {
        toast.success('チャプターを完了しました！');
        
        // 次のチャプターが存在する場合は自動的に移動
        if (response.data?.nextChapter?.id) {
          router.push(`/user/courses/${params.courseId}/chapters/${response.data.nextChapter.id}`);
        } else {
          // 次のチャプターがない場合はコース一覧に戻る
          router.push('/user/courses');
        }
      }
    } catch (error) {
      console.error('Failed to complete chapter:', error);
      toast.error('チャプター完了の処理に失敗しました');
    }
  };

  const handleTimeout = (type: 'chapter' | 'course') => {
    setTimeoutType(type);
    setShowTimeoutModal(true);
  };

  const handleTimeoutModalClose = () => {
    setShowTimeoutModal(false);
    if (timeoutType === 'course') {
      router.push('/user/courses');
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
      <TimeoutModal
        isOpen={showTimeoutModal}
        type={timeoutType || 'chapter'}
        onClose={handleTimeoutModalClose}
        onAction={timeoutType === 'course' ? () => router.push('/shop') : undefined}
      />

      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg mb-6`}>
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

      <div className="space-y-6">
      {chapter.content?.type === 'video' && chapter.content.videoId && (
  <div className="mb-6">
    <VideoPlayer
    videoId={chapter.content.videoId}  // urlではなくvideoIdを使用
      courseId={params.courseId}        // paramsから取得
      chapterId={params.chapterId}      // paramsから取得
      transcription={chapter.content.transcription}  // オプショナル
      onCompletion={handleMediaCompletion}          // コールバック関数
      completed={mediaCompleted}                     // 完了状態
    />
  </div>
)}


{chapter.content?.type === 'audio' && chapter.content.url && (
  <div className="mb-6">
    <AudioPlayer
      url={chapter.content.url}
      courseId={params.courseId}        // paramsから取得
      chapterId={params.chapterId}      // paramsから取得
      transcription={chapter.content.transcription}  // オプショナル
      onCompletion={handleMediaCompletion}          // コールバック関数
      completed={mediaCompleted}                     // 完了状態
    />
  </div>
)}
{chapter.task && (
  <div className="mb-6">
    <SubmissionForm
      task={chapter.task}
      onSubmit={async (prompt: string, result: string) => {
        try {
          const submission = await courseApi.submitTask(params.courseId, params.chapterId, {
            prompt,
            result
          });

          if (submission.success) {
            toast.success('課題を提出しました！');
            await handleChapterCompletion();
          }
        } catch (error) {
          console.error('Failed to submit task:', error);
          toast.error('課題の提出に失敗しました');
        }
      }}
      isSubmitting={false}
    />
  </div>
)}

        <div className="mt-8 space-y-4">
          
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
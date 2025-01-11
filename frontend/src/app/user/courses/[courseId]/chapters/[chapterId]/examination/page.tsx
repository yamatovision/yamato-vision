'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/contexts/theme';
import { courseApi as baseCourseApi } from '@/lib/api/courses';
import { ExamTimer } from './components/ExamTimer';
import { SectionNavigation } from './components/SectionNavigation';
import { useToast } from '@/contexts/toast';
import { ExamSectionResult } from '@/types/chapter';
import { APIResponse } from '@/types/api'; // 追加が必要

const AUTOSAVE_INTERVAL = 30000; // 30秒

interface ExamState {
  currentSection: number;
  answers: { [key: number]: string };
  sectionResults: ExamSectionResult[];
  startedAt?: Date;
  timeLimit: number;
}
interface ExamApi {
  startExam: typeof baseCourseApi.startExam;
  saveExamSection: (params: {
    courseId: string;
    chapterId: string;
    sectionNumber: string;
    content: string;
  }) => Promise<APIResponse<void>>;
  submitExamSection: (params: {
    courseId: string;
    chapterId: string;
    sectionNumber: string;
    content: string;
  }) => Promise<APIResponse<ExamResult>>;
}
interface ExamResult {
  sectionNumber: number;
  score: number;
  feedback: string;
  submittedAt: Date;
  isComplete?: boolean;
}

interface StartExamResponse {
  startedAt: string;
  timeLimit: number;
  success: boolean;
}

export default function ExaminationPage() {
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [examState, setExamState] = useState<ExamState>({
    currentSection: 0,
    answers: {},
    sectionResults: [],
    timeLimit: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 試験開始処理
  useEffect(() => {
    const initializeExam = async () => {
      try {
        const courseId = params.courseId as string;
        const chapterId = params.chapterId as string;
        
        const response = await courseApi.startExam(courseId, chapterId);
        if (response.success && response.data) {  // null チェックを追加
          setExamState(prev => ({
            ...prev,
            startedAt: new Date(response.data.startedAt),
            timeLimit: response.data.timeLimit,
            currentSection: 0,
            sectionResults: []
          }));
        } else {
          throw new Error('Failed to start exam');
        }
      } catch (error) {
        showToast('試験の開始に失敗しました', 'error');
        router.push(`/user/courses/${params.courseId}`);
      } finally {
        setLoading(false);
      }
    };

    initializeExam();
  }, [params.courseId, params.chapterId, router, showToast]);

  // 自動保存
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (examState.answers[examState.currentSection]) {
        handleAutoSave();
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(autoSaveTimer);
  }, [examState.answers, examState.currentSection]);

  // 自動保存処理
  const handleAutoSave = useCallback(async () => {
    const courseId = params.courseId as string;
    const chapterId = params.chapterId as string;
    
    try {
      // API関数の追加が必要
      await courseApi.saveExamSection({
        courseId,
        chapterId,
        sectionNumber: examState.currentSection.toString(),
        content: examState.answers[examState.currentSection]
      });
      showToast('回答を保存しました', 'success');
    } catch (error) {
      console.error('Auto save failed:', error);
    }
  }, [params.courseId, params.chapterId, examState.currentSection, examState.answers, showToast]);

  // セクション提出
  const handleSubmitSection = async () => {
    if (!examState.answers[examState.currentSection]?.trim()) {
      showToast('回答を入力してください', 'error');
      return;
    }

    if (!window.confirm('このセクションを提出してもよろしいですか？')) {
      return;
    }

    setIsSubmitting(true);
    const courseId = params.courseId as string;
    const chapterId = params.chapterId as string;

    try {
      const response = await courseApi.submitExamSection({
        courseId,
        chapterId,
        sectionNumber: examState.currentSection.toString(),
        content: examState.answers[examState.currentSection]
      }) as APIResponse<ExamResult>;

      if (response.success && response.data) {
        const newSectionResults = [...examState.sectionResults];
        newSectionResults[examState.currentSection] = {
          sectionNumber: response.data.sectionNumber,
          score: response.data.score,
          feedback: response.data.feedback,
          submittedAt: new Date(response.data.submittedAt)
        };
        
        if (response.data.isComplete) {
          router.push(`/user/courses/${courseId}/chapters/${chapterId}/examination/results`);
        } else {
          setExamState(prev => ({
            ...prev,
            currentSection: prev.currentSection + 1,
            sectionResults: newSectionResults
          }));
          showToast('セクションを提出しました', 'success');
        }
      }
    } catch (error) {
      showToast('提出に失敗しました', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  // タイムアウト処理
  const handleTimeout = useCallback(async () => {
    showToast('制限時間が終了しました。現在までの回答で提出します', 'warning');
    await handleSubmitSection();
  }, [handleSubmitSection, showToast]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-700'} rounded-xl p-6`}>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-600 rounded w-3/4 mb-6"></div>
            <div className="h-64 bg-gray-600 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* ヘッダー部分 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">最終試験</h1>
          {examState.startedAt && (
            <ExamTimer
              duration={examState.timeLimit}
              startedAt={examState.startedAt}
              onTimeout={handleTimeout}
            />
          )}
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-[1fr_300px] gap-6">
          {/* 左側：回答エリア */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <textarea
                value={examState.answers[examState.currentSection] || ''}
                onChange={(e) => setExamState(prev => ({
                  ...prev,
                  answers: {
                    ...prev.answers,
                    [prev.currentSection]: e.target.value
                  }
                }))}
                className="w-full h-64 p-4 bg-gray-700 text-white rounded-lg
                  border border-gray-600 focus:ring-2 focus:ring-blue-500"
                placeholder="回答を入力してください..."
                disabled={isSubmitting}
              />
              
              <div className="mt-4 flex justify-end space-x-4">
                <button
                  onClick={() => setExamState(prev => ({
                    ...prev,
                    currentSection: Math.max(0, prev.currentSection - 1)
                  }))}
                  disabled={examState.currentSection === 0 || isSubmitting}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg
                    hover:bg-gray-600 disabled:opacity-50"
                >
                  前のセクション
                </button>
                <button
                  onClick={handleSubmitSection}
                  disabled={isSubmitting || !examState.answers[examState.currentSection]?.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg
                    hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? '提出中...' : 'セクションを提出'}
                </button>
              </div>
            </div>
          </div>

          {/* 右側：進捗表示 */}
          <div>
            <SectionNavigation
              currentSection={examState.currentSection}
              sectionResults={examState.sectionResults}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
// src/lib/api/courses.ts に追加
export const courseApi = {
  startExam: baseCourseApi.startExam,
  saveExamSection: async (params) => {
    const { courseId, chapterId, sectionNumber, content } = params;
    const response = await fetch(
      `/api/courses/${courseId}/chapters/${chapterId}/exam/sections/${sectionNumber}/save`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      }
    );
    return await response.json();
  },
  submitExamSection: async (params) => {
    const { courseId, chapterId, sectionNumber, content } = params;
    const response = await fetch(
      `/api/courses/${courseId}/chapters/${chapterId}/exam/sections/${sectionNumber}/submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      }
    );
    return await response.json();
  },
};
'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { courseApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { RichTextEditor } from './RichTextEditor';
import { MediaUpload } from './MediaUpload';
import { ChapterTimeSettings } from './ChapterTimeSettings';
import { TaskForm } from './TaskForm';
import { Chapter, Task, CreateChapterDTO, TaskContent, ReferenceFile } from '@/types/course';

// 型定義
interface ExamSection {
  number: 1 | 2 | 3;
  title: string;
  task: {
    materials: string;
    task: string;
    evaluationCriteria: string;
  };
}

interface ExamSettings {
  sections: ExamSection[];
}

interface ChapterFormData {
  title: string;
  subtitle: string;
  content: {
    type: 'video' | 'audio';
    videoId: string;
    transcription: string;
  };
  taskContent: {
    description: string;
  };
  referenceFiles: ReferenceFile[];
  timeLimit: number;
  releaseTime: number;
  orderIndex: number;
  task?: {
    title: string;
    materials?: string;
    task?: string;
    evaluationCriteria?: string;
    maxPoints: number;
  };
  isFinalExam: boolean;
  examSettings?: ExamSettings;
}

interface ChapterFormProps {
  initialData?: Chapter;
  courseId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function ChapterForm({
  initialData,
  courseId,
  onCancel,
  onSuccess
}: ChapterFormProps) {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ChapterFormData>({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    content: {
      type: initialData?.content?.type || 'video',
      videoId: initialData?.content?.videoId || '',
      transcription: initialData?.content?.transcription || ''
    },
    taskContent: {
      description: initialData?.taskContent?.description || ''
    },
    referenceFiles: initialData?.referenceFiles || [],
    timeLimit: initialData?.timeLimit || 0,
    releaseTime: initialData?.releaseTime || 0,
    orderIndex: initialData?.orderIndex || 0,
    task: initialData?.task ? {
      title: initialData.task.title,
      materials: initialData.task.materials,
      task: initialData.task.task,
      evaluationCriteria: initialData.task.evaluationCriteria,
      maxPoints: initialData.task.maxPoints
    } : undefined,
    isFinalExam: initialData?.isFinalExam || false,
    examSettings: initialData?.isFinalExam ? {
      sections: [
        {
          number: 1,
          title: initialData.examSettings?.sections[0]?.title || "基礎理解度確認",
          task: {
            materials: initialData.examSettings?.sections[0]?.task.materials || '',
            task: initialData.examSettings?.sections[0]?.task.task || '',
            evaluationCriteria: initialData.examSettings?.sections[0]?.task.evaluationCriteria || ''
          }
        },
        {
          number: 2,
          title: initialData.examSettings?.sections[1]?.title || "実践応用課題",
          task: {
            materials: initialData.examSettings?.sections[1]?.task.materials || '',
            task: initialData.examSettings?.sections[1]?.task.task || '',
            evaluationCriteria: initialData.examSettings?.sections[1]?.task.evaluationCriteria || ''
          }
        },
        {
          number: 3,
          title: initialData.examSettings?.sections[2]?.title || "総合課題",
          task: {
            materials: initialData.examSettings?.sections[2]?.task.materials || '',
            task: initialData.examSettings?.sections[2]?.task.task || '',
            evaluationCriteria: initialData.examSettings?.sections[2]?.task.evaluationCriteria || ''
          }
        }
      ]
    } : undefined
  });

  const handleTimeSettingsUpdate = async (settings: { timeLimit?: number; releaseTime?: number }) => {
    setFormData(prev => ({
      ...prev,
      timeLimit: settings.timeLimit ?? prev.timeLimit,
      releaseTime: settings.releaseTime ?? prev.releaseTime
    }));
  };
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('タイトルを入力してください');
      return false;
    }
  
    if (formData.isFinalExam && formData.examSettings) {
      for (const section of formData.examSettings.sections) {
        if (!section.title.trim()) {
          toast.error(`セクション${section.number}のタイトルを入力してください`);
          return false;
        }
        if (!section.task.materials.trim() || 
            !section.task.task.trim() || 
            !section.task.evaluationCriteria.trim()) {
          toast.error(`セクション${section.number}の課題内容をすべて入力してください`);
          return false;
        }
      }
    }
  
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
  
    try {
      const submitData: CreateChapterDTO = {
        title: formData.title,
        subtitle: formData.subtitle,
        content: {
          type: formData.content.type,
          videoId: formData.content.videoId,
          transcription: formData.content.transcription
        },
        taskContent: {
          description: formData.taskContent.description
        },
        referenceFiles: formData.referenceFiles,
        timeLimit: formData.timeLimit,
        releaseTime: formData.releaseTime,
        orderIndex: formData.orderIndex,
        isFinalExam: formData.isFinalExam,
        examSettings: formData.isFinalExam ? {
          sections: formData.examSettings!.sections.map(section => ({
            number: section.number,
            title: section.title,
            task: {
              materials: section.task.materials,
              task: section.task.task,
              evaluationCriteria: section.task.evaluationCriteria
            }
          }))
        } : undefined,
        task: formData.isFinalExam ? {
          title: "最終試験",
          maxPoints: 100
        } : formData.task
      };
  
      if (initialData) {
        await courseApi.updateChapter(courseId, initialData.id, submitData);
        toast.success('チャプターを更新しました');
      } else {
        await courseApi.createChapter(courseId, submitData);
        toast.success('チャプターを作成しました');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast.error(initialData ? 'チャプターの更新に失敗しました' : 'チャプターの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本情報セクション */}
        <section className={`p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg font-medium mb-4 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>
            基本情報
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                チャプタータイトル *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full rounded-lg p-3 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-200'
                } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                サブタイトル
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                className={`w-full rounded-lg p-3 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-200'
                } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
            </div>
          </div>

          <div className="mt-6">
            <ChapterTimeSettings
              timeLimit={formData.timeLimit}
              releaseTime={formData.releaseTime}
              onUpdate={handleTimeSettingsUpdate}
              disabled={isSubmitting}
            />
          </div>
        </section>

        {/* メディアセクション */}
        <section className={`p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg font-medium mb-4 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>
            メディアコンテンツ
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                コンテンツタイプ *
              </label>
              <select
                value={formData.content.type}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    content: {
                      type: e.target.value as 'video' | 'audio',
                      videoId: '',
                      transcription: ''
                    }
                  }));
                }}
                className={`w-full rounded-lg p-3 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-200'
                } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="video">動画</option>
                <option value="audio">音声</option>
              </select>
            </div>

            <MediaUpload
              type={formData.content.type}
              currentVideoId={formData.content.videoId}
              onUpload={({ videoId }) => setFormData(prev => ({
                ...prev,
                content: {
                  ...prev.content,
                  videoId
                }
              }))}
              courseId={courseId}
              chapterId={initialData?.id || ''}
            />
          </div>
        </section>

        {/* 課題セクション */}
        <section className={`p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg font-medium mb-6 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>
            課題設定
          </h3>

          {/* 公開用課題説明 */}
          <div className="mb-8">
            <RichTextEditor
              label="課題説明"
              value={formData.taskContent.description}
              onChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  taskContent: {
                    description: value
                  }
                }));
              }}
              placeholder="課題の説明を入力してください"
            />
          </div>

          <TaskForm
            initialData={initialData?.task}
            onSubmit={(taskData) => {
              setFormData(prev => ({
                ...prev,
                task: {
                  title: taskData.title,
                  materials: taskData.materials,
                  task: taskData.task,
                  evaluationCriteria: taskData.evaluationCriteria,
                  maxPoints: taskData.maxPoints
                }
              }));
            }}
            disabled={isSubmitting}
          />
        </section>

        {/* 試験設定セクション */}
        <section className={`p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>
              試験設定
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFinalExam"
                checked={formData.isFinalExam}
                onChange={(e) => {
                  const isExam = e.target.checked;
                  setFormData(prev => ({
                    ...prev,
                    isFinalExam: isExam,
                    examSettings: isExam ? {
                      sections: [
                        {
                          number: 1,
                          title: "基礎理解度確認",
                          task: { materials: '', task: '', evaluationCriteria: '' }
                        },
                        {
                          number: 2,
                          title: "実践応用課題",
                          task: { materials: '', task: '', evaluationCriteria: '' }
                        },
                        {
                          number: 3,
                          title: "総合課題",
                          task: { materials: '', task: '', evaluationCriteria: '' }
                        }
                      ]
                    } : undefined
                  }));
                }}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <label htmlFor="isFinalExam" className="text-sm text-gray-300">
                このチャプターを最終試験として設定する
              </label>
            </div>
          </div>

          {formData.isFinalExam && formData.examSettings && (
            <div className="space-y-6">
              {formData.examSettings.sections.map((section) => (
                <div key={section.number} className="border border-gray-700 rounded-lg p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      セクション {section.number} タイトル
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const newSections = formData.examSettings!.sections.map(s => 
                          s.number === section.number 
                            ? { ...s, title: e.target.value }
                            : s
                        );
                        setFormData(prev => ({
                          ...prev,
                          examSettings: {
                            ...prev.examSettings!,
                            sections: newSections
                          }
                        }));
                      }}
                      className="w-full rounded-lg p-3 bg-gray-700 text-white border-gray-600"
                      placeholder={`セクション ${section.number} のタイトルを入力`}
                    />
                  </div>

                  {/* 配点表示 */}
                  <div className="mb-4 text-sm text-gray-400">
                    配点: {section.number === 3 ? '40' : '30'}点
                  </div>

                  {/* 課題内容設定 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        教材内容
                      </label>
                      <textarea
                        value={section.task.materials}
                        onChange={(e) => {
                          const newSections = formData.examSettings!.sections.map(s =>
                            s.number === section.number
                              ? { ...s, task: { ...s.task, materials: e.target.value } }
                              : s
                          );
                          setFormData(prev => ({
                            ...prev,
                            examSettings: {
                              ...prev.examSettings!,
                              sections: newSections
                            }
                          }));
                        }}
                        className="w-full h-32 rounded-lg p-3 bg-gray-700 text-white border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        課題内容
                      </label>
                      <textarea
                        value={section.task.task}
                        onChange={(e) => {
                          const newSections = formData.examSettings!.sections.map(s =>
                            s.number === section.number
                              ? { ...s, task: { ...s.task, task: e.target.value } }
                              : s
                          );
                          setFormData(prev => ({
                            ...prev,
                            examSettings: {
                              ...prev.examSettings!,
                              sections: newSections
                            }
                          }));
                        }}
                        className="w-full h-32 rounded-lg p-3 bg-gray-700 text-white border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        評価基準
                      </label>
                      <textarea
                        value={section.task.evaluationCriteria}
                        onChange={(e) => {
                          const newSections = formData.examSettings!.sections.map(s =>
                            s.number === section.number
                              ? { ...s, task: { ...s.task, evaluationCriteria: e.target.value } }
                              : s
                          );
                          setFormData(prev => ({
                            ...prev,
                            examSettings: {
                              ...prev.examSettings!,
                              sections: newSections
                            }
                          }));
                        }}
                        className="w-full h-32 rounded-lg p-3 bg-gray-700 text-white border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 操作ボタン */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className={`px-6 py-2 rounded-lg ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className={`px-6 py-2 rounded-lg ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>

      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}
    </div>
  );
}
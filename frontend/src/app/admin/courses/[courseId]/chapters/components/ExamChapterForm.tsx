'use client';

import { useEffect, useState } from 'react';  // useEffectを追加
import { useTheme } from '@/contexts/theme';
import { courseApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { ChapterTimeSettings } from './ChapterTimeSettings';
import { Chapter, CreateChapterDTO, FinalExamChapterDTO,ReferenceFile } from '@/types/course';
import { ThumbnailUpload } from './ThumbnailUpload';


interface ExamSection {
  number: 1 | 2 | 3;
  title: string;
  task: {
    materials: string;
    task: string;
    evaluationCriteria: string;
  };
}

interface ExamChapterFormData {
  title: string;
  subtitle: string;
  timeLimit: number;
  releaseTime: number;
  orderIndex: number;
  examSettings: {
    sections: ExamSection[];
    thumbnailUrl?: string; // 追加
  };
}

interface ExamChapterFormProps {
  initialData?: Chapter;
  courseId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function ExamChapterForm({
  initialData,
  courseId,
  onCancel,
  onSuccess
}: ExamChapterFormProps) {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ExamChapterFormData>({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    timeLimit: initialData?.timeLimit ? initialData.timeLimit : 48,
    releaseTime: initialData?.releaseTime || 0,
    orderIndex: initialData?.orderIndex || 0,
    examSettings: {
      sections: [
        {
          number: 1,
          title: initialData?.examSettings?.sections[0]?.title || "基礎理解度確認",
          task: {
            materials: initialData?.examSettings?.sections[0]?.task.materials || '',
            task: initialData?.examSettings?.sections[0]?.task.task || '',
            evaluationCriteria: initialData?.examSettings?.sections[0]?.task.evaluationCriteria || ''
          }
        },
        {
          number: 2,
          title: initialData?.examSettings?.sections[1]?.title || "実践応用課題",
          task: {
            materials: initialData?.examSettings?.sections[1]?.task.materials || '',
            task: initialData?.examSettings?.sections[1]?.task.task || '',
            evaluationCriteria: initialData?.examSettings?.sections[1]?.task.evaluationCriteria || ''
          }
        },
        {
          number: 3,
          title: initialData?.examSettings?.sections[2]?.title || "総合課題",
          task: {
            materials: initialData?.examSettings?.sections[2]?.task.materials || '',
            task: initialData?.examSettings?.sections[2]?.task.task || '',
            evaluationCriteria: initialData?.examSettings?.sections[2]?.task.evaluationCriteria || ''
          }
        }
      ],
      thumbnailUrl: initialData?.examSettings?.thumbnailUrl || '', // ここに追加
    }
  });

    useEffect(() => {
      console.log('ExamChapterForm マウント時の情報:', {
        courseId,
        initialData: initialData ? 'あり' : 'なし',
        formData
      });
    }, []);
  const handleTimeSettingsUpdate = async (settings: { timeLimit?: number; releaseTime?: number }) => {
    setFormData(prev => ({
      ...prev,
      timeLimit: settings.timeLimit ?? prev.timeLimit,
      releaseTime: settings.releaseTime ?? prev.releaseTime
    }));
  };

  const validateForm = () => {
    console.log('バリデーション検証開始:', {
      タイトル: formData.title,
      セクション数: formData.examSettings.sections.length
    });
  
    if (!formData.title.trim()) {
      console.log('タイトル検証失敗: 空文字');
      toast.error('タイトルを入力してください', {
        duration: 4000,  // 表示時間を長めに
        position: 'top-center'  // 表示位置を調整
      });
      return false;
    }
  
    for (const section of formData.examSettings.sections) {
      console.log(`セクション${section.number}の検証:`, {
        タイトル: section.title,
        材料: section.task.materials,
        タスク: section.task.task,
        評価基準: section.task.evaluationCriteria
      });
  
      if (!section.title.trim()) {
        console.log(`セクション${section.number}のタイトルが空`);
        toast.error(`セクション${section.number}のタイトルを入力してください`, {
          duration: 4000,
          position: 'top-center'
        });
        return false;
      }
  
      if (!section.task.materials.trim()) {
        console.log(`セクション${section.number}の教材が空`);
        toast.error(`セクション${section.number}の教材内容を入力してください`, {
          duration: 4000,
          position: 'top-center'
        });
        return false;
      }
  
      if (!section.task.task.trim()) {
        console.log(`セクション${section.number}の課題が空`);
        toast.error(`セクション${section.number}の課題内容を入力してください`, {
          duration: 4000,
          position: 'top-center'
        });
        return false;
      }
  
      if (!section.task.evaluationCriteria.trim()) {
        console.log(`セクション${section.number}の評価基準が空`);
        toast.error(`セクション${section.number}の評価基準を入力してください`, {
          duration: 4000,
          position: 'top-center'
        });
        return false;
      }
    }
  
    console.log('バリデーション成功');
    return true;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('送信開始', {
      モード: initialData ? '編集' : '新規作成',
      フォームデータ: formData
    });


    setIsSubmitting(true);
  try {
    const finalExamData: FinalExamChapterDTO = {
      title: formData.title,
      subtitle: formData.subtitle,
      timeLimit: formData.timeLimit,
      releaseTime: formData.releaseTime,
      isFinalExam: true,
      examSettings: {
        sections: formData.examSettings.sections,
        thumbnailUrl: formData.examSettings.thumbnailUrl,
        maxPoints: 100,  // セクションの合計点数
        timeLimit: formData.timeLimit,  // 試験の制限時間
        type: 'exam'     // 試験タイプを指定
      }
    };
     
    console.log('API呼び出し直前', {
      モード: initialData ? '編集' : '新規作成',
      データ: finalExamData
    });

    if (initialData) {
      await courseApi.updateExamChapter(courseId, initialData.id, finalExamData);
    } else {
      await courseApi.createExamChapter(courseId, finalExamData);
    }

    toast.success('最終試験を保存しました');
    onSuccess();
  } catch (error) {
    console.error('送信エラー:', {
      モード: initialData ? '編集' : '新規作成',
      エラー: error
    });
    toast.error('最終試験の保存に失敗しました');
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
                試験タイトル *
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
    <div className="border-t border-gray-700 pt-6">
      <h4 className={`text-sm font-medium mb-3 ${
        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
      }`}>
        試験用サムネイル画像
      </h4>
      <ThumbnailUpload
        currentUrl={formData.examSettings.thumbnailUrl}
        onUpload={(url) => {
          setFormData(prev => ({
            ...prev,
            examSettings: {
              ...prev.examSettings,
              thumbnailUrl: url
            }
          }));
        }}
        folder="exam-thumbnails"
      />
      <p className="mt-2 text-sm text-gray-500">
        ※ このサムネイルは試験の概要ページや一覧で表示されます
      </p>
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

        {/* 試験セクション */}
        <section className={`p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
        }`}>
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
                      const newSections = formData.examSettings.sections.map(s => 
                        s.number === section.number 
                          ? { ...s, title: e.target.value }
                          : s
                      );
                      setFormData(prev => ({
                        ...prev,
                        examSettings: {
                          sections: newSections
                        }
                      }));
                    }}
                    className="w-full rounded-lg p-3 bg-gray-700 text-white border-gray-600"
                    placeholder={`セクション ${section.number} のタイトルを入力`}
                  />
                </div>

                <div className="mb-4 text-sm text-gray-400">
                  配点: {section.number === 3 ? '40' : '30'}点
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      教材内容
                    </label>
                    <textarea
                      value={section.task.materials}
                      onChange={(e) => {
                        const newSections = formData.examSettings.sections.map(s =>
                          s.number === section.number
                            ? { ...s, task: { ...s.task, materials: e.target.value } }
                            : s
                        );
                        setFormData(prev => ({
                          ...prev,
                          examSettings: {
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
                        const newSections = formData.examSettings.sections.map(s =>
                          s.number === section.number
                            ? { ...s, task: { ...s.task, task: e.target.value } }
                            : s
                        );
                        setFormData(prev => ({
                          ...prev,
                          examSettings: {
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
                        const newSections = formData.examSettings.sections.map(s =>
                          s.number === section.number
                            ? { ...s, task: { ...s.task, evaluationCriteria: e.target.value } }
                            : s
                        );
                        setFormData(prev => ({
                          ...prev,
                          examSettings: {
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
  onClick={(e) => {
    console.log('保存ボタンクリックイベント発火');
  }}
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
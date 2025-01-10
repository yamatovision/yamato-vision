'use client';

import { Chapter } from '@/types/course';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { courseApi } from '@/lib/api';

interface ChapterListProps {
  chapters?: Chapter[];
  onDelete: (chapterId: string) => void;
  onEdit: (chapterId: string) => void;
  onOrderUpdate: (chapters: Chapter[]) => void;
  onToggleVisibility: (chapterId: string, isVisible: boolean) => void;
  onTogglePerfectOnly: (chapterId: string, isPerfectOnly: boolean) => void;
  courseId: string;
}


// StatusBadgeコンポーネント
const StatusBadge = ({ 
  type, 
  children 
}: { 
  type: 'invisible' | 'perfect'; 
  children: React.ReactNode 
}) => {
  const styles = {
    invisible: 'bg-gray-800 text-gray-300 border border-gray-700',
    perfect: 'bg-purple-900/50 text-purple-300 border border-purple-700'
  };

  return (
    <span className={`
      px-2 py-1 text-xs rounded-full
      ${styles[type]}
      transition-all duration-200
      transform hover:scale-105
    `}>
      {children}
    </span>
  );
};

// ToggleButtonコンポーネント
const ToggleButton = ({ 
  onClick, 
  isActive, 
  activeIcon, 
  inactiveIcon, 
  loading,
  title
}: {
  onClick: () => void;
  isActive: boolean;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
  loading: boolean;
  title: string;
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    title={title}
    className={`p-2 rounded-lg transition-all duration-200 ${
      loading ? 'opacity-50 cursor-wait' : 'hover:bg-gray-800'
    } group`}
  >
    {loading ? (
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
    ) : isActive ? (
      activeIcon
    ) : (
      inactiveIcon
    )}
  </button>
);

export function ChapterList({
  chapters = [],
  onDelete,
  onEdit,
  onOrderUpdate,
  onToggleVisibility,
  onTogglePerfectOnly,
  courseId
}: ChapterListProps) {
  const [isReordering, setIsReordering] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(chapters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setIsReordering(true);
    try {
      await onOrderUpdate(items);
    } finally {
      setIsReordering(false);
    }
  };

  const handleResetOrder = async () => {
    try {
      setIsReordering(true);
      await courseApi.resetChapterOrder(courseId);
      toast.success('チャプター番号を初期化しました');
      // リストを再取得するために既存のonOrderUpdate関数を使用
      await onOrderUpdate(chapters);
    } catch (error) {
      console.error('Failed to reset chapter order:', error);
      toast.error('チャプター番号の初期化に失敗しました');
    } finally {
      setIsReordering(false);
    }
  };


  const handleVisibilityToggle = async (chapterId: string, currentVisible: boolean) => {
    try {
      setIsUpdating(chapterId);
      const result = await courseApi.toggleChapterVisibility(courseId, chapterId, !currentVisible);
      
      if (result.success) {
        toast.success(
          currentVisible ? 'チャプターを非表示にしました' : 'チャプターを表示に設定しました'
        );
        onToggleVisibility(chapterId, !currentVisible);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('設定の更新に失敗しました');
      console.error('Visibility toggle error:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handlePerfectModeToggle = async (chapterId: string, currentPerfectOnly: boolean) => {
    try {
      setIsUpdating(chapterId);
      const result = await courseApi.toggleChapterPerfectMode(courseId, chapterId, !currentPerfectOnly);
      
      if (result.success) {
        toast.success(
          currentPerfectOnly ? 'パーフェクトモードを解除しました' : 'パーフェクトモードを設定しました'
        );
        onTogglePerfectOnly(chapterId, !currentPerfectOnly);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('設定の更新に失敗しました');
      console.error('Perfect mode toggle error:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700">
        <p className="text-gray-300">
          チャプターがありません
        </p>
        <p className="text-sm text-gray-400 mt-1">
          新規チャプターを作成してコースを始めましょう
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">チャプター一覧</h2>
       <button
  onClick={handleResetOrder}
  disabled={isReordering}
  className={`px-4 py-2 rounded-lg ${
    isReordering ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
  } text-white transition-colors`}
>
  {isReordering ? '処理中...' : 'チャプター番号を初期化'}
</button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="chapters">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {isReordering && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
                </div>
              )}
              {chapters.map((chapter, index) => (
                <Draggable
                  key={chapter.id}
                  draggableId={chapter.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-gray-900 rounded-lg border border-gray-700 transition-all ${
                        snapshot.isDragging ? 'shadow-lg shadow-gray-900/50' : 'shadow-sm'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-move p-1 rounded hover:bg-gray-800 group"
                              >
                                <svg
                                  className="w-5 h-5 text-gray-400 group-hover:text-gray-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 8h16M4 16h16"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-white">
                                  <span className="text-gray-400 mr-2">#{index + 1}</span>
                                  {chapter.title}
                                </h3>
                                {chapter.subtitle && (
                                  <p className="text-sm text-gray-300 mt-1">
                                    {chapter.subtitle}
                                  </p>
                                )}
                                <div className="flex items-center space-x-2 mt-2">
                                  {!chapter.isVisible && (
                                    <StatusBadge type="invisible">非表示</StatusBadge>
                                  )}
                                  {chapter.isPerfectOnly && (
                                    <StatusBadge type="perfect">Perfect専用</StatusBadge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">
                                  コンテンツタイプ:
                                </span>
                                <span className="ml-2 text-gray-300">
                                  {chapter.content?.type === 'video' ? '動画' : '音声'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  制限時間:
                                </span>
                                <span className="ml-2 text-gray-300">
                                  {chapter.timeLimit ? `${chapter.timeLimit}日` : '-'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">
                                  解放時間:
                                </span>
                                <span className="ml-2 text-gray-300">
                                  {chapter.releaseTime ? `${chapter.releaseTime}日後` : '即時'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2 ml-4">
                            <ToggleButton
                              onClick={() => handleVisibilityToggle(chapter.id, chapter.isVisible)}
                              isActive={chapter.isVisible}
                              loading={isUpdating === chapter.id}
                              title={chapter.isVisible ? '非表示にする' : '表示する'}
                              activeIcon={
                                <svg className="w-5 h-5 text-green-400 group-hover:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              }
                              inactiveIcon={
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              }
                            />

                            <ToggleButton
                              onClick={() => handlePerfectModeToggle(chapter.id, chapter.isPerfectOnly)}
                              isActive={chapter.isPerfectOnly}
                              loading={isUpdating === chapter.id}
                              title={chapter.isPerfectOnly ? 'Perfect専用を解除' : 'Perfect専用に設定'}
                              activeIcon={
                                <svg 
                                  className="w-5 h-5 text-purple-400 group-hover:text-purple-300"
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                              }
                              inactiveIcon={
                                <svg 
                                  className="w-5 h-5 text-gray-400 group-hover:text-gray-300"
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                              }
                            />

                            <button
                              onClick={() => onEdit(chapter.id)}
                              className="p-2 rounded-lg hover:bg-gray-800 group transition-colors"
                            >
                              <svg
                                className="w-5 h-5 text-blue-400 group-hover:text-blue-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>

                            <button
                              onClick={() => onDelete(chapter.id)}
                              className="p-2 rounded-lg hover:bg-gray-800 group transition-colors"
                            >
                              <svg
                                className="w-5 h-5 text-red-400 group-hover:text-red-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
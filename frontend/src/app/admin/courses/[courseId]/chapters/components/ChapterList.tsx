'use client';

import { useTheme } from '@/contexts/theme';
import { Chapter } from '@/types/course';
import { useRouter } from 'next/navigation'; // 追加
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useState } from 'react';

interface ChapterListProps {
  chapters?: Chapter[];
  onDelete: (chapterId: string) => void;
  onEdit: (chapterId: string) => void;
  onOrderUpdate: (chapters: Chapter[]) => void;
  onToggleVisibility: (chapterId: string, isVisible: boolean) => void;
  onTogglePerfectOnly: (chapterId: string, isPerfectOnly: boolean) => void;
  courseId: string; // 追加
}

export function ChapterList({ 
  chapters = [], 
  onDelete, 
  onEdit, 
  onOrderUpdate,
  onToggleVisibility,
  onTogglePerfectOnly,
  courseId  // 追加
}: ChapterListProps) {
  const { theme } = useTheme();
  const router = useRouter(); // 追加
  const [isReordering, setIsReordering] = useState(false);

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

  if (chapters.length === 0) {
    return (
      <div className={`text-center py-12 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        チャプターがありません
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="chapters">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {isReordering && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                    className={`${
                      theme === 'dark'
                        ? 'bg-gray-800/80 hover:bg-gray-700'
                        : 'bg-white hover:bg-gray-50'
                    } rounded-lg shadow-sm transition-colors ${
                      snapshot.isDragging ? 'shadow-lg' : ''
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div
                              {...provided.dragHandleProps}
                              className={`cursor-move p-1 rounded ${
                                theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              }`}
                            >
                              <svg
                                className={`w-5 h-5 ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}
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
                              <h3 className={`text-lg font-semibold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {chapter.title}
                              </h3>
                              {chapter.subtitle && (
                                <p className={`text-sm mt-1 ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  {chapter.subtitle}
                                </p>
                              )}
                              {/* ステータスバッジ */}
                              <div className="flex items-center space-x-2 mt-2">
                                {!chapter.isVisible && (
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    theme === 'dark' 
                                      ? 'bg-gray-700 text-gray-300' 
                                      : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    非表示
                                  </span>
                                )}
                                {chapter.isPerfectOnly && (
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    theme === 'dark' 
                                      ? 'bg-purple-900/50 text-purple-300' 
                                      : 'bg-purple-100 text-purple-600'
                                  }`}>
                                    Perfect専用
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                コンテンツタイプ:
                              </span>
                              <span className={`ml-2 font-medium ${
                                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                              }`}>
                                {chapter.content?.type === 'video' ? '動画' : '音声'}
                              </span>
                            </div>
                            <div>
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                制限時間:
                              </span>
                              <span className={`ml-2 font-medium ${
                                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                              }`}>
                                {chapter.timeLimit || '-'} 分
                              </span>
                            </div>
                            <div>
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                解放時間:
                              </span>
                              <span className={`ml-2 font-medium ${
                                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                              }`}>
                                {chapter.releaseTime ? `${chapter.releaseTime}分後` : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {/* 表示/非表示トグル */}
                          <button
                            onClick={() => onToggleVisibility(chapter.id, !chapter.isVisible)}
                            className={`p-2 rounded group ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-700' 
                                : 'hover:bg-gray-100'
                            }`}
                            title={chapter.isVisible ? '非表示にする' : '表示する'}
                          >
                            {chapter.isVisible ? (
                              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            )}
                          </button>

                          {/* Perfect専用トグル */}
                          <button
                            onClick={() => onTogglePerfectOnly(chapter.id, !chapter.isPerfectOnly)}
                            className={`p-2 rounded group ${
                              theme === 'dark' 
                                ? 'hover:bg-purple-900/30' 
                                : 'hover:bg-purple-100'
                            }`}
                            title={chapter.isPerfectOnly ? 'Perfect専用を解除' : 'Perfect専用に設定'}
                          >
                            <svg 
                              className={`w-5 h-5 ${
                                chapter.isPerfectOnly
                                  ? 'text-purple-500'
                                  : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`} 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </button>

                          {/* 編集ボタン */}
                          <button
    onClick={() => router.push(`/admin/courses/${courseId}/chapters/${chapter.id}`)}
    className={`p-2 rounded group ${
      theme === 'dark' 
        ? 'hover:bg-blue-900/30' 
        : 'hover:bg-blue-100'
    }`}
  >
    <svg
      className={`w-5 h-5 ${
        theme === 'dark' 
          ? 'text-blue-400 group-hover:text-blue-300'
          : 'text-blue-500 group-hover:text-blue-600'
      }`}
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

                          {/* 削除ボタン */}
                          <button
                            onClick={() => onDelete(chapter.id)}
                            className={`p-2 rounded group ${
                              theme === 'dark' 
                                ? 'hover:bg-red-900/30' 
                                : 'hover:bg-red-100'
                            }`}
                          >
                            <svg
                              className={`w-5 h-5 ${
                                theme === 'dark' 
                                  ? 'text-red-400 group-hover:text-red-300'
                                  : 'text-red-500 group-hover:text-red-600'
                              }`}
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
  );
}
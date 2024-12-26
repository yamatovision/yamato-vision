'use client';
import { useTheme } from '@/contexts/theme';
import { Chapter } from '@/types/course';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useState } from 'react';

interface ChapterListProps {
  chapters?: Chapter[];
  onDelete: (chapterId: string) => void;
  onEdit: (chapterId: string) => void;  // 追加
  onOrderUpdate: (chapters: Chapter[]) => void;
}

export function ChapterList({ chapters = [], onDelete, onEdit, onOrderUpdate }: ChapterListProps) {

  const { theme } = useTheme();
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
  <button
    onClick={() => onEdit(chapter.id)}
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
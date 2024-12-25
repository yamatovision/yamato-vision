'use client';

import { useTheme } from '@/contexts/theme';
import { useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder
}: RichTextEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    handleInput();
    editorRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${
        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
      }`}>
        {label}
      </label>

      <div className={`border rounded-lg overflow-hidden ${
        theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
      } ${isFocused ? 'ring-2 ring-blue-500' : ''}`}>
        {/* ツールバー */}
        <div className={`flex items-center px-2 py-1 gap-1 border-b ${
          theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className={`p-1 rounded hover:bg-gray-200 ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            title="太字"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => execCommand('italic')}
            className={`p-1 rounded hover:bg-gray-200 ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            title="斜体"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => execCommand('underline')}
            className={`p-1 rounded hover:bg-gray-200 ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            title="下線"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9h16M4 15h16" />
            </svg>
          </button>

          <span className={`h-4 mx-2 border-l ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
          }`} />

          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className={`p-1 rounded hover:bg-gray-200 ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            title="箇条書き"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            className={`p-1 rounded hover:bg-gray-200 ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            title="番号付きリスト"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10M3 8h.01M3 12h.01M3 16h.01" />
            </svg>
          </button>
        </div>

        {/* エディター */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          data-placeholder={placeholder} // placeholderをdata属性として追加
          className={`min-h-[200px] p-3 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white'
              : 'bg-white text-gray-900'
          } focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400`}
        />
      </div>
    </div>
  );
}
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

  // 値の同期を改善
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // 入力ハンドリングの改善
  const handleInput = () => {
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      // 現在の値と異なる場合のみ更新
      if (newValue !== value) {
        onChange(newValue);
      }
    }
  };

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput(); // コマンド実行後に値を更新
    }
  };

  // IME入力のハンドリングを追加
  const handleCompositionEnd = () => {
    handleInput();
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
          {/* 既存のツールバーボタン */}
          {/* ... */}
        </div>

        {/* エディター本体 */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onCompositionEnd={handleCompositionEnd}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          data-placeholder={placeholder}
          className={`min-h-[200px] p-3 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white'
              : 'bg-white text-gray-900'
          } focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400`}
          style={{
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        />
      </div>
    </div>
  );
}
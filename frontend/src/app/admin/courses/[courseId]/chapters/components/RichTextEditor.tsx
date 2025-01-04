// frontend/src/app/admin/courses/[courseId]/chapters/components/RichTextEditor.tsx

'use client';

import { useTheme } from '@/contexts/theme';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { uploadToCloudinary } from '@/lib/api/cloudinaryUpload';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toolbarFeatures = [
    {
      group: 'text',
      items: [
        { command: 'bold', icon: 'format_bold', tooltip: '太字' },
        { command: 'italic', icon: 'format_italic', tooltip: '斜体' },
        { command: 'underline', icon: 'format_underline', tooltip: '下線' },
        { command: 'strikethrough', icon: 'strikethrough_s', tooltip: '取り消し線' }
      ]
    },
    {
      group: 'paragraph',
      items: [
        { command: 'h2', text: 'H2', tooltip: '見出し2' },
        { command: 'h3', text: 'H3', tooltip: '見出し3' },
        { command: 'bulletList', icon: 'format_list_bulleted', tooltip: '箇条書き' },
        { command: 'orderedList', icon: 'format_list_numbered', tooltip: '番号付きリスト' }
      ]
    },
    {
      group: 'media',
      items: [
        { command: 'image', icon: 'image', tooltip: '画像を挿入' },
        { command: 'link', icon: 'link', tooltip: 'リンクを挿入' },
        { command: 'code', icon: 'code', tooltip: 'コードブロック' }
      ]
    }
  ];

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = async (command: string) => {
    switch (command) {
      case 'image':
        fileInputRef.current?.click();
        break;
      case 'link':
        const url = prompt('リンクのURLを入力してください:');
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
      case 'code':
        document.execCommand('insertHTML', false, '<pre><code>コードを入力</code></pre>');
        break;
      case 'h2':
        document.execCommand('formatBlock', false, '<h2>');
        break;
      case 'h3':
        document.execCommand('formatBlock', false, '<h3>');
        break;
      case 'bulletList':
        document.execCommand('insertUnorderedList', false);
        break;
      case 'orderedList':
        document.execCommand('insertOrderedList', false);
        break;
      default:
        document.execCommand(command, false);
    }
    handleInput();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('画像をアップロード中...', { id: 'imageUpload' });
      
      const imageUrl = await uploadToCloudinary(
        file,
        'chapter-tasks',
        (progress) => {
          console.log('Upload progress:', progress);
        }
      );
      
      if (editorRef.current) {
        const img = `<img src="${imageUrl}" alt="" style="max-width: 100%; height: auto;" />`;
        document.execCommand('insertHTML', false, img);
        handleInput();
      }
      
      toast.success('画像をアップロードしました', { id: 'imageUpload' });
      
      // ファイル入力をリセット
      if (event.target) {
        event.target.value = '';
      }
    } catch (error) {
      console.error('画像のアップロードに失敗しました:', error);
      toast.error('画像のアップロードに失敗しました', { id: 'imageUpload' });
    }
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
        <div className={`flex flex-wrap items-center p-2 gap-1 border-b ${
          theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          {toolbarFeatures.map((group, index) => (
            <div key={index} className="flex items-center gap-1">
              {group.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => execCommand(item.command)}
                  className={`p-2 rounded hover:bg-opacity-80 ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                  title={item.tooltip}
                  type="button"
                >
                  {item.icon ? (
                    <span className="material-icons text-xl">{item.icon}</span>
                  ) : (
                    item.text
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`min-h-[300px] p-4 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white'
              : 'bg-white text-gray-900'
          } focus:outline-none`}
          placeholder={placeholder}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
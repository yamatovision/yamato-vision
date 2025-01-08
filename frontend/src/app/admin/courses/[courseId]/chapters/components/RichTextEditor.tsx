'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { uploadToCloudinary } from '@/lib/api/cloudinaryUpload';

interface ToolbarItem {
  command: string;
  text: string;
  tooltip: string;
}

interface ToolbarGroup {
  group: string;
  items: ToolbarItem[];
}

const toolbarFeatures: ToolbarGroup[] = [
  {
    group: 'テキスト装飾',
    items: [
      { command: 'bold', text: '太字', tooltip: '太字' },
      { command: 'italic', text: '斜体', tooltip: '斜体' },
      { command: 'underline', text: '_あ_', tooltip: '下線' },
      { command: 'strikethrough', text: '取消', tooltip: '取り消し線' }
    ]
  },
  {
    group: '段落スタイル',
    items: [
      { command: 'h2', text: 'H2', tooltip: '見出し2' },
      { command: 'h3', text: 'H3', tooltip: '見出し3' },
      { command: 'bulletList', text: '・', tooltip: '箇条書き' },
      { command: 'orderedList', text: '1.', tooltip: '番号付きリスト' }
    ]
  },
  {
    group: 'メディア',
    items: [
      { command: 'image', text: '🖼', tooltip: '画像を挿入' },
      { command: 'link', text: '🔗', tooltip: 'リンクを挿入' },
      { command: 'code', text: '</>', tooltip: 'コードブロック' }
    ]
  }
];

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
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      <label className="block text-sm font-medium text-gray-200">
        {label}
      </label>

      <div className={`border rounded-lg overflow-hidden border-secondary-700 
        ${isFocused ? 'ring-2 ring-primary-500' : ''}`}>
        <div className="flex flex-wrap items-center p-2 gap-1 border-b bg-secondary-900 border-secondary-700">
          {toolbarFeatures.map((group, index) => (
            <div key={index} className="flex items-center gap-1 px-2 border-r border-secondary-700 last:border-r-0">
              {group.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => execCommand(item.command)}
                  className="p-2 rounded text-secondary-200 hover:bg-secondary-700 
                    hover:text-primary-400 transition-colors duration-200"
                  title={item.tooltip}
                  type="button"
                >
                  {item.text}
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
          className="min-h-[300px] p-4 bg-secondary-800 text-secondary-100 focus:outline-none"
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

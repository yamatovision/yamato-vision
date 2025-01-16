'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useTheme } from '@/contexts/theme';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { avatarApi } from '@/lib/api/avatar';
import { toast } from 'react-hot-toast';

interface AvatarGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (avatarUrl: string) => Promise<void>;
}


interface AvatarQuestion {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    description: string;
    prompt: string;
  }[];
}

interface ColorOption {
  value: string;
  label: string;
  hex: string;  // カラーパレット用のカラーコード
  prompt: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  { value: 'white', label: 'ホワイト', hex: '#FFFFFF', prompt: 'white color scheme' },
  { value: 'black', label: 'ブラック', hex: '#333333', prompt: 'black color scheme' },
  { value: 'gold', label: 'ゴールド', hex: '#FFD700', prompt: 'gold color scheme' },
  { value: 'silver', label: 'シルバー', hex: '#C0C0C0', prompt: 'silver color scheme' },
  { value: 'red', label: 'レッド', hex: '#FF4444', prompt: 'red color scheme' },
  { value: 'light-blue', label: 'ライトブルー', hex: '#87CEEB', prompt: 'light blue color scheme' },
  { value: 'purple', label: 'パープル', hex: '#9370DB', prompt: 'purple color scheme' },
  { value: 'green', label: 'グリーン', hex: '#98FB98', prompt: 'green color scheme' },
  { value: 'orange', label: 'オレンジ', hex: '#FFA500', prompt: 'orange color scheme' },
  { value: 'pink', label: 'ピンク', hex: '#FFB6C1', prompt: 'pink color scheme' }
];
const HAIR_COLORS: ColorOption[] = [
  { value: 'black-hair', label: '黒髪', hex: '#1A1A1A', prompt: 'black hair' },
  { value: 'brown-hair', label: '茶髪', hex: '#8B4513', prompt: 'brown hair' },
  { value: 'blonde-hair', label: '金髪', hex: '#FFD700', prompt: 'blonde hair' },
  { value: 'silver-hair', label: '銀髪', hex: '#C0C0C0', prompt: 'silver hair' },
  { value: 'white-hair', label: '白髪', hex: '#FFFFFF', prompt: 'white hair' },
  { value: 'red-hair', label: '赤髪', hex: '#FF4444', prompt: 'red hair' },
  { value: 'blue-hair', label: '青髪', hex: '#4169E1', prompt: 'blue hair' },
  { value: 'purple-hair', label: '紫髪', hex: '#9370DB', prompt: 'purple hair' },
  { value: 'green-hair', label: '緑髪', hex: '#98FB98', prompt: 'green hair' },
  { value: 'pink-hair', label: 'ピンク髪', hex: '#FFB6C1', prompt: 'pink hair' }
];

// 目の色のオプション
const EYE_COLORS: ColorOption[] = [
  { value: 'black-eyes', label: '黒目', hex: '#1A1A1A', prompt: 'black eyes' },
  { value: 'brown-eyes', label: '茶目', hex: '#8B4513', prompt: 'brown eyes' },
  { value: 'blue-eyes', label: '青目', hex: '#4169E1', prompt: 'blue eyes' },
  { value: 'green-eyes', label: '緑目', hex: '#98FB98', prompt: 'green eyes' },
  { value: 'red-eyes', label: '赤目', hex: '#FF4444', prompt: 'red eyes' },
  { value: 'purple-eyes', label: '紫目', hex: '#9370DB', prompt: 'purple eyes' },
  { value: 'gold-eyes', label: '金目', hex: '#FFD700', prompt: 'gold eyes' },
  { value: 'silver-eyes', label: '銀目', hex: '#C0C0C0', prompt: 'silver eyes' },
  { value: 'orange-eyes', label: 'オレンジ目', hex: '#FFA500', prompt: 'orange eyes' },
  { value: 'pink-eyes', label: 'ピンク目', hex: '#FFB6C1', prompt: 'pink eyes' }
];

const AVATAR_QUESTIONS: AvatarQuestion[] = [
  {
    id: 'gender',
    question: '性別を選択してください',
    options: [
      { 
        value: 'male', 
        label: '男性', 
        description: '男性キャラクター',
        prompt: 'male character, masculine features'
      },
      { 
        value: 'female', 
        label: '女性', 
        description: '女性キャラクター',
        prompt: 'female character, feminine features'
      }
    ]
  },
  {
    id: 'age',
    question: '年齢層を選択してください',
    options: [
      { 
        value: 'teen', 
        label: '10代', 
        description: '若々しい少年/少女',
        prompt: 'teenage character, young features, youthful appearance'
      },
      { 
        value: 'young_adult', 
        label: '20代前半', 
        description: 'フレッシュな青年/女性',
        prompt: 'young adult character, fresh and energetic appearance'
      },
      { 
        value: 'adult', 
        label: '20代後半〜30代', 
        description: '大人の魅力',
        prompt: 'mature adult character, refined appearance'
      },
      { 
        value: 'middle_aged', 
        label: '40代〜50代', 
        description: '落ち着いた大人の魅力',
        prompt: 'middle-aged character, dignified appearance, mature features'
      }
    ]
  },
  {
    id: 'vibe',
    question: 'キャラクターの雰囲気を選択してください',
    options: [
      { 
        value: 'cyber', 
        label: 'サイバーチック', 
        description: '未来的でハイテクな印象',
        prompt: 'cyberpunk style, futuristic details, high-tech appearance'
      },
      { 
        value: 'natural', 
        label: 'ナチュラル', 
        description: '自然で親しみやすい印象',
        prompt: 'natural style, organic design, warm and approachable'
      },
      { 
        value: 'mysterious', 
        label: 'ミステリアス', 
        description: '神秘的で謎めいた印象',
        prompt: 'mysterious aura, enigmatic appearance, subtle dramatic lighting'
      },
      { 
        value: 'smart', 
        label: 'スマート', 
        description: '知的でシャープな印象',
        prompt: 'smart appearance, intellectual style, refined and elegant'
      },
      { 
        value: 'friendly', 
        label: 'フレンドリー', 
        description: '明るく親しみやすい印象',
        prompt: 'friendly appearance, welcoming smile, cheerful expression'
      }
    ]
  }
];

// カラーパレットの実装部分
const ColorPalette = ({ onSelect, selectedColor }: { onSelect: (color: ColorOption) => void, selectedColor?: string }) => {
  return (
    <div className="grid grid-cols-5 gap-2 p-4">
      {COLOR_OPTIONS.map((color) => (
        <button
          key={color.value}
          onClick={() => onSelect(color)}
          className={`w-12 h-12 rounded-full transition-transform hover:scale-110 ${
            selectedColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
          }`}
          style={{ backgroundColor: color.hex }}
          title={color.label}
        />
      ))}
    </div>
  );
};




export function AvatarGeneratorModal({ isOpen, onClose, onComplete }: AvatarGeneratorModalProps) {
  const { theme } = useTheme();
  const [mode, setMode] = useState<'quick' | 'guided' | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [remainingGenerations, setRemainingGenerations] = useState(3);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const generatePrompt = (answers: Record<string, string>): string => {
    const selectedPrompts = AVATAR_QUESTIONS.map(question => {
      const selectedOption = question.options.find(
        option => option.value === answers[question.id]
      );
      return selectedOption?.prompt || '';
    });
  
    // 選択されたカラーを髪と目の色に適用
    const selectedColor = COLOR_OPTIONS.find(color => color.value === answers.color);
    const colorPrompt = selectedColor 
      ? `${selectedColor.prompt} hair and eyes` 
      : '';
  
    return `high quality CG character portrait, anime style, stylized 3D character, ${selectedPrompts.join(', ')}, ${colorPrompt}, detailed face modeling with perfect materials and textures, centered portrait, single character, professional 3D rendering`;
  };

  const handleAvatarComplete = async (imageUrl: string) => {
    try {
      setGenerationStatus('画像を処理中...');
      // URLから画像をフェッチ
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64Image = reader.result as string;
            await onComplete(base64Image);
            setGeneratedAvatar(imageUrl); // UI表示用にはURLを使用
            resolve();
          } catch (error) {
            console.error('Failed to process avatar:', error);
            reject(error);
          }
        };
        reader.onerror = () => {
          console.error('Failed to convert image to base64');
          reject(new Error('Failed to convert image to base64'));
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to process avatar:', error);
      toast.error('アバターの処理に失敗しました');
      throw error;
    } finally {
      setGenerationStatus('');
    }
  };
  const handleQuickGenerate = async () => {
    setIsGenerating(true);
    setGenerationStatus('生成を開始中...');
    try {
      const response = await avatarApi.generateAvatar({
        mode: 'quick',
        modelId: "2067ae52-33fd-4a82-bb92-c2c55e7d2786",
        styleUUID: "09d2b5b5-d7c5-4c02-905d-9f84051640f4",
        prompt: "high quality CG character portrait, anime style, stylized 3D character, young adult male character, blue color scheme, detailed face modeling with perfect materials and textures, centered portrait, single character, professional 3D rendering"
      });

      if (response.success && response.data) {
        await handleAvatarComplete(response.data.imageUrl);
        setRemainingGenerations(prev => prev - 1);
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Avatar generation failed:', error);
      toast.error('アバターの生成に失敗しました');
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  // 生成中の表示を更新
  {isGenerating && (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
      <p>AIがアバターを生成中...</p>
      {generationStatus && (
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        } mt-2`}>{generationStatus}</p>
      )}
    </div>
  )}


  const handleGuidedGenerate = async () => {
    console.log('Starting guided generation with answers:', answers);
    setIsGenerating(true);
    setGenerationStatus('ガイド付き生成を開始中...');
    
    try {
      const prompt = generatePrompt(answers);
      console.log('Generated prompt:', prompt);

      const response = await avatarApi.generateAvatar({
        mode: 'guided',
        prompt,
        modelId: "2067ae52-33fd-4a82-bb92-c2c55e7d2786",
        styleUUID: answers.style === 'anime' 
          ? "645e4195-f63d-4715-a3f2-3fb1e6eb8c70"
          : "8e2bc543-6ee2-45f9-bcd9-594b6ce84dcd"
      });

      if (response.success && response.data) {
        await handleAvatarComplete(response.data.imageUrl);
        setRemainingGenerations(prev => prev - 1);
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Avatar generation failed:', error);
      toast.error('アバターの生成に失敗しました');
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };


  const handleOptionClick = (option: typeof AVATAR_QUESTIONS[number]['options'][number]) => {
    console.log('Option clicked:', option); // デバッグログ
    console.log('Current step:', currentStep); // デバッグログ

    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [AVATAR_QUESTIONS[currentStep].id]: option.value
      };
      console.log('Updated answers:', newAnswers); // デバッグログ
      return newAnswers;
    });

    if (currentStep < AVATAR_QUESTIONS.length - 1) {
      setCurrentStep(prev => {
        console.log('Moving to next step:', prev + 1); // デバッグログ
        return prev + 1;
      });
    } else {
      console.log('Reached final step, starting generation...'); // デバッグログ
      handleGuidedGenerate();
    }
  };


  const handleReset = () => {
    setMode(null);
    setCurrentStep(0);
    setAnswers({});
    setGeneratedAvatar(null);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`mx-auto max-w-md rounded-xl p-6 ${
          theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } overflow-hidden`}>
          <Dialog.Title className={`text-xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
          }`}>
            AIアバターを生成
          </Dialog.Title>

          {/* モード選択 */}
          {!mode && !generatedAvatar && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setMode('quick');
                  handleQuickGenerate();
                }}
                className={`w-full p-4 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-50 hover:bg-gray-100'
                } flex items-center justify-between`}
              >
                <div className="text-left">
                  <div className="font-medium">クイック生成</div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    AIが自動でアバターを生成します
                  </div>
                </div>
                <SparklesIcon className="w-5 h-5 text-blue-500" />
              </button>

              <button
                onClick={() => setMode('guided')}
                className={`w-full p-4 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-50 hover:bg-gray-100'
                } flex items-center justify-between`}
              >
                <div className="text-left">
                  <div className="font-medium">カスタム生成</div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    質問に答えてアバターをカスタマイズ
                  </div>
                </div>
                <SparklesIcon className="w-5 h-5 text-blue-500" />
              </button>
            </div>
          )}



        {/* 質問フロー */}
{mode === 'guided' && !isGenerating && !generatedAvatar && currentStep < (AVATAR_QUESTIONS.length + 1) && (
  <div className="space-y-4">
    <div className="text-sm text-blue-500 mb-2">
      {currentStep + 1} / {AVATAR_QUESTIONS.length + 1}
    </div>
    
    {currentStep === 1 ? (
      // カラーパレット選択UI
      <>
        <h3 className="text-lg font-medium mb-4">
          テーマカラーを選択してください
        </h3>
        <ColorPalette
          onSelect={(color) => {
            setAnswers(prev => ({
              ...prev,
              color: color.value
            }));
            setCurrentStep(prev => prev + 1);
          }}
          selectedColor={answers.color}
        />
      </>
    ) : (
      // 通常の質問UI
      <>
        <h3 className="text-lg font-medium mb-4">
          {AVATAR_QUESTIONS[currentStep === 0 ? 0 : currentStep - 1].question}
        </h3>

        <div className="space-y-2">
          {AVATAR_QUESTIONS[currentStep === 0 ? 0 : currentStep - 1].options.map(option => (
            <button
              key={option.value}
              onClick={() => {
                setAnswers(prev => ({
                  ...prev,
                  [AVATAR_QUESTIONS[currentStep === 0 ? 0 : currentStep - 1].id]: option.value
                }));
                if (currentStep === 0) {
                  setCurrentStep(1); // カラーパレット選択へ
                } else if (currentStep < AVATAR_QUESTIONS.length) {
                  setCurrentStep(prev => prev + 1);
                } else {
                  handleGuidedGenerate();
                }
              }}
              className={`w-full p-4 text-left rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </>
    )}
  </div>
)}



          {/* 生成中 */}
          {isGenerating && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
              <p>AIがアバターを生成中...</p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              } mt-2`}>しばらくお待ちください</p>
            </div>
          )}

          {/* 生成結果 */}
          {generatedAvatar && !isGenerating && (
            <div className="text-center">
              <img
                src={generatedAvatar}
                alt="Generated Avatar"
                className="w-48 h-48 rounded-full mx-auto mb-4 border-4 border-blue-500 object-cover"
              />
              
              <div className="space-y-2">
                <button
                  onClick={() => onComplete(generatedAvatar)}
                  className={`w-full py-2 px-4 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition-colors`}
                >
                  このアバターを使用する
                </button>

                {remainingGenerations > 0 && (
                  <button
                    onClick={() => {
                      setGeneratedAvatar(null);
                      if (mode === 'quick') {
                        handleQuickGenerate();
                      } else {
                        setCurrentStep(0);
                        setAnswers({});
                      }
                    }}
                    className={`w-full py-2 px-4 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-100 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    もう一度生成する ({remainingGenerations}回残り)
                  </button>
                )}

                {mode === 'guided' && (
                  <button
                    onClick={handleReset}
                    className={`w-full py-2 px-4 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-100 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    最初から始める
                  </button>
                )}
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

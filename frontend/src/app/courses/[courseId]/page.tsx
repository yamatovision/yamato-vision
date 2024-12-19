'use client';

import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import { TimeRemaining } from '@/components/learning/Header/TimeRemaining';
import { ProgressBar } from '@/components/learning/Header/ProgressBar';
import { ParticipantList } from '@/components/learning/Participants/ParticipantList';
import { VideoPlayer } from '@/components/learning/CourseContent/VideoPlayer';
import { AudioPlayer } from '@/components/learning/CourseContent/AudioPlayer';
import { AttachmentFiles } from '@/components/learning/CourseContent/AttachmentFiles';
import { TaskDescription } from '@/components/learning/TaskSection/TaskDescription';
import { Examples } from '@/components/learning/TaskSection/Examples';

export default function CoursePage() {
  const { theme } = useTheme();
  const [contentType, setContentType] = useState<'video' | 'audio'>('video');
  
  const sampleFiles: AttachmentFile[] = [
    {
      id: '1',
      name: 'lesson_guide.pdf',
      size: 1024 * 1024 * 2.5,
      type: 'pdf' as const,  // 型を明示的に指定
      url: '/samples/guide.pdf'
    },
    {
      id: '2',
      name: 'reference_image.png',
      size: 1024 * 500,
      type: 'image' as const,  // 型を明示的に指定
      url: '/samples/image.png'
    }
  ];
  

  return (
    <div className="max-w-[800px] mx-auto pb-20">
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg mb-4`}>
        <div className="p-4 text-center">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            STAGE 2-1: 効果的なプロンプトの作成
          </p>
        </div>

        <div className="px-4 pb-4">
          <div className="flex justify-between items-center mb-2">
            <button className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} hover:opacity-80 transition-opacity`}>
              ←
            </button>
            <TimeRemaining />
            <div className="w-6" />
          </div>
          <ProgressBar progress={45} />
        </div>
      </div>
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm p-2 rounded-lg mb-4`}>
        <ParticipantList />
      </div>

      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-6 mb-6`}>
        <h1 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'}`}>
          プロンプトエンジニアリング基礎
        </h1>

        <div className="flex justify-end space-x-2 mb-4">
          <button
            onClick={() => setContentType('video')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              contentType === 'video'
                ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
          >
            動画
          </button>
          <button
            onClick={() => setContentType('audio')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              contentType === 'audio'
                ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
          >
            音声
          </button>
        </div>

        {contentType === 'video' ? <VideoPlayer /> : <AudioPlayer />}

        <div className="mt-4">
          <AttachmentFiles files={sampleFiles} />
        </div>
      </div>
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-6 mb-6`}>
        <div className="max-w-[800px] mx-auto">
          <Examples />
        </div>
      </div>

      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg p-6`}>
        <div className="max-w-[700px] mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'}`}>
              実践課題
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              以下のシナリオに対して、最適なプロンプトを作成してください。
              作成したプロンプトは実際に動作確認を行い、結果と共に提出してください。
            </p>
            <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'} rounded-lg p-3 border ${
              theme === 'dark' ? 'border-gray-600' : 'border-blue-100'
            }`}>
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-200' : 'text-[#1E40AF]'}`}>
                シナリオ：ECサイトの商品説明文を生成するAIシステムを構築したい。
                ブランドの特徴を維持しながら、魅力的な説明文を生成するプロンプトを作成してください。
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'}`}>
              あなたの回答
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  プロンプト
                </label>
                <textarea 
                  className={`w-full h-32 rounded-lg p-3 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-900 border-gray-200'
                  } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                  placeholder="プロンプトを入力してください"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  動作結果
                </label>
                <textarea 
                  className={`w-full h-32 rounded-lg p-3 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-900 border-gray-200'
                  } border focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                  placeholder="AIの出力結果を貼り付けてください"
                />
              </div>
              <div className="flex justify-end">
                <button className={`${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white px-6 py-3 rounded-lg font-bold transition-colors`}>
                  課題を提出
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
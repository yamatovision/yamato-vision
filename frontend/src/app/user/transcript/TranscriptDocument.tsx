'use client';

import { useTheme } from '@/contexts/theme';
import { useProfile } from '@/lib/hooks/useProfile';

export function TranscriptDocument() {
  const { theme } = useTheme();
  const { userData } = useProfile();

  return (
    <div className="font-serif max-w-[210mm] mx-auto bg-white text-black p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-4">成績証明書</h1>
        <p>Tech Academy Online University</p>
      </div>

      <div className="mb-8 border p-4">
        <p>学籍番号：{userData?.studentId || '-'}</p>
        <p>氏名：{userData?.name || userData?.nickname || '-'}</p>
        <p>入学年月日：{userData?.enrollmentYear ? `${userData.enrollmentYear}年4月1日` : '-'}</p>
      </div>

      <div className="mb-8 border p-4 bg-gray-50">
        <h3 className="font-bold mb-2">評価基準</h3>
        <p className="text-sm">
          秀 (90-100点) = 4.0 | 優 (80-89点) = 3.0 | 良 (70-79点) = 2.0 | 可 (60-69点) = 1.0 | 不可 (0-59点) = 0.0
        </p>
      </div>

      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-50">履修年月日</th>
            <th className="border p-2 bg-gray-50">コース名</th>
            <th className="border p-2 bg-gray-50">単位数</th>
            <th className="border p-2 bg-gray-50">評価</th>
            <th className="border p-2 bg-gray-50">GP</th>
            <th className="border p-2 bg-gray-50">ポイント</th>
          </tr>
        </thead>
        <tbody>
          {userData?.gradeHistory?.map((grade) => (
            <tr key={grade.id}>
              <td className="border p-2">
                {new Date(grade.completedAt).toLocaleDateString('ja-JP')}
              </td>
              <td className="border p-2">{grade.course.title}</td>
              <td className="border p-2 text-center">{grade.credits}</td>
              <td className="border p-2 text-center">{grade.grade}</td>
              <td className="border p-2 text-center">{grade.gradePoint.toFixed(1)}</td>
              <td className="border p-2 text-center">
                {(grade.credits * grade.gradePoint).toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-8 border-t-2 border-b-2 border-black py-4">
        <p>取得単位数合計：{userData?.totalCredits || 0}単位</p>
        <p>GPA：{userData?.gpa?.toFixed(2) || '0.00'}</p>
      </div>

      <div className="text-right mt-16">
        <p>上記の通り証明する</p>
        <p>{new Date().toLocaleDateString('ja-JP')}</p>
        <p>大和ViSiON大學校</p>
        <p>学長 白石達也</p>
      </div>

      <div className="text-center mt-8 border border-gray-300 inline-block p-4">
        ［公印］
      </div>
    </div>
  );
}

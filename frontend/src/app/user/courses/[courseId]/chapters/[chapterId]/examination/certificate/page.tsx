// frontend/src/app/user/courses/[courseId]/chapters/[chapterId]/examination/certificate/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseApi } from '@/lib/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/contexts/toast';

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [certificateData, setCertificateData] = useState<{
    studentName: string;
    studentId: string;
    courseName: string;
    grade: string;
    score: number;
    completedAt: string;
    certificateId: string;
  } | null>(null);

  useEffect(() => {
    loadCertificateData();
  }, []);

  const loadCertificateData = async () => {
    try {
      const response = await courseApi.getExamCertificate(
        params.courseId as string,
        params.chapterId as string
      );
      
      if (response.success) {
        setCertificateData(response.data);
      } else {
        showToast('証明書データの取得に失敗しました', 'error');
      }
    } catch (error) {
      console.error('Failed to load certificate data:', error);
      showToast('証明書データの取得に失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAsPDF = async () => {
    if (!certificateRef.current) return;

    try {
      showToast('証明書を生成中です...', 'info');
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`certificate_${certificateData?.certificateId}.pdf`);
      
      showToast('証明書をダウンロードしました', 'success');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      showToast('PDFの生成に失敗しました', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl text-white mb-4">証明書データが見つかりません</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 証明書プレビュー */}
        <div
          ref={certificateRef}
          className="bg-white p-12 rounded-lg shadow-lg mb-8"
          style={{ minHeight: '595px' }} // A4サイズ相当
        >
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">成績証明書</h1>
            <p className="text-xl text-gray-600">大和ViSiON大學校</p>
          </div>

          {/* 学生情報 */}
          <div className="mb-12">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-gray-600">学籍番号</p>
                <p className="text-xl font-bold text-gray-900">{certificateData.studentId}</p>
              </div>
              <div>
                <p className="text-gray-600">氏名</p>
                <p className="text-xl font-bold text-gray-900">{certificateData.studentName}</p>
              </div>
            </div>
          </div>

          {/* コース情報 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{certificateData.courseName}</h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-gray-600">評価</p>
                <p className="text-3xl font-bold text-gray-900">{certificateData.grade}</p>
              </div>
              <div>
                <p className="text-gray-600">得点</p>
                <p className="text-3xl font-bold text-gray-900">{certificateData.score}点</p>
              </div>
            </div>
          </div>

          {/* 認定情報 */}
          <div className="mt-16">
            <p className="text-gray-900">
              上記の者は、本コースの最終試験において優秀な成績を収めたことを証明します。
            </p>
            <p className="text-gray-900 mt-8">
              認定日: {new Date(certificateData.completedAt).toLocaleDateString('ja-JP')}
            </p>
            <div className="mt-12 text-right">
              <p className="text-gray-900 font-bold">大和ViSiON大學校</p>
              <p className="text-gray-900">学長 山田 太郎</p>
            </div>
            <div className="mt-8 text-gray-500 text-sm">
              証明書番号: {certificateData.certificateId}
            </div>
          </div>
        </div>

        {/* ダウンロードボタン */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={downloadAsPDF}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            PDFをダウンロード
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}
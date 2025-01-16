'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TranscriptDocument } from './TranscriptDocument';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function TranscriptPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    const element = document.getElementById('transcript-document');
    if (!element) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('academic_transcript.pdf');
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg">
        <div id="transcript-document">
          <TranscriptDocument />
        </div>
      </div>
      
      <div className="max-w-[210mm] mx-auto mt-8 flex justify-between px-4">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          戻る
        </button>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {isGenerating ? '生成中...' : 'PDFをダウンロード'}
        </button>
      </div>
    </div>
  );
}
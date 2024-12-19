import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import BaseLayout from '@/components/layout/BaseLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '大和ViSiON',
  description: 'AIスキル習得のためのオンライン学習プラットフォーム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <AuthProvider>
          <ThemeProvider>
            <div className="yamato-theme">
              <BaseLayout>{children}</BaseLayout>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

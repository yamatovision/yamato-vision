import { AuthProvider } from '@/contexts/AuthProvider';  // ファイル名を正しく参照
import { ThemeProvider } from '@/contexts/theme';
import { ToastProvider } from '@/contexts/toast';
import { NotificationProvider } from '@/contexts/notification';

import '@/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
            <NotificationProvider>

              {children}
              </NotificationProvider>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import { ReactNode } from 'react';
import BaseLayout from '@/components/layout/BaseLayout';

export default function CourseLayout({ children }: { children: ReactNode }) {
  return <BaseLayout>{children}</BaseLayout>;
}

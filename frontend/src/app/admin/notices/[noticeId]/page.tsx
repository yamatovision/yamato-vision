import { NoticeForm } from '../NoticeForm';

export default function NoticeEditPage({ params }: { params: { noticeId: string } }) {
  const isNew = params.noticeId === 'new';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#2C3E50]">
        {isNew ? 'お知らせ新規作成' : 'お知らせ編集'}
      </h2>
      <NoticeForm noticeId={isNew ? null : params.noticeId} />
    </div>
  );
}
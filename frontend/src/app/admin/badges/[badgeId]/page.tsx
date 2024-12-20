import { BadgeForm } from '../BadgeForm';

export default function BadgeEditPage({ params }: { params: { badgeId: string } }) {
  const isNew = params.badgeId === 'new';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#2C3E50]">
        {isNew ? 'バッジ新規作成' : 'バッジ編集'}
      </h2>
      <BadgeForm badgeId={isNew ? null : params.badgeId} />
    </div>
  );
}
// frontend/src/app/user/components/ExperiencePopup.tsx
'use client';

interface ExperiencePopupProps {
  amount: number;
}

export function ExperiencePopup({ amount }: ExperiencePopupProps) {
  return (
    <div className="absolute top-4 right-4 animate-fade-in-up z-10">
      <div className="bg-gradient-to-r from-green-600 to-green-400 text-white px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="text-xl">✨</span>
          <div className="text-lg font-bold">+{amount} EXP</div>
        </div>
      </div>
    </div>
  );
}
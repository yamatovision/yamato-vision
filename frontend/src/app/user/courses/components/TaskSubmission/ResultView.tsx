// frontend/src/app/user/courses/[courseId]/chapters/[chapterId]/components/TaskSubmission/ResultView.tsx
interface ResultViewProps {
  result: {
    score: number;
    feedback: string;
    nextStep: string;
  };
}

export const ResultView: React.FC<ResultViewProps> = ({ result }) => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-b from-blue-900 to-purple-900 rounded-lg p-6 text-center">
        <div className="mb-4">
          <span className="text-yellow-400 text-6xl">{result.score}</span>
          <span className="text-2xl">点</span>
        </div>
        <div className="text-green-400 text-xl">
          {result.score >= 90 ? 'Excellent! 🎉' : 'Good job! 👍'}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="font-bold mb-4">AI評価</h2>
        <div className="bg-gray-700 rounded-lg p-4 text-sm">
          <p className="text-gray-300 leading-relaxed">
            {result.feedback}
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="font-bold mb-4">次のステップ</h2>
        <div className="bg-gray-700 rounded-lg p-4 text-sm">
          <p className="text-gray-300 leading-relaxed">
            {result.nextStep}
          </p>
        </div>
      </div>
    </div>
  );
};
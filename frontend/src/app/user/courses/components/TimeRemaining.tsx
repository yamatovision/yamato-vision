// src/app/user/courses/components/TimeRemaining.tsx
interface TimeRemainingProps {
  initialTime: number;
}

export function TimeRemaining({ initialTime }: TimeRemainingProps) {
  const { theme } = useTheme();
  const [remainingTime, setRemainingTime] = useState(initialTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        残り時間
      </div>
      <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'}`}>
        {formatTime(remainingTime)}
      </div>
    </div>
  );
}
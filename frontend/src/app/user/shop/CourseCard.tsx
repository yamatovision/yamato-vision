// CourseCard.tsx
import { useTheme } from '@/contexts/theme';
import { CourseStatus } from '@/types/course';
interface ActionButton {
  label: string;
  className: string;
  action: 'select' | 'activate' | 'format' | null;
  disabled: boolean;
}

// コース状態ごとの設定の型を定義
interface StatusConfig {
  buttons: ActionButton[];
}

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  levelRequired?: number;
  rankRequired?: string;
  gradient: string;
  thumbnail?: string;
  onAction: (action: 'select' | 'activate' | 'format') => void;
  completion?: {
    badges?: {
      completion?: boolean;
      excellence?: boolean;
    };
  };
}

export function CourseCard({
  id,
  title,
  description,
  status,
  levelRequired,
  thumbnail,
  completion,
  rankRequired,
  gradient,
  onAction
}: CourseCardProps) {
  const { theme } = useTheme();

  // ボタン設定の取得関数
  const getButtonConfig = (): StatusConfig => {
    const configs: Record<CourseStatus, StatusConfig> = {
      failed: {
        buttons: [
          {
            label: '選択',
            className: 'bg-blue-500 hover:bg-blue-600',
            action: 'select',
            disabled: false
          },
          {
            label: 'データを初期化',
            className: 'bg-red-500 hover:bg-red-600',
            action: 'format',
            disabled: false
          }
        ]
      },
      restricted: {
        buttons: [{
          label: `${levelRequired ? `Lv${levelRequired}` : ''} ${rankRequired || ''}必要`,
          className: 'bg-gray-300 text-gray-500',
          disabled: true,
          action: null
        }]
      },
      blocked: {
        buttons: [{
          label: '他のコースが進行中',
          className: 'bg-gray-400 cursor-not-allowed',
          disabled: true,
          action: null
        }]
      },
      available: {
        buttons: [{
          label: 'コースを開始',
          className: 'bg-blue-500 hover:bg-blue-600',
          disabled: false,
          action: 'activate'
        }]
      },
      active: {
        buttons: [{
          label: '選択',
          className: 'bg-green-600 hover:bg-green-700',
          disabled: false,
          action: 'select'
        }]
      },
      completed: {
        buttons: [{
          label: '選択',
          className: 'bg-green-500 hover:bg-green-600',
          disabled: false,
          action: 'select'
        }]
      },
      perfect: {
        buttons: [{
          label: '選択',
          className: 'bg-purple-500 hover:bg-purple-600',
          disabled: false,
          action: 'select'
        }]
      }
    };
    return configs[status];
  };

  // ステータス情報の定義
  const getStatusInfo = () => {
    const statusConfig: Record<CourseStatus, {
      mainText: string;
      subText?: string;
      icon: string;
      bgColor: string;
      textColor: string;
      borderColor: string;
    }> = {
      restricted: {
        mainText: '条件未達成',
        icon: '🔒',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-300'
      },
      blocked: {
        mainText: '受講不可',
        subText: '他のコースが進行中',
        icon: '⛔',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-300'
      },
      available: {
        mainText: '受講可能',
        icon: '✨',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-200'
      },
      active: {
        mainText: '受講中',
        icon: '📚',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        borderColor: 'border-green-200'
      },
      completed: {
        mainText: '合格',
        subText: '単位取得済み',
        icon: '🎓',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        borderColor: 'border-green-200'
      },
      perfect: {
        mainText: '秀',
        subText: 'パーフェクト達成！',
        icon: '🏆',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600',
        borderColor: 'border-purple-200'
      },
      failed: {
        mainText: '不可',
        subText: '単位取得失敗',
        icon: '❌',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        borderColor: 'border-red-200'
      }
    };
    return statusConfig[status];
  };

  const config = getButtonConfig();

  const getGradientStyle = () => {
    if (status === 'perfect') {
      return 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient';
    }
    if (['completed', 'certified'].includes(status)) {
      return `${gradient} opacity-90`;
    }
    return gradient;
  };

  const renderThumbnailOrGradient = () => {
    if (thumbnail) {
      return (
        <div className="relative h-40 w-full">
          <img
            src={thumbnail}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-lg" />
        </div>
      );
    }
    return (
      <div className={`h-40 ${getGradientStyle()} relative`} />
    );
  };


  return (
    <div className={`relative ${
      theme === 'dark' 
        ? 'bg-gray-800' 
        : 'bg-white border border-[#DBEAFE] shadow-sm'
    } rounded-lg overflow-hidden ${
      status === 'restricted' ? 'opacity-75' : ''
    }`}>
      <div className={`h-40 ${getGradientStyle()} relative`}>
        {renderThumbnailOrGradient()}
        {status === 'perfect' && (
          <div className="absolute bottom-2 left-2 flex space-x-2">
            <span className="text-2xl animate-bounce">🏆</span>
          </div>
        )}
        {completion?.badges && (
          <div className="absolute bottom-2 left-2 flex space-x-2">
            {completion.badges.completion && (
              <span className={`text-2xl ${!completion.badges.excellence ? 'grayscale-[50%]' : ''}`}>
                🏆
              </span>
            )}
            {completion.badges.excellence && (
              <span className="text-2xl animate-bounce">⭐️</span>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className={`font-bold text-lg mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
        }`}>
          {title}
        </h3>
        <p className={`text-sm mb-4 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {description}
        </p>

        {/* ステータスバッジ */}
        <div className={`
          flex items-center gap-2 p-2 rounded-lg mb-4
          ${getStatusInfo().bgColor}
          ${getStatusInfo().textColor}
          border ${getStatusInfo().borderColor}
        `}>
          <span className="text-xl">{getStatusInfo().icon}</span>
          <div className="flex flex-col">
            <span className="font-semibold">
              {getStatusInfo().mainText}
            </span>
            {getStatusInfo().subText && (
              <span className="text-sm opacity-75">
                {getStatusInfo().subText}
              </span>
            )}
          </div>
        </div>

        {/* レベルと階級要件 */}
        {(levelRequired || rankRequired) && (
          <div className="flex items-center space-x-2 mb-4">
            {levelRequired && (
              <span className={theme === 'dark' ? 'text-blue-400' : 'text-[#3B82F6]'}>
                Lv.{levelRequired}
              </span>
            )}
            {levelRequired && rankRequired && (
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                かつ
              </span>
            )}
            {rankRequired && (
              <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>
                {rankRequired}階級
              </span>
            )}
          </div>
        )}

        {/* アクションボタン */}
        <div className={status === 'failed' ? 'grid grid-cols-3 gap-2' : ''}>
        {config.buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => button.action && onAction(button.action)}
            disabled={button.disabled}
            className={`w-full py-2 px-4 rounded-lg text-white ${button.className} ${
              button.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'gradient': 'gradient 3s ease infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'bounce': 'bounce 1s infinite',
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
        'fade-out-down': 'fade-out-down 0.3s ease-in forwards', // 追加
      },
      colors: {
        // プライマリカラー
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // セカンダリカラー
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // アクセントカラー
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-position': '0% 50%',
            'background-size': '200% 200%',
          },
          '50%': {
            'background-position': '100% 50%',
            'background-size': '200% 200%',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '200% 0',
            opacity: '0.9'
          },
          '50%': {
            backgroundPosition: '-200% 0',
            opacity: '1'
          },
          '100%': {
            backgroundPosition: '200% 0',
            opacity: '0.9'
          }
        },
        pulse: {
          '0%, 100%': {
            opacity: '1'
          },
          '50%': {
            opacity: '0.8'
          }
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'fade-out-down': {  // 追加
          '0%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(10px)'
          }
        }
      },
      backgroundSize: {
        'auto': 'auto',
        'cover': 'cover',
        'contain': 'contain',
        '200%': '200%',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  variants: {
    extend: {
      animation: ['hover', 'focus', 'group-hover'],
      backgroundSize: ['hover', 'focus'],
      opacity: ['disabled'],
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function({ addComponents, theme }) {
      addComponents({
        '.rich-text-editor': {
          position: 'relative',
          '&[contenteditable="true"]': {
            '&:empty:before': {
              content: 'attr(data-placeholder)',
              color: theme('colors.secondary.400'),
              position: 'absolute',
              pointerEvents: 'none',
              left: theme('spacing.4'),
              top: theme('spacing.4'),
            }
          }
        }
      });
    }
  ],
};
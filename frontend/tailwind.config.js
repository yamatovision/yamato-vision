/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  
extend: {
  animation: {
    gradient: 'gradient 3s ease infinite',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  keyframes: {
    gradient: {
      '0%, 100%': {
        'background-position': '0% 50%',
      },
      '50%': {
        'background-position': '100% 50%',
      },
    },
  },
},
};
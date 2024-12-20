import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        yamato: {
          light: {
            primary: '#3B82F6',
            secondary: '#1E40AF',
            background: '#F8FAFC',
            surface: '#FFFFFF',
          },
          dark: {
            primary: '#3B82F6',
            secondary: '#6366F1',
            background: '#111827',
            surface: '#1F2937',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0c',
        foreground: '#ededed',
        primary: {
          DEFAULT: '#e50914',
          hover: '#b80710',
        },
        surface: {
          DEFAULT: '#141419',
          light: '#1e1e26',
          border: '#2a2a36',
        },
      },
    },
  },
  plugins: [],
};
export default config;

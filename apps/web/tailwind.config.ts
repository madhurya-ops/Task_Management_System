import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        accent: '#334155',
        mist: '#f1f5f9'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        panel: '0 6px 18px rgba(15, 23, 42, 0.07)'
      }
    }
  },
  plugins: []
};

export default config;

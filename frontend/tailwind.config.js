import { heroui } from '@heroui/react';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: {
          primary: 'var(--app-primary)',
          'primary-strong': 'var(--app-primary-strong)',
          'primary-subtle': 'var(--app-primary-subtle)',
        },
        surface: {
          0: 'var(--surface-0)',
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
          glass: 'var(--surface-glass)',
        },
        border: {
          soft: 'var(--border-soft)',
          strong: 'var(--border-strong)',
          glass: 'var(--glass-border)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        status: {
          programmed: 'var(--color-programmed)',
          active: 'var(--color-active)',
          finished: 'var(--color-finished)',
          pending: 'var(--color-pending)',
          info: 'var(--color-info)',
          error: 'var(--color-error)',
          success: 'var(--color-success)',
        },
      },
      borderRadius: {
        'token-xs': 'var(--radius-xs)',
        'token-sm': 'var(--radius-sm)',
        'token-md': 'var(--radius-md)',
        'token-lg': 'var(--radius-lg)',
        'token-xl': 'var(--radius-xl)',
        'token-2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        'token-sm': 'var(--shadow-sm)',
        'token-md': 'var(--shadow-md)',
        'token-lg': 'var(--shadow-lg)',
        'token-glass': 'var(--glass-shadow)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [heroui()],
};

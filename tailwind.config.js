import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      colors: {
        ink: {
          DEFAULT: '#14171F',
          50: '#F5F6F8',
          100: '#E7E9EE',
          200: '#C7CBD6',
          300: '#9CA3B5',
          400: '#6B7386',
          500: '#4B5163',
          600: '#363B4A',
          700: '#262A36',
          800: '#1A1D26',
          900: '#14171F',
          950: '#0D0F15'
        },
        paper: {
          DEFAULT: '#FAFAF7',
          100: '#FFFFFF',
          200: '#F3F2EC'
        },
        signal: {
          DEFAULT: '#3B6FE3',
          50: '#EEF3FD',
          100: '#DCE7FB',
          400: '#5A87E8',
          500: '#3B6FE3',
          600: '#2A56C4',
          700: '#20439B'
        },
        amber: {
          DEFAULT: '#E8A33D',
          100: '#FBEBD1',
          500: '#E8A33D',
          600: '#C6842A'
        },
        good: '#3E8E5C',
        bad: '#C4483B'
      },
      boxShadow: {
        hairline: '0 0 0 1px rgba(20,23,31,0.08)'
      }
    }
  },
  plugins: [typography]
}

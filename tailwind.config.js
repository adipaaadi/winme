/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F4EDE0',
          50: '#FBF7EF',
          100: '#F4EDE0',
          200: '#E9DECA',
          300: '#D9CBB3',
          400: '#C2AE8B',
        },
        navy: {
          DEFAULT: '#14213D',
          50: '#F2F4F8',
          100: '#E4E8EF',
          200: '#C8D0DE',
          300: '#9EAAC1',
          400: '#71809E',
          500: '#4E5F7E',
          600: '#364A6B',
          700: '#263A58',
          800: '#1B2B47',
          900: '#14213D',
          950: '#0B1528',
        },
        coral: {
          DEFAULT: '#FF6B5B',
          50: '#FFF2F0',
          100: '#FFE1DD',
          200: '#FFC4BD',
          300: '#FFA197',
          400: '#FF8577',
          500: '#FF6B5B',
          600: '#E95445',
          700: '#C63C30',
          800: '#9E2E25',
          900: '#7A241D',
        },
        muted: 'rgba(244, 237, 224, 0.66)',
        line: 'rgba(244, 237, 224, 0.12)',
      },
      fontFamily: {
        sans: ['Outfit Variable', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(11, 21, 40, 0.35), 0 18px 44px -26px rgba(11, 21, 40, 0.9)',
        lift: '0 2px 6px rgba(11, 21, 40, 0.4), 0 30px 60px -30px rgba(11, 21, 40, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 560ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 360ms ease-out both',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontWeight: {
        normal: '400',
        medium: '500',
      },
    },
  },
  plugins: [],
};

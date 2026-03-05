/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          500: '#0f6fae',
          700: '#0b4f7e',
          900: '#07314f',
        },
      },
    },
  },
  plugins: [],
}
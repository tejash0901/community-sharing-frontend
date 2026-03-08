/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#060608',
        surface: '#0e0e12',
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          500: '#00e5ff',
          700: '#00b8cc',
          900: '#005c66',
        },
        accent: {
          500: '#b026ff',
          700: '#8b1ecc',
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s infinite alternate',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 10px rgba(0, 229, 255, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(176, 38, 255, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}

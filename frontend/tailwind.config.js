/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#14283F',
          light: '#203A56',
        },
        orange: {
          brand: '#F59E0B',
        },
        bg: '#F5F7FA',
        card: '#FFFFFF',
        'text-primary': '#172B3A',
        'text-secondary': '#64748B',
        success: '#16A34A',
        warning: '#D97706',
        critical: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

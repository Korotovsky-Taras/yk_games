/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    // Добавляем пути к файлам, где используются классы Tailwind
  ],
  darkMode: 'class', // или 'media' в зависимости от предпочтений
  theme: {
    screens: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        primary: {
          300: 'hsl(37, 100%, 65%)',
          400: 'hsl(37, 98%, 54%)',
          DEFAULT: 'hsl(37, 98%, 54%)', // Основной цвет по умолчанию
        },
        neutral: {
          200: 'hsl(203, 25%, 90%)',
          300: 'hsl(203, 28%, 79%)',
          400: 'hsl(205, 37%, 55%)',
          500: 'hsl(203, 22%, 55%)',
          700: 'hsl(205, 30%, 27%)',
          800: 'hsl(206, 45%, 15%)',
        },
        gray: {
          300: 'hsl(0, 0%, 95%)',
        },
        white: {
          DEFAULT: 'hsl(0, 0%, 99%)',
        },
      },
      transitionDuration: {
        0: '0ms',
      },
      width: {
        content: '327px',
        'content-xs': '420px',
        'content-sm': '524px',
        'content-md': '689px',
        'content-lg': '800px',
        'content-2xl': '1110px',
        grid: '327px',
        'grid-sm': '524px',
        'grid-md': '689px',
        dialog: '327px',
        'dialog-sm': '524px',
        'dialog-md': '654px',
      },
      minWidth: {
        dialog: '327px',
      },
      transitionProperty: {
        triangle: 'fill, height',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
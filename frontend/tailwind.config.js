/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da6ff',
          DEFAULT: '#0066cc',
          dark: '#004080',
        },
        secondary: {
          light: '#ffd699',
          DEFAULT: '#ffb84d',
          dark: '#cc8800',
        },
        accent: '#8a2be2',
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
        heading: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

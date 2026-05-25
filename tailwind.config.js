/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#198754',
        secondary: '#333'
      },
      // Thêm đoạn cấu hình font chữ dưới đây 👇
      fontFamily: {
        sans: [
          'Cambria',
          'serif',
        ],
      },
    },
  },
  plugins: [],
}
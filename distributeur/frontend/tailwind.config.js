/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan every files inside src
  ],
  theme: {
    extend: {
      colors: {
        background_color: "#e8c3cb", /* or #d5b0b8 */
      }
    },
  },
  plugins: [],
}


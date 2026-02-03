/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan tous les fichiers dans src
  ],
  theme: {
    extend: {
      colors: {
        background_color: "rgba(245, 113, 150, 0.15)", /* #F57196 at 15% opacity */
        // background_color: "#e8c3cb", /* or #d5b0b8 */
      }
    },
  },
  plugins: [],
}


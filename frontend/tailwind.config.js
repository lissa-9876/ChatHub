/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Dark/Light switch ke liye
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chathub: {
          green: '#22c55e',      // Accent Green from your prototype
          darkGreen: '#16a34a',
          darkBg: '#0f1416',     // App Main Dark Background
          darkCard: '#182023',   // Cards & Input Background
          darkBorder: '#27353a', // Subtle Borders
        }
      }
    },
  },
  plugins: [],
}
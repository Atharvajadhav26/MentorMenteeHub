/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e293b", // slate-800 - professional dark gray
        secondary: "#d97706", // amber-600 - subtle gold accent
        accent: "#771313", // WCE Maroon
        "accent-dark": "#4a0404", // WCE Deep Maroon
        background: "#f8fafc",
        surface: "#ffffff",
      }
    },
  },
  plugins: [],
}

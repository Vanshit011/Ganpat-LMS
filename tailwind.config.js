/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        primary: {
          light: "#d1fae5",
          DEFAULT: "#16a34a",
          dark: "#14532d",
        },
        ganpat: {
          green: "#1a6b3a",
          "green-mid": "#228B46",
          "green-light": "#2EAD5C",
          gold: "#D4A017",
          white: "#FFFFFF",
          "off-white": "#F7FDF9",
          gray: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease both",
        "slide-up": "slideUp 0.3s ease both",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(30px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      boxShadow: {
        premium:
          "0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 5px 15px -2px rgba(0, 0, 0, 0.02)",
        "green-glow": "0 15px 30px -5px rgba(22, 163, 74, 0.15)",
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

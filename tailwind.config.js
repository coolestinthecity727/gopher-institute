/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef2f7",
          100: "#d3ddec",
          200: "#a7bbda",
          300: "#7b98c7",
          400: "#4f76b5",
          500: "#2f5590",
          600: "#1c3d6e",
          700: "#122a4f",
          800: "#0c1e3a",
          900: "#081428",
        },
        rust: {
          50: "#fff3ea",
          100: "#ffe0c7",
          200: "#ffbd85",
          300: "#ff9a47",
          400: "#f57c1f",
          500: "#e8720c",
          600: "#c15c08",
          700: "#8f4407",
          800: "#5e2d05",
          900: "#341903",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "steel-weave":
          "linear-gradient(135deg, rgba(12,30,58,0.97) 0%, rgba(18,42,79,0.94) 45%, rgba(232,114,12,0.15) 100%)",
      },
    },
  },
  plugins: [],
};

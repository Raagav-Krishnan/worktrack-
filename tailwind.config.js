/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neo: "6px 6px 16px rgba(174, 174, 192, 0.3), -6px -6px 16px rgba(255, 255, 255, 0.8)",
        "neo-sm": "3px 3px 8px rgba(174, 174, 192, 0.3), -3px -3px 8px rgba(255, 255, 255, 0.8)",
        "neo-inset": "inset 3px 3px 8px rgba(174, 174, 192, 0.3), inset -3px -3px 8px rgba(255, 255, 255, 0.8)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.08)",
      },
      backdropBlur: {
        glass: "20px",
      },
      colors: {
        surface: "#f0eef5",
        soft: {
          indigo: "#7c7b9a",
          teal: "#6ba3a0",
          green: "#8bc78b",
          red: "#e8a0a0",
          amber: "#e8c87a",
          gray: "#b0afbe",
        },
      },
    },
  },
  plugins: [],
};

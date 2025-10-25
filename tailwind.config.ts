import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./styles/**/*.{ts,tsx,css}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        background: "var(--background)",
        surface: "var(--surface)",
        text: "var(--text)",
        border: "var(--border)"
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        display: ["DM Sans", ...fontFamily.sans]
      },
      boxShadow: {
        focus: "0 0 0 4px rgba(59, 130, 246, 0.25)"
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        }
      },
      animation: {
        "fade-in": "fade-in 150ms ease-in"
      }
    }
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")]
};

export default config;

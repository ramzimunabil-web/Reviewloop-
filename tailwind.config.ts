import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      colors: {
        ink: "#15130f",
        cream: "#faf6ef",
        sand: "#f0e9dc",
        clay: "#e7ddcb",
        moss: { DEFAULT: "#3a5a40", dark: "#2c4530", light: "#588157" },
        ember: { DEFAULT: "#bc6c25", light: "#dda15e" },
        line: "#e0d5c2",
      },
      borderRadius: { xl: "0.9rem", "2xl": "1.25rem" },
      boxShadow: {
        card: "0 1px 2px rgba(21,19,15,0.04), 0 8px 24px -12px rgba(21,19,15,0.12)",
        pop: "0 12px 40px -12px rgba(58,90,64,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both" },
    },
  },
  plugins: [],
};
export default config;

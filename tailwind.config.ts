import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cb: {
          lime: "#C9F13E",
          "lime-light": "#EAF8C4",
          "lime-hover": "#b8e12d",
          navy: "#042644",
          "navy-light": "#0a3a66",
          blue: "#1849C9",
          "blue-light": "#E3EBFA",
          mist: "#F4F6F8",
          "mist-card": "#F4F6F8",
          "mist-hover": "#EEF1F4",
          ink: "#000000",
          grey: "#6C6C6C",
          "grey-muted": "#50555C",
          "grey-light": "#E3E5E8",
          border: "#E3E5E8",
          red: "#E5484D",
        },
        brand: {
          50: "var(--brand-50, #eff6ff)",
          100: "var(--brand-100, #dbeafe)",
          200: "var(--brand-200, #bfdbfe)",
          300: "var(--brand-300, #93c5fd)",
          400: "var(--brand-400, #60a5fa)",
          500: "var(--brand-500, #3b82f6)",
          600: "var(--brand-600, #2563eb)",
          700: "var(--brand-700, #1d4ed8)",
          800: "var(--brand-800, #1e40af)",
          900: "var(--brand-900, #1e3a8a)",
        },
        surface: {
          0: "#ffffff",
          50: "#fafaf8",
          100: "#f4f3f0",
          200: "#e5e2db",
          800: "#292017",
          900: "#1a1410",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Geist", "Inter Tight", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Geist", "Inter Tight", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

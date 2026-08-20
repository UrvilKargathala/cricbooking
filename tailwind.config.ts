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
        brand: {
          50: "var(--brand-50, #fff7ed)",
          100: "var(--brand-100, #ffedd5)",
          200: "var(--brand-200, #fed7aa)",
          300: "var(--brand-300, #fdba74)",
          400: "var(--brand-400, #fb923c)",
          500: "var(--brand-500, #f97316)",
          600: "var(--brand-600, #ea580c)",
          700: "var(--brand-700, #c2410c)",
          800: "var(--brand-800, #9a3412)",
          900: "var(--brand-900, #7c2d12)",
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
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

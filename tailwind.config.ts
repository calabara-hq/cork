import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    darkMode: "class",
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent1: "var(--accent-1)",
        accent2: "var(--accent-2)",
        accent3: "var(--accent-3)",
        success: "var(--success)",
        error: "var(--error)",
        warning: "var(--warning)",
        warpcast: "var(--warpcast)",
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        spin: "spin 2s linear infinite"
      }
    },
    keyframes: ({ theme }) => ({
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
      spin: {
        "from": {
          transform: "rotate(0deg)"
        },
        "to": {
          transform: "rotate(360deg)"
        }
      }
    }),
  },
  plugins: [
    require('@tailwindcss/typography'),
    require("tailwindcss-animate"),
  ],
};
export default config;

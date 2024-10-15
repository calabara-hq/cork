import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent1: "var(--accent-1)",
        accent2: "var(--accent-2)",
        accent3: "var(--accent-3)",
      },
    },
  },
  plugins: [],
};
export default config;

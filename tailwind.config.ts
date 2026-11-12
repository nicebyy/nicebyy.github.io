import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Consolas",
          "Monaco",
          "monospace",
        ],
      },
      colors: {
        neon: {
          cyan: "#00f3ff",
          purple: "#b537f2",
          green: "#00ff9d",
          amber: "#ffb800",
          pink: "#ff2a85",
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 20px rgba(0, 243, 255, 0.25)",
        "neon-purple": "0 0 20px rgba(181, 55, 242, 0.25)",
        "neon-green": "0 0 20px rgba(0, 255, 157, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;

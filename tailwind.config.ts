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
        orbitron: [
          "var(--font-orbitron)",
          "SfHambakneun",
          "Orbit",
          "Oxanium",
          "sans-serif",
        ],
        chakra: [
          "var(--font-chakra)",
          "Oxanium",
          "Orbit",
          "SfHambakneun",
          "sans-serif",
        ],
        mono: [
          "'NeoDunggeunmo Pro'",
          "var(--font-mono)",
          "'Share Tech Mono'",
          "JetBrains Mono",
          "monospace",
        ],
        sans: [
          "Orbit",
          "var(--font-chakra)",
          "Oxanium",
          "sans-serif",
        ],
        cyber: [
          "SfHambakneun",
          "var(--font-orbitron)",
          "Orbit",
          "Oxanium",
          "sans-serif",
        ],
        pixel: [
          "'NeoDunggeunmo Pro'",
          "monospace",
        ],
      },
      colors: {
        neon: {
          cyan: "#00f3ff",
          purple: "#b537f2",
          pink: "#ff007f",
          green: "#00ff9d",
          amber: "#ffb800",
          yellow: "#ffe600",
        },
      },
      boxShadow: {
        "neon-cyan": "0 0 15px rgba(0, 243, 255, 0.45), 0 0 30px rgba(0, 243, 255, 0.2)",
        "neon-pink": "0 0 15px rgba(255, 0, 127, 0.45), 0 0 30px rgba(255, 0, 127, 0.2)",
        "neon-purple": "0 0 15px rgba(181, 55, 242, 0.45), 0 0 30px rgba(181, 55, 242, 0.2)",
        "neon-green": "0 0 15px rgba(0, 255, 157, 0.45), 0 0 30px rgba(0, 255, 157, 0.2)",
        "neon-inset-cyan": "inset 0 0 15px rgba(0, 243, 255, 0.25)",
      },
      animation: {
        "neon-flicker": "neon-flicker 3s infinite",
        "neon-pulse": "neon-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanline": "scanline 8s linear infinite",
        "cyber-glow": "cyber-glow 4s ease-in-out infinite alternate",
      },
      keyframes: {
        "neon-flicker": {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": {
            opacity: "1",
            filter: "drop-shadow(0 0 8px currentColor) drop-shadow(0 0 20px currentColor)",
          },
          "20%, 24%, 55%": {
            opacity: "0.45",
            filter: "none",
          },
        },
        "neon-pulse": {
          "0%, 100%": {
            opacity: "1",
            filter: "drop-shadow(0 0 12px currentColor)",
          },
          "50%": {
            opacity: "0.75",
            filter: "drop-shadow(0 0 4px currentColor)",
          },
        },
        "scanline": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        "cyber-glow": {
          "0%": {
            boxShadow: "0 0 15px rgba(0, 243, 255, 0.3), inset 0 0 15px rgba(0, 243, 255, 0.15)",
            borderColor: "rgba(0, 243, 255, 0.6)",
          },
          "100%": {
            boxShadow: "0 0 25px rgba(255, 0, 127, 0.4), inset 0 0 20px rgba(255, 0, 127, 0.2)",
            borderColor: "rgba(255, 0, 127, 0.7)",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;

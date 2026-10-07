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
        oled: {
          DEFAULT: "#000000",
          surface: "#09090b",
          card: "#121216",
          border: "#27272a",
          muted: "#71717a",
        },
        signal: {
          gaz: "#f59e0b", // Amber / Gas
          voie: "#ef4444", // Red / Blocked Street
          point: "#8b5cf6", // Purple / Citizen Gathering / Static Block
          medic: "#10b981", // Emerald / Medical Relief
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          "monospace",
        ],
      },
      spacing: {
        safe: "env(safe-area-inset-bottom, 16px)",
      },
    },
  },
  plugins: [],
};

export default config;


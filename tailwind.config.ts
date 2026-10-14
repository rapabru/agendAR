import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: {
          DEFAULT: "#0c0d12",
          subtle: "#101118",
        },
        surface: {
          50: "#222533",
          100: "#1c1e2b",
          200: "#161822",
          300: "#12131a",
          DEFAULT: "#141620",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.05)",
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          strong: "rgba(255, 255, 255, 0.15)",
        },
        notion: {
          bg: "#0c0d12",
          sidebar: "#111218",
          hover: "#181a24",
          border: "rgba(255, 255, 255, 0.07)",
          text: "#f0f2f7",
          subtle: "#949aa8",
          blue: "#38bdf8",
          red: "#f43f5e",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
